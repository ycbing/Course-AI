import { NextRequest, NextResponse } from "next/server";
import { getSignedCosUrl, getCosUrl, isCosConfigured } from "@/lib/cos";
import { createLogger } from "@/lib/logger";

const log = createLogger("api-cos-proxy");

/**
 * GET /api/cos/[...path]
 * Proxy access to COS private bucket files via signed URL redirect.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params;
    const cosKey = pathParts.join("/");
    if (!cosKey) {
      return NextResponse.json({ error: "missing key" }, { status: 400 });
    }

    if (!isCosConfigured()) {
      return NextResponse.json({ error: "COS not configured" }, { status: 503 });
    }

    const signedUrl = getSignedCosUrl(cosKey, 3600);
    return NextResponse.redirect(signedUrl);
  } catch (err) {
    log.error("COS proxy error", { error: String(err) });
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
