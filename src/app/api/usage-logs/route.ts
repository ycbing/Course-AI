import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
    const url = req.nextUrl;
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = (page - 1) * limit;

    const rows = await query<any>(
      `SELECT id, action, credits_used, course_id, details, created_at
       FROM usage_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, Math.min(limit, 200), offset]
    );

    const [{ count }] = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM usage_logs WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({
      logs: rows,
      total: parseInt(count, 10),
      page,
      limit,
    });
  } catch (err) {
    console.error("Get usage logs error:", err);
    return NextResponse.json({ error: "获取积分记录失败" }, { status: 500 });
  }
}
