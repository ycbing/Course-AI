import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { query, queryOne } from "@/lib/db";

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

/* ─── GET: list user model configs ─── */
export async function GET() {
  try {
    const userId = await getSessionUserId();
    const rows = await query<any>(
      `SELECT id, category, provider, model_name, api_key, base_url, config, created_at
       FROM user_model_configs WHERE user_id = $1 ORDER BY category`,
      [userId]
    );

    return NextResponse.json({ configs: rows.map((r) => ({ ...r, api_key: maskKey(r.api_key) })) });
  } catch (err) {
    console.error("Get user model configs error:", err);
    return NextResponse.json({ error: "获取配置失败" }, { status: 500 });
  }
}

/* ─── POST: create user model config ─── */
export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const { category, provider, modelName, apiKey, baseUrl, config } = await req.json();

    if (!category || !provider || !modelName || !apiKey) {
      return NextResponse.json({ error: "缺少必填字段（apiKey必填）" }, { status: 400 });
    }

    const created = await queryOne<any>(
      `INSERT INTO user_model_configs (user_id, category, provider, model_name, api_key, base_url, config)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, category, provider, modelName, apiKey, baseUrl || null, JSON.stringify(config || {})]
    );

    return NextResponse.json({ config: created });
  } catch (err) {
    console.error("Create user model config error:", err);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

/* ─── PUT: update user model config ─── */
export async function PUT(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const { id, category, provider, modelName, apiKey, baseUrl, config } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }

    const setClauses: string[] = [];
    const values: any[] = [];

    if (category !== undefined) { setClauses.push(`category = $${values.length + 1}`); values.push(category); }
    if (provider !== undefined) { setClauses.push(`provider = $${values.length + 1}`); values.push(provider); }
    if (modelName !== undefined) { setClauses.push(`model_name = $${values.length + 1}`); values.push(modelName); }
    if (apiKey !== undefined) { setClauses.push(`api_key = $${values.length + 1}`); values.push(apiKey); }
    if (baseUrl !== undefined) { setClauses.push(`base_url = $${values.length + 1}`); values.push(baseUrl); }
    if (config !== undefined) { setClauses.push(`config = $${values.length + 1}`); values.push(JSON.stringify(config)); }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "没有可更新的字段" }, { status: 400 });
    }

    values.push(userId);
    values.push(id);

    const updated = await queryOne<any>(
      `UPDATE user_model_configs SET ${setClauses.join(", ")}
       WHERE id = $${values.length} AND user_id = $${values.length - 1}
       RETURNING *`,
      values
    );
    if (!updated) {
      return NextResponse.json({ error: "配置不存在" }, { status: 404 });
    }

    return NextResponse.json({ config: updated });
  } catch (err) {
    console.error("Update user model config error:", err);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

/* ─── DELETE: delete user model config ─── */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }

    const deleted = await queryOne<{ id: string }>(
      `DELETE FROM user_model_configs WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (!deleted) {
      return NextResponse.json({ error: "配置不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete user model config error:", err);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
