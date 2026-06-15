import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne, query } from "@/lib/db";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-course-sections");

/* ─── GET: list sections for a course ─── */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    // Verify ownership
    const course = await queryOne<{ id: string }>(
      `SELECT id FROM courses WHERE id = $1 AND user_id = $2`,
      [courseId, userId]
    );
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    const sections = await query<any>(
      `SELECT id, section_number, title, content, image_prompt, image_url, audio_url, duration, sort_order
       FROM course_sections WHERE course_id = $1 ORDER BY section_number`,
      [courseId]
    );

    return NextResponse.json({ sections });
  } catch (err) {
    log.error("Get course sections error", { error: String(err) });
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

/* ─── PUT: update a section within a course ─── */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const body = await req.json();
    const { sectionId, title, content, imagePrompt, imageUrl } = body;

    if (!sectionId) {
      return NextResponse.json({ error: "缺少 sectionId" }, { status: 400 });
    }

    // Verify ownership via course
    const section = await queryOne<{ id: string; course_id: string }>(
      `SELECT cs.id, cs.course_id FROM course_sections cs
       JOIN courses c ON c.id = cs.course_id
       WHERE cs.id = $1 AND c.user_id = $2 AND c.id = $3`,
      [sectionId, userId, courseId]
    );
    if (!section) {
      return NextResponse.json({ error: "章节不存在" }, { status: 404 });
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];

    if (title !== undefined) {
      setClauses.push(`title = $${values.length + 2}`);
      values.push(title);
    }
    if (content !== undefined) {
      setClauses.push(`content = $${values.length + 2}`);
      values.push(content);
    }
    if (imagePrompt !== undefined) {
      setClauses.push(`image_prompt = $${values.length + 2}`);
      values.push(imagePrompt);
    }
    if (imageUrl !== undefined) {
      setClauses.push(`image_url = $${values.length + 2}`);
      values.push(imageUrl);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "没有可更新的字段" }, { status: 400 });
    }

    const updated = await queryOne<any>(
      `UPDATE course_sections SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
      [sectionId, ...values]
    );

    log.info("Section updated", { sectionId, courseId, fields: Object.keys(body) });
    return NextResponse.json({ section: updated });
  } catch (err) {
    log.error("Update course section error", { error: String(err) });
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
