import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { queryOne } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const user = await queryOne<any>(
      `SELECT id, email, name, credits, created_at FROM users WHERE id = $1`,
      [userId]
    );
    return NextResponse.json({ user });
  } catch (err) {
    console.error("Get user error:", err);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
