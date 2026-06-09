import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-user";
import { query, queryOne } from "@/lib/db";

function maskKey(key: string | null | undefined): string {
  if (!key) return "";
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

/* ─── GET: list model configs (api_key masked) ─── */
export async function GET() {
  try {
    const userId = await getSessionUserId();
    // TODO: add admin check here
    const rows = await query<any>(
      `SELECT id, category, provider, model_name, api_key, base_url, config, enabled, updated_at
       FROM model_configs ORDER BY category`
    );

    const masked = rows.map((r) => ({
      ...r,
      api_key: maskKey(r.api_key),
    }));

    return NextResponse.json({ configs: masked });
  } catch (err) {
    console.error("Get model configs error:", err);
    return NextResponse.json({ error: "获取模型配置失败" }, { status: 500 });
  }
}

/* ─── POST: create model config ─── */
export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const { category, provider, modelName, apiKey, baseUrl, config } = await req.json();

    if (!category || !provider || !modelName) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM model_configs WHERE category = $1`,
      [category]
    );
    if (existing) {
      return NextResponse.json({ error: "该分类已存在配置" }, { status: 409 });
    }

    const created = await queryOne<any>(
      `INSERT INTO model_configs (category, provider, model_name, api_key, base_url, config)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [category, provider, modelName, apiKey || null, baseUrl || null, JSON.stringify(config || {})]
    );

    return NextResponse.json({ config: { ...created, api_key: maskKey(created.api_key) } });
  } catch (err) {
    console.error("Create model config error:", err);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

/* ─── PUT: update model config ─── */
export async function PUT(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    const { id, category, provider, modelName, apiKey, baseUrl, config, enabled } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }

    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM model_configs WHERE id = $1`,
      [id]
    );
    if (!existing) {
      return NextResponse.json({ error: "配置不存在" }, { status: 404 });
    }

    const setClauses: string[] = [];
    const values: any[] = [];

    if (category !== undefined) { setClauses.push(`category = $${values.length + 1}`); values.push(category); }
    if (provider !== undefined) { setClauses.push(`provider = $${values.length + 1}`); values.push(provider); }
    if (modelName !== undefined) { setClauses.push(`model_name = $${values.length + 1}`); values.push(modelName); }
    if (apiKey !== undefined) { setClauses.push(`api_key = $${values.length + 1}`); values.push(apiKey); }
    if (baseUrl !== undefined) { setClauses.push(`base_url = $${values.length + 1}`); values.push(baseUrl); }
    if (config !== undefined) { setClauses.push(`config = $${values.length + 1}`); values.push(JSON.stringify(config)); }
    if (enabled !== undefined) { setClauses.push(`enabled = $${values.length + 1}`); values.push(enabled ? 1 : 0); }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "没有可更新的字段" }, { status: 400 });
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const updated = await queryOne<any>(
      `UPDATE model_configs SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );

    return NextResponse.json({ config: { ...updated, api_key: maskKey(updated.api_key) } });
  } catch (err) {
    console.error("Update model config error:", err);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
