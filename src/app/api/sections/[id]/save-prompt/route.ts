import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne, query } from "@/lib/db";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-save-prompt");

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    const { id: sectionId } = await params;
    const { imagePrompt } = await req.json();

    if (!sectionId || !imagePrompt) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    // Check ownership
    const section = await queryOne<any>(
      `SELECT cs.course_id FROM course_sections cs JOIN courses c ON cs.course_id = c.id WHERE cs.id = $1 AND c.user_id = $2`,
      [sectionId, userId]
    );

    if (!section) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    // Update prompt
    await query(
      `UPDATE course_sections SET image_prompt = $1 WHERE id = $2`,
      [imagePrompt, sectionId]
    );

    log.info("Prompt saved", { sectionId });

    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Save prompt error", { error: String(err) });
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
