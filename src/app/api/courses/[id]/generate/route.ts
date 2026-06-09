import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne, query } from "@/lib/db";
import { deductCredits } from "@/lib/db";
import { generateTeachingScript } from "@/lib/ai/glm-client";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-generate");

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const { courseId, sectionCount } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "缺少 courseId" }, { status: 400 });
    }

    // Verify ownership
    const course = await queryOne<any>(
      `SELECT * FROM courses WHERE id = $1 AND user_id = $2`,
      [courseId, userId]
    );
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    // Check credits (10 credits for script generation)
    const user = await queryOne<{ credits: number }>(
      `SELECT credits FROM users WHERE id = $1`,
      [userId]
    );
    if (!user || user.credits < 10) {
      return NextResponse.json({ error: "积分不足，生成文案需要 10 积分", code: "INSUFFICIENT_CREDITS" }, { status: 402 });
    }

    // Update status
    await query(
      `UPDATE courses SET status = 'generating', progress_step = 'generating_script', updated_at = NOW() WHERE id = $1`,
      [courseId]
    );

    // Generate teaching script
    const visualStyle = course.visual_style || "classic";
    const { getVisualTemplateById } = await import("@/data/visual-templates");
    const vTemplate = getVisualTemplateById(visualStyle);
    const stylePrompt = vTemplate?.imageStylePrompt || "";

    const sections = await generateTeachingScript(
      course.title,
      course.subject,
      course.grade,
      course.outline,
      sectionCount || 5,
      stylePrompt
    );

    // Insert sections
    for (let i = 0; i < sections.length; i++) {
      await query(
        `INSERT INTO course_sections (id, course_id, section_number, title, content, image_prompt, sort_order)
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6)`,
        [courseId, i + 1, sections[i].title, sections[i].content, sections[i].imagePrompt, i]
      );
    }

    // Deduct credits
    await deductCredits(userId, 10, "generate_script", courseId, {
      title: course.title,
      section_count: sections.length,
    });

    // Update course
    await query(
      `UPDATE courses SET status = 'draft', progress_step = 'script_ready', section_count = $2, updated_at = NOW() WHERE id = $1`,
      [courseId, sections.length]
    );

    log.info("Script generated", { courseId, sectionCount: sections.length });

    return NextResponse.json({
      success: true,
      sections: sections.map((s, i) => ({
        sectionNumber: i + 1,
        title: s.title,
        content: s.content,
        imagePrompt: s.imagePrompt,
      })),
    });
  } catch (err) {
    log.error("Generate error", { error: String(err) });
    // Update course error status
    const { courseId } = await req.json().catch(() => ({}));
    if (courseId) {
      await query(`UPDATE courses SET status = 'error', error_message = $2, updated_at = NOW() WHERE id = $1`, [courseId, String(err)]);
    }
    return NextResponse.json({ error: "生成失败: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
