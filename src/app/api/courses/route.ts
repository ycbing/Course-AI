import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { query, queryOne } from "@/lib/db";
import crypto from "crypto";
import { createLogger } from "@/lib/logger";
import { getTemplateById } from "@/data/textbook-templates";

const log = createLogger("api-courses");

/* ─── GET: list courses ─── */
export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
    const rows = await query<any>(
      `SELECT c.id, c.title, c.subject, c.grade, c.status, c.progress_step, c.section_count,
              COALESCE(NULLIF(c.cover_url, ''), first_img.image_url) as cover_url,
              c.video_url, c.duration, c.share_token, c.share_count,
              c.created_at, c.updated_at
       FROM courses c
       LEFT JOIN LATERAL (
         SELECT image_url FROM course_sections cs
         WHERE cs.course_id = c.id AND cs.image_url IS NOT NULL AND cs.image_url != ''
         ORDER BY cs.section_number LIMIT 1
       ) first_img ON true
       WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
      [userId]
    );
    return NextResponse.json({ courses: rows });
  } catch (err) {
    log.error("List courses error", { error: String(err) });
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

/* ─── POST: create course ─── */
export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
    const { title, subject, grade, outline, voiceName, textbookTemplateId, chapterIndices, visualStyle } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "请输入课程标题" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const shareToken = crypto.randomBytes(16).toString("hex");

    const course = await queryOne<any>(
      `INSERT INTO courses (id, user_id, title, subject, grade, outline, voice_name, status, progress_step, share_token, textbook_template_id, visual_style)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [id, userId, title.trim(), subject || null, grade || null, outline || null, voiceName || "zh-CN-YunyangNeural", "draft", "created", shareToken, textbookTemplateId || "", visualStyle || "classic"]
    );

    // 一键导入教材章节
    if (textbookTemplateId && chapterIndices && chapterIndices.length > 0) {
      const template = getTemplateById(textbookTemplateId);
      if (template) {
        const selectedChapters = template.chapters.filter((_, i) => chapterIndices.includes(i));
        for (let i = 0; i < selectedChapters.length; i++) {
          const ch = selectedChapters[i];
          const content = ch.topics.map((t, j) => `${j + 1}. ${t}`).join("\n") +
            "\n\n重点难点：" + ch.keyPoints.join("；");
          await query(
            `INSERT INTO course_sections (id, course_id, section_number, title, content, sort_order)
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5)`,
            [id, i + 1, ch.title, content, i]
          );
        }
        await query(
          `UPDATE courses SET section_count = $2, progress_step = 'script_ready', updated_at = NOW() WHERE id = $1`,
          [id, selectedChapters.length]
        );
      }
    }

    log.info("Course created", { courseId: id, title });
    return NextResponse.json({ course });
  } catch (err) {
    log.error("Create course error", { error: String(err) });
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
