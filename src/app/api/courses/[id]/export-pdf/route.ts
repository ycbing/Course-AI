import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "缺少 courseId" }, { status: 400 });
    }

    const course = await queryOne<any>(
      `SELECT * FROM courses WHERE id = $1 AND user_id = $2`,
      [courseId, userId]
    );
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 });
    }

    // TODO: Generate A4 landscape PDF with pdfkit
    // Content: course title + each section title/content/illustration

    return NextResponse.json({ message: "PDF导出功能开发中" });
  } catch (err) {
    console.error("Export PDF error:", err);
    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }
}
