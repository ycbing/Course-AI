import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne } from "@/lib/db";
import { refineImagePrompt } from "@/lib/ai/glm-client";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-refine-prompt");

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    const { id: sectionId } = await params;

    if (!sectionId) {
      return NextResponse.json({ error: "缺少 sectionId" }, { status: 400 });
    }

    // Get section info
    const section = await queryOne<any>(
      `SELECT cs.*, c.subject, c.visual_style, c.title as course_title
       FROM course_sections cs
       JOIN courses c ON cs.course_id = c.id
       WHERE cs.id = $1`,
      [sectionId]
    );

    if (!section) {
      return NextResponse.json({ error: "段落不存在" }, { status: 404 });
    }

    // Check ownership
    const course = await queryOne<any>(
      `SELECT user_id FROM courses WHERE id = $1`,
      [section.course_id]
    );
    if (course?.user_id !== userId) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // Refine the prompt (no credit deduction)
    const refinedPrompt = await refineImagePrompt(
      section.title,
      section.content,
      section.subject,
      section.visual_style
    );

    // Update database
    const { query } = await import("@/lib/db");
    await query(
      `UPDATE course_sections SET image_prompt = $1 WHERE id = $2`,
      [refinedPrompt, sectionId]
    );

    log.info("Prompt refined", { sectionId, promptLength: refinedPrompt.length });

    return NextResponse.json({ success: true, imagePrompt: refinedPrompt });
  } catch (err) {
    log.error("Refine prompt error", { error: String(err) });
    return NextResponse.json(
      { error: "提示词精化失败: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}
