import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
    }

    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM users WHERE email = $1`,
      [email.trim().toLowerCase()]
    );
    if (existing) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    await queryOne(
      `INSERT INTO users (id, email, name, password_hash) VALUES ($1, $2, $3, $4) RETURNING id`,
      [id, email.trim().toLowerCase(), name.trim(), passwordHash]
    );

    return NextResponse.json({ success: true, userId: id });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
