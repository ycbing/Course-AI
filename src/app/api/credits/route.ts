import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const user = await queryOne<{ credits: number }>(
      `SELECT credits FROM users WHERE id = $1`,
      [userId]
    );

    return NextResponse.json({ credits: user?.credits ?? 0 });
  } catch (err) {
    console.error("Get credits error:", err);
    return NextResponse.json({ error: "获取积分失败" }, { status: 500 });
  }
}
