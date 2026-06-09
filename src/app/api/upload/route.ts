import { NextRequest, NextResponse } from "next/server";
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { uploadFileToCos } from "@/lib/cos";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-upload");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const cosKey = formData.get("cosKey") as string | null;

    if (!file) {
      return NextResponse.json({ error: "没有文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpDir = join(process.cwd(), "uploads", "tmp");
    mkdirSync(tmpDir, { recursive: true });
    const tmpPath = join(tmpDir, `${Date.now()}-${file.name}`);

    writeFileSync(tmpPath, buffer);

    try {
      if (cosKey) {
        const url = await uploadFileToCos(tmpPath, cosKey);
        return NextResponse.json({ url });
      }
      return NextResponse.json({ error: "缺少 cosKey" }, { status: 400 });
    } finally {
      try { unlinkSync(tmpPath); } catch { /* */ }
    }
  } catch (err) {
    log.error("Upload error", { error: String(err) });
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
