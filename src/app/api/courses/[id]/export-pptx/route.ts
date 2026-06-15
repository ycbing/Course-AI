import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { query, queryOne, deductCredits } from "@/lib/db";
import { uploadFileToCos, courseCosKey } from "@/lib/cos";
import { generatePptx, SlideData } from "@/lib/ai/pptx-generator";
import path from "path";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-export-pptx");

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "缺少 courseId" }, { status: 400 });
    }

    // Get course
    const course = await queryOne<any>(
      `SELECT * FROM courses WHERE id = $1 AND user_id = $2`,
      [courseId, userId]
    );
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    // Check credits
    const user = await queryOne<{ credits: number }>(
      `SELECT credits FROM users WHERE id = $1`,
      [userId]
    );
    if (!user || user.credits < 5) {
      return NextResponse.json(
        { error: "积分不足，导出需要 5 积分", code: "INSUFFICIENT_CREDITS" },
        { status: 402 }
      );
    }

    // Get sections
    const sections = await query<any>(
      `SELECT * FROM course_sections WHERE course_id = $1 ORDER BY section_number`,
      [courseId]
    );

    if (sections.length === 0) {
      return NextResponse.json({ error: "课程没有章节内容" }, { status: 400 });
    }

    // Determine theme
    const theme = (course.theme || "business") as "business" | "education" | "minimal" | "tech";

    // Build slide data
    const slides: SlideData[] = [];

    // Cover slide
    slides.push({
      layout: "cover",
      title: course.title || "课程标题",
      subtitle: course.subject ? `${course.subject}${course.grade ? ` · ${course.grade}` : ""}` : "",
    });

    // Section slides - alternate between image-left and text-only based on whether image exists
    for (const section of sections) {
      const hasImage = !!section.image_url;
      const layout: SlideData["layout"] = hasImage ? "image-left" : "text-only";

      // Parse content into bullets (split by newlines or periods)
      const bullets: string[] = [];
      const content = section.content || "";
      const sentences = content.split(/[。\n！？]/).filter((s: string) => s.trim().length > 5);
      if (sentences.length > 0) {
        for (let i = 0; i < Math.min(sentences.length, 5); i++) {
          bullets.push(sentences[i].trim());
        }
      }

      slides.push({
        layout,
        title: section.title,
        content: bullets.length > 0 ? undefined : content.substring(0, 300),
        imageUrl: hasImage ? section.image_url : undefined,
        bullets: bullets.length > 0 ? bullets : undefined,
        sectionNumber: section.section_number,
      });
    }

    // Ending slide
    slides.push({
      layout: "ending",
      title: "谢谢观看",
      subtitle: course.title,
    });

    // Generate PPTX
    const outputPath = path.join(
      process.cwd(),
      "tmp",
      `pptx_${courseId}_${Date.now()}.pptx`
    );

    const result = await generatePptx({
      title: course.title,
      author: course.outline ? "" : "",
      theme,
      outputPath,
      slides,
    });

    if (!result.success) {
      log.error("PPTX generation failed", { error: result.error, courseId });
      return NextResponse.json(
        { error: `PPTX 生成失败: ${result.error || "未知错误"}` },
        { status: 500 }
      );
    }

    // Upload to COS
    const cosKey = courseCosKey(courseId, "image").replace("image.jpg", `course.pptx`);
    const pptxUrl = await uploadFileToCos(outputPath, cosKey);

    // Update course record
    await queryOne(
      `UPDATE courses SET pptx_url = $1, theme = $2, status = 'completed', progress_step = 'pptx_ready', updated_at = NOW() WHERE id = $3 RETURNING id`,
      [pptxUrl, theme, courseId]
    );

    // Deduct credits
    await deductCredits(userId, 5, "export_pptx", courseId, {
      title: course.title,
      slideCount: result.slideCount,
    });

    // Clean up temp file
    try {
      const { unlink } = await import("fs/promises");
      await unlink(outputPath);
    } catch {
      // ignore
    }

    log.info("PPTX exported successfully", {
      courseId,
      slideCount: result.slideCount,
      cosKey,
    });

    // Return proxy URL instead of direct COS URL (private bucket)
    const downloadUrl = `/api/cos/${cosKey}`;

    return NextResponse.json({
      success: true,
      pptxUrl: downloadUrl,
      downloadUrl,
      slideCount: result.slideCount,
      theme,
    });
  } catch (err) {
    log.error("Export PPTX error", { error: String(err) });
    return NextResponse.json({ error: "导出 PPTX 失败" }, { status: 500 });
  }
}
