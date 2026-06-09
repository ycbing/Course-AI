import pg from "pg";
import { createLogger } from "../logger";

const log = createLogger("db");

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  log.error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  log.error("Unexpected error on database pool", { error: err.message });
});

export { pool };

/**
 * Execute a parameterized query and return all rows.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

/**
 * Execute a parameterized query and return the first row (or null).
 */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const res = await pool.query(text, params);
  return (res.rows[0] as T) ?? null;
}

/**
 * Return the first column of the first row, or null.
 */
export async function queryFirst<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const res = await pool.query(text, params);
  if (res.rows.length === 0) return null;
  return (res.rows[0] as any)[Object.keys(res.rows[0])[0]] as T;
}

/**
 * Run a function inside a DB transaction.
 */
export async function transaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Deduct credits from user and log usage. Returns true on success.
 */
export async function deductCredits(
  userId: string,
  amount: number,
  action: string,
  courseId?: string,
  details?: Record<string, unknown>
): Promise<boolean> {
  const result = await queryOne<{ credits: number }>(
    `UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $1 RETURNING credits`,
    [amount, userId]
  );
  if (!result) return false;

  await query(
    `INSERT INTO usage_logs (user_id, action, credits_used, course_id, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, action, amount, courseId || null, JSON.stringify(details || {})]
  );
  return true;
}

export async function validateStartup(): Promise<void> {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    log.error("Missing required environment variables", { vars: missing });
  }

  // Check optional vars (warn only)
  const optional = [
    "GLM_API_KEY",
    "COS_SECRET_ID", "COS_SECRET_KEY", "COS_BUCKET", "COS_REGION",
  ];
  const optMissing = optional.filter((k) => !process.env[k]);
  if (optMissing.length > 0) {
    log.warn("Optional env vars not set (some features may be disabled)", { vars: optMissing });
  }

  // Test DB connection
  try {
    await pool.query("SELECT 1");
    log.info("Database connection OK");
  } catch (err) {
    log.error("Database connection failed", { error: err instanceof Error ? err.message : String(err) });
  }
}
