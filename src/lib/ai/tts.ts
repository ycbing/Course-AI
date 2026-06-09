import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { createLogger } from "../logger";

const execAsync = promisify(exec);
const log = createLogger("tts");

export const VOICE_LIST = [
  { id: "zh-CN-YunjianNeural", name: "云健", desc: "男声·教师/解说", category: "male", provider: "edge" as const },
  { id: "zh-CN-YunyangNeural", name: "云扬", desc: "男声·标准/播报", category: "male", provider: "edge" as const },
  { id: "zh-CN-YunxiNeural", name: "云希", desc: "男声·年轻/活泼", category: "male", provider: "edge" as const },
  { id: "zh-CN-YunxiaNeural", name: "云夏", desc: "男声·童声/教学", category: "male", provider: "edge" as const },
  { id: "zh-CN-XiaoxiaoNeural", name: "晓晓", desc: "女声·温柔/教师", category: "female", provider: "edge" as const },
  { id: "zh-CN-XiaoyiNeural", name: "晓伊", desc: "女声·活泼/可爱", category: "female", provider: "edge" as const },
  { id: "zh-CN-liaoning-XiaobeiNeural", name: "晓北", desc: "女声·东北话", category: "female", provider: "edge" as const },
  { id: "zh-CN-shaanxi-XiaoniNeural", name: "晓妮", desc: "女声·陕西话", category: "female", provider: "edge" as const },
];

/** Map rate (1.0 default) to edge-tts rate string */
function rateToEdgeStr(rate: number): string {
  const pct = Math.round((rate - 1) * 100);
  if (pct === 0) return "+0%";
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

/**
 * Generate voiceover using Edge-TTS.
 */
export async function generateVoiceover(
  text: string,
  outputPath: string,
  voice: string = "zh-CN-YunyangNeural",
  rate: number | string = 1.0,
): Promise<{ filePath: string; durationSeconds: number }> {
  if (!text) throw new Error("text is empty");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const rateNum = typeof rate === "string" ? parseFloat(rate.replace(/[+%]/g, "")) / 100 + 1 : rate;
  const rateStr = rateToEdgeStr(rateNum);

  const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, " ");
  const cmd = `edge-tts --voice "${voice}" --rate="${rateStr}" --text "${escapedText}" --write-media "${outputPath}"`;

  log.info("Generating voiceover (Edge-TTS)", { voice, rate: rateStr, textLength: text.length });
  await execAsync(cmd, { timeout: 60000 });

  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`
  );
  const duration = parseFloat(stdout.trim()) || 0;
  log.info("Voiceover generated (Edge-TTS)", { voice, duration });
  return { filePath: outputPath, durationSeconds: duration };
}

/** Get the TTS provider name (always "edge" now) */
export function getVoiceProvider(_voice: string): string {
  return "edge";
}
