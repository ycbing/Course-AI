import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSignedCosUrl, isCosConfigured } from "@/lib/cos";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params;
    const relativePath = pathParts.join("/");
    if (!relativePath) {
      return NextResponse.json({ error: "missing path" }, { status: 400 });
    }

    // COS proxy: /api/uploads/cos/{bucket_host}/{cos_key}
    if (relativePath.startsWith("cos/")) {
      const cosPath = relativePath.slice(4); // remove "cos/"
      if (!cosPath) {
        return NextResponse.json({ error: "missing COS path" }, { status: 400 });
      }

      // Parse the COS path: first segment is host, rest is the key
      const slashIdx = cosPath.indexOf("/");
      if (slashIdx === -1) {
        return NextResponse.json({ error: "invalid COS path" }, { status: 400 });
      }
      const host = cosPath.slice(0, slashIdx);
      const cosKey = cosPath.slice(slashIdx + 1);

      if (!isCosConfigured()) {
        return NextResponse.json({ error: "COS not configured" }, { status: 503 });
      }

      // Reconstruct the original COS URL to generate a signed version
      const signedUrl = getSignedCosUrl(cosKey);
      try {
        const upstream = await fetch(signedUrl);
        if (!upstream.ok) {
          return NextResponse.json({ error: "COS fetch failed" }, { status: upstream.status });
        }
        const contentType = upstream.headers.get("content-type") || "application/octet-stream";
        const buffer = await upstream.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400",
            "Content-Length": String(buffer.byteLength),
          },
        });
      } catch {
        return NextResponse.json({ error: "COS fetch error" }, { status: 502 });
      }
    }

    // Local file serving
    const resolved = path.resolve(path.join(process.cwd(), "uploads", relativePath));
    if (!resolved.startsWith(path.join(process.cwd(), "uploads"))) {
      return NextResponse.json({ error: "invalid path" }, { status: 403 });
    }

    const buffer = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".srt": "text/plain",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800",
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
