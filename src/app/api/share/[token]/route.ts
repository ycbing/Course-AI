import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { getSignedCosUrl } from "@/lib/cos";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-share");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const course = await queryOne<any>(
      `SELECT id, title, subject, grade, status, video_url, cover_url, duration,
              section_count, share_count, created_at
       FROM courses WHERE share_token = $1`,
      [token]
    );
    if (!course) {
      return NextResponse.json({ error: "分享内容不存在" }, { status: 404 });
    }

    const sections = await query<any>(
      `SELECT section_number, title, content, image_url FROM course_sections WHERE course_id = $1 ORDER BY section_number`,
      [course.id]
    );

    // Increment share count
    await queryOne(
      `UPDATE courses SET share_count = share_count + 1 WHERE id = $1 RETURNING id`,
      [course.id]
    );

    // Sign URLs
    const videoUrl = course.video_url?.includes("cos.")
      ? getSignedCosUrl(course.video_url.split(".myqcloud.com/")[1], 7200)
      : course.video_url;

    return NextResponse.json({
      course: { ...course, video_url: videoUrl },
      sections,
    });
  } catch (err) {
    log.error("Share error", { error: String(err) });
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
