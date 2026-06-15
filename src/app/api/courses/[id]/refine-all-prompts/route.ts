import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne, query } from "@/lib/db";
import { refineImagePrompt } from "@/lib/ai/glm-client";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-refine-all-prompts");

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
    const { id: courseId } = await params;

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

    // Get all sections
    const sections = await query<any>(
      `SELECT id, title, content FROM course_sections WHERE course_id = $1 ORDER BY section_number`,
      [courseId]
    );

    if (!sections || sections.length === 0) {
      return NextResponse.json({ error: "没有教学段落" }, { status: 400 });
    }

    // Refine each section's prompt
    const results: Array<{ sectionId: string; success: boolean; error?: string }> = [];

    for (const section of sections) {
      try {
        const refinedPrompt = await refineImagePrompt(
          section.title,
          section.content,
          course.subject,
          course.visual_style
        );

        await query(
          `UPDATE course_sections SET image_prompt = $1 WHERE id = $2`,
          [refinedPrompt, section.id]
        );

        results.push({ sectionId: section.id, success: true });
      } catch (err) {
        log.error(`Refine failed for section ${section.id}`, { error: String(err) });
        results.push({ sectionId: section.id, success: false, error: String(err) });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;

    log.info("Batch refine complete", { courseId, success: successCount, fail: failCount });

    return NextResponse.json({
      success: true,
      total: results.length,
      successCount,
      failCount,
      results,
    });
  } catch (err) {
    log.error("Refine all prompts error", { error: String(err) });
    return NextResponse.json(
      { error: "批量精化失败: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
