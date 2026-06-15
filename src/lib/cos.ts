import COS from "cos-nodejs-sdk-v5";
import { readFile } from "fs/promises";
import path from "path";
import { createLogger } from "@/lib/logger";

const log = createLogger("cos-storage");

export function isCosConfigured(): boolean {
  return !!(
    process.env.COS_SECRET_ID &&
    process.env.COS_SECRET_KEY &&
    process.env.COS_BUCKET &&
    process.env.COS_REGION
  );
}

let cosClient: COS | null = null;

function getCosClient(): COS | null {
  if (!isCosConfigured()) return null;
  if (cosClient) return cosClient;
  cosClient = new COS({
    SecretId: process.env.COS_SECRET_ID!,
    SecretKey: process.env.COS_SECRET_KEY!,
  });
  return cosClient;
}

const BUCKET = () => process.env.COS_BUCKET!;
const REGION = () => process.env.COS_REGION!;

export function getCosUrl(cosKey: string): string {
  return `https://${BUCKET()}.cos.${REGION()}.myqcloud.com/${cosKey}`;
}

export function getSignedCosUrl(cosKey: string, expires: number = 7200): string {
  const client = getCosClient();
  if (!client) return getCosUrl(cosKey);
  const url = client.getObjectUrl({
    Bucket: BUCKET(), Region: REGION(), Key: cosKey,
    Sign: true, Expires: expires,
  });
  return url || getCosUrl(cosKey);
}

export function isCosUrl(url: string): boolean {
  if (!url || !url.startsWith("http")) return false;
  const bucket = process.env.COS_BUCKET;
  return bucket ? url.includes(`${bucket}.cos.`) : false;
}

export async function uploadToCos(localPath: string, cosKey: string): Promise<string | null> {
  const client = getCosClient();
  if (!client) return null;
  const { stat } = await import("fs/promises");
  const ext = path.extname(localPath).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".srt": "text/plain",
  };
  const contentType = mimeMap[ext] || "application/octet-stream";

  return new Promise((resolve, reject) => {
    stat(localPath).then((s) => {
      if (s.size > 5 * 1024 * 1024) {
        client.sliceUploadFile({
          Bucket: BUCKET(), Region: REGION(), Key: cosKey,
          FilePath: localPath, SliceSize: 5 * 1024 * 1024,
          ContentType: contentType,
          ACL: 'public-read',
        }, (err) => {
          if (err) { log.error("COS slice upload failed", { cosKey, error: err.message }); reject(err); }
          else resolve(getCosUrl(cosKey));
        });
      } else {
        readFile(localPath).then((buffer) => {
          client.putObject({
            Bucket: BUCKET(), Region: REGION(), Key: cosKey,
            Body: buffer, ContentType: contentType,
            ACL: 'public-read',
          }, (err) => {
            if (err) { log.error("COS upload failed", { cosKey, error: err.message }); reject(err); }
            else resolve(getCosUrl(cosKey));
          });
        }).catch(reject);
      }
    }).catch(reject);
  });
}

export async function uploadFileToCos(localPath: string, cosKey: string): Promise<string> {
  if (!isCosConfigured()) return localPath;
  try {
    const url = await uploadToCos(localPath, cosKey);
    if (url) return url;
    return localPath;
  } catch (err) {
    log.warn("COS upload failed, fallback local", { error: err instanceof Error ? err.message : String(err) });
    return localPath;
  }
}

export function courseCosKey(courseId: string, type: "video" | "audio" | "cover" | "image", index?: number): string {
  const exts = { video: "final.mp4", audio: "section.mp3", cover: "cover.jpg", image: "image.jpg" };
  const name = type === "image" && index !== undefined ? `image_${index}.jpg` : exts[type];
  return `courses/${courseId}/${name}`;
}
