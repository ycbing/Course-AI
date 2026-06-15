import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne, query } from "@/lib/db";
import { deductCredits } from "@/lib/db";
import { generateImage } from "@/lib/ai/glm-client";
import { uploadFileToCos } from "@/lib/cos";
import { createLogger } from "@/lib/logger";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const log = createLogger("api-illustrations");

/**
 * Download remote image and upload to COS for permanent storage.
 * Returns the COS URL, or falls back to the original URL.
 */
async function persistImage(url: string, courseId: string, sectionNum: number): Promise<string> {
  try {
    // Download image
    const resp = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!resp.ok) return url;
    const buffer = Buffer.from(await resp.arrayBuffer());
    if (buffer.length < 1000) return url;

    // Determine extension
    const ext = buffer[0] === 0x89 ? ".png" : ".jpg";
    const tmpPath = path.join(process.cwd(), "tmp", `img_${crypto.randomUUID()}${ext}`);
    await fs.mkdir(path.dirname(tmpPath), { recursive: true });
    await fs.writeFile(tmpPath, buffer);

    // Upload to COS
    const cosKey = `courses/${courseId}/section_${sectionNum}${ext}`;
    const cosUrl = await uploadFileToCos(tmpPath, cosKey);

    // Clean up temp file
    await fs.unlink(tmpPath).catch(() => {});

    return cosUrl || url;
  } catch (err) {
    log.warn("Image persist failed, using original URL", { error: String(err) });
    return url;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
    const { courseId, sectionIndex, imagePrompt } = await req.json();

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

    // Single image mode (with sectionIndex)
    if (sectionIndex !== undefined && imagePrompt) {
      // Check credits (3 credits per illustration)
      const user = await queryOne<{ credits: number }>(
        `SELECT credits FROM users WHERE id = $1`,
        [userId]
      );
      if (!user || user.credits < 3) {
        return NextResponse.json({ error: "积分不足，生成配图需要 3 积分/张", code: "INSUFFICIENT_CREDITS" }, { status: 402 });
      }

      await query(
        `UPDATE courses SET status = 'generating', progress_step = 'generating_images', updated_at = NOW() WHERE id = $1`,
        [courseId]
      );

      const imageUrl = await generateImage(imagePrompt, "1024x1024");

      // Persist to COS for permanent storage
      const storedUrl = await persistImage(imageUrl, courseId, sectionIndex + 1);

      await deductCredits(userId, 3, "generate_image", courseId, {
        section_index: sectionIndex,
        prompt: imagePrompt,
      });

      await query(
        `UPDATE course_sections SET image_url = $1, image_prompt = $2 WHERE course_id = $3 AND section_number = $4`,
        [storedUrl, imagePrompt, courseId, sectionIndex + 1]
      );

      // Check if all sections have images, update status accordingly
      const remaining = await query<any>(
        `SELECT COUNT(*) as missing FROM course_sections WHERE course_id = $1 AND (image_url IS NULL OR image_url = '')`,
        [courseId]
      );
      if (remaining[0]?.missing === 0) {
        await query(
          `UPDATE courses SET status = 'images_ready', progress_step = 'images_ready', updated_at = NOW() WHERE id = $1`,
          [courseId]
        );
      } else {
        await query(
          `UPDATE courses SET status = 'draft', progress_step = 'script_ready', updated_at = NOW() WHERE id = $1`,
          [courseId]
        );
      }

      return NextResponse.json({ success: true, imageUrl: storedUrl });
    }

    // Batch mode: generate for all sections
    const sections = await query<any>(
      `SELECT id, section_number, image_prompt FROM course_sections WHERE course_id = $1 ORDER BY section_number`,
      [courseId]
    );

    if (!sections || sections.length === 0) {
      return NextResponse.json({ error: "没有教学段落，请先生成文案" }, { status: 400 });
    }

    // Check credits
    const user = await queryOne<{ credits: number }>(
      `SELECT credits FROM users WHERE id = $1`,
      [userId]
    );
    if (!user || user.credits < sections.length * 3) {
      return NextResponse.json({ error: `积分不足，需要 ${sections.length * 3} 积分（3积分/张 × ${sections.length}张）`, code: "INSUFFICIENT_CREDITS" }, { status: 402 });
    }

    await query(
      `UPDATE courses SET status = 'generating', progress_step = 'generating_images', updated_at = NOW() WHERE id = $1`,
      [courseId]
    );

    const illustrations: Array<{
      sectionNumber: number;
      imageUrl: string;
    }> = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const prompt = section.image_prompt || `Educational illustration about ${course.title}, section ${i + 1}, detailed and clear, teaching material style`;

      try {
        const imageUrl = await generateImage(prompt, "1024x1024");

        // Persist to COS
        const storedUrl = await persistImage(imageUrl, courseId, section.section_number);

        await query(
          `UPDATE course_sections SET image_url = $1 WHERE course_id = $2 AND section_number = $3`,
          [storedUrl, courseId, section.section_number]
        );

        illustrations.push({
          sectionNumber: section.section_number,
          imageUrl: storedUrl,
        });
      } catch (imgErr) {
        log.error(`Image failed for section ${section.section_number}`, { error: String(imgErr) });
        illustrations.push({
          sectionNumber: section.section_number,
          imageUrl: "",
        });
      }
    }

    // Deduct credits
    await deductCredits(userId, sections.length * 3, "generate_images_batch", courseId, {
      count: sections.length,
    });

    await query(
      `UPDATE courses SET status = 'images_ready', progress_step = 'images_ready', updated_at = NOW() WHERE id = $1`,
      [courseId]
    );

    log.info("Batch images generated", { courseId, count: illustrations.length });
    return NextResponse.json({ success: true, illustrations });
  } catch (err) {
    log.error("Image generation error", { error: String(err) });
    const { courseId: cid } = await req.json().catch(() => ({}));
    if (cid) {
      await query(
        `UPDATE courses SET status = 'error', error_message = $2, updated_at = NOW() WHERE id = $1`,
        [cid, String(err)]
      ).catch(() => {});
    }
    return NextResponse.json({ error: "配图生成失败: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
