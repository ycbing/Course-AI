import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { query, queryOne } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

/* ─── PUT: update section title / content ─── */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const body = await req.json();

    // Verify ownership via course
    const section = await queryOne<{ id: string; course_id: string }>(
      `SELECT cs.id, cs.course_id FROM course_sections cs
       JOIN courses c ON c.id = cs.course_id
       WHERE cs.id = $1 AND c.user_id = $2`,
      [id, userId]
    );
    if (!section) {
      return NextResponse.json({ error: "章节不存在" }, { status: 404 });
    }

    const allowed = ["title", "content", "imagePrompt", "image_url"];
    const setClauses: string[] = [];
    const values: any[] = [];

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

    const updated = await queryOne<any>(
      `UPDATE course_sections SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    return NextResponse.json({ section: updated });
  } catch (err) {
    console.error("Update section error:", err);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

/* ─── DELETE: delete a single section ─── */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();

    const section = await queryOne<{ id: string; course_id: string; section_number: number }>(
      `SELECT cs.id, cs.course_id, cs.section_number FROM course_sections cs
       JOIN courses c ON c.id = cs.course_id
       WHERE cs.id = $1 AND c.user_id = $2`,
      [id, userId]
    );
    if (!section) {
      return NextResponse.json({ error: "章节不存在" }, { status: 404 });
    }

    const deletedNumber = section.section_number;
    const courseId = section.course_id;

    await query(`DELETE FROM course_sections WHERE id = $1`, [id]);

    // Re-number remaining sections
    await query(
      `UPDATE course_sections SET section_number = section_number - 1
       WHERE course_id = $1 AND section_number > $2`,
      [courseId, deletedNumber]
    );

    // Update course section count
    const [{ count }] = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM course_sections WHERE course_id = $1`,
      [courseId]
    );
    await query(
      `UPDATE courses SET section_count = $2, updated_at = NOW() WHERE id = $1`,
      [courseId, parseInt(count, 10)]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete section error:", err);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

/* ─── PATCH: reorder section ─── */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const { newSortOrder } = await req.json();

    if (newSortOrder === undefined || typeof newSortOrder !== "number") {
      return NextResponse.json({ error: "缺少 newSortOrder 参数" }, { status: 400 });
    }

    const section = await queryOne<{ id: string; course_id: string }>(
      `SELECT cs.id, cs.course_id FROM course_sections cs
       JOIN courses c ON c.id = cs.course_id
       WHERE cs.id = $1 AND c.user_id = $2`,
      [id, userId]
    );
    if (!section) {
      return NextResponse.json({ error: "章节不存在" }, { status: 404 });
    }

    await query(
      `UPDATE course_sections SET sort_order = $1, section_number = $1 WHERE id = $2`,
      [newSortOrder, id]
    );

    // Re-number all sections in order
    const allSections = await query<{ id: string }>(
      `SELECT id FROM course_sections WHERE course_id = $1 ORDER BY sort_order, section_number`,
      [section.course_id]
    );
    for (let i = 0; i < allSections.length; i++) {
      await query(
        `UPDATE course_sections SET section_number = $1, sort_order = $1 WHERE id = $2`,
        [i + 1, allSections[i].id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reorder section error:", err);
    return NextResponse.json({ error: "排序失败" }, { status: 500 });
  }
}
