import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { query, queryOne } from "@/lib/db";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-course-detail");

/* ─── GET: course detail ─── */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const course = await queryOne<any>(
      `SELECT * FROM courses WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    const sections = await query<any>(
      `SELECT * FROM course_sections WHERE course_id = $1 ORDER BY section_number`,
      [id]
    );

    return NextResponse.json({ course, sections });
  } catch (err) {
    log.error("Get course error", { error: String(err) });
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

/* ─── PATCH: update course ─── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
    const body = await req.json();

    // Verify ownership
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM courses WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!existing) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    const allowed = ["title", "subject", "grade", "outline", "voiceName", "voiceRate", "videoAspect", "status", "progressStep", "sectionCount", "videoUrl", "pdfUrl", "pptxUrl", "theme", "coverUrl", "duration", "errorMessage", "textbookTemplateId", "visualStyle", "quizData"];
    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        const col = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        setClauses.push(`${col} = $${values.length + 2}`);
        values.push(body[key]);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "没有可更新的字段" }, { status: 400 });
    }

    values.push(new Date().toISOString());
    setClauses.push(`updated_at = $${values.length + 1}`);

    const updated = await queryOne<any>(
      `UPDATE courses SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    log.info("Course updated", { courseId: id, fields: Object.keys(body) });
    return NextResponse.json({ course: updated });
  } catch (err) {
    log.error("Update course error", { error: String(err) });
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

/* ─── DELETE: delete course ─── */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM courses WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!existing) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    await query(`DELETE FROM course_sections WHERE course_id = $1`, [id]);
    await query(`DELETE FROM courses WHERE id = $1`, [id]);

    log.info("Course deleted", { courseId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Delete course error", { error: String(err) });
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
