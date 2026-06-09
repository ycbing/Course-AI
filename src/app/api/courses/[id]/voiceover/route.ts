import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne, query } from "@/lib/db";
import { deductCredits } from "@/lib/db";
import { generateVoiceover } from "@/lib/ai/tts";
import { uploadFileToCos } from "@/lib/cos";
import path from "path";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-voiceover");

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const { courseId, voiceName, voiceRate } = await req.json();

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

    // Check credits (5 credits for voiceover)
    const user = await queryOne<{ credits: number }>(
      `SELECT credits FROM users WHERE id = $1`,
      [userId]
    );
    if (!user || user.credits < 5) {
      return NextResponse.json({ error: "积分不足，生成配音需要 5 积分", code: "INSUFFICIENT_CREDITS" }, { status: 402 });
    }

    const voice = voiceName || course.voice_name || "zh-CN-YunyangNeural";
    const rate = voiceRate ? `${voiceRate > 1 ? "+" : ""}${Math.round((voiceRate - 1) * 100)}%` : "+0%";

    // Update status
    await query(
      `UPDATE courses SET status = 'generating', progress_step = 'generating_voice', updated_at = NOW() WHERE id = $1`,
      [courseId]
    );

    // Get all sections
    const sections = await query<any>(
      `SELECT id, section_number, content, audio_url FROM course_sections WHERE course_id = $1 ORDER BY section_number`,
      [courseId]
    );

    const results: Array<{ sectionNumber: number; audioUrl: string; duration: number }> = [];

    for (const section of sections) {
      if (section.audio_url) continue; // Skip already generated

      const workDir = path.join(process.cwd(), "uploads", courseId);
      const outputPath = path.join(workDir, `section_${section.section_number}.mp3`);

      const { durationSeconds } = await generateVoiceover(section.content, outputPath, voice, rate);

      // Upload to COS or keep local
      const audioUrl = await uploadFileToCos(
        outputPath,
        `courses/${courseId}/section_${section.section_number}.mp3`
      );
      const publicUrl = audioUrl.startsWith("http") ? audioUrl : `/uploads/${courseId}/section_${section.section_number}.mp3`;

      await query(
        `UPDATE course_sections SET audio_url = $1, duration = $2 WHERE id = $3`,
        [publicUrl, durationSeconds, section.id]
      );

      results.push({
        sectionNumber: section.section_number,
        audioUrl: publicUrl,
        duration: durationSeconds,
      });
    }

    // Deduct credits
    await deductCredits(userId, 5, "generate_voiceover", courseId, {
      voice,
      sections_generated: results.length,
    });

    // Update course voice config
    await query(
      `UPDATE courses SET voice_name = $1, progress_step = 'voice_ready', updated_at = NOW() WHERE id = $2`,
      [voice, courseId]
    );

    log.info("Voiceover generated", { courseId, count: results.length });

    return NextResponse.json({ success: true, results });
  } catch (err) {
    log.error("Voiceover error", { error: String(err) });
    return NextResponse.json({ error: "配音生成失败: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
