function fmt(level: string, msg: string, meta?: Record<string, unknown>) {
  const ts = new Date().toISOString();
  const extra = meta ? " " + JSON.stringify(meta) : "";
  console.log(`[${ts}] [${level}] ${msg}${extra}`);
}

export function createLogger(service: string) {
  return {
    info: (msg: string, meta?: Record<string, unknown>) => fmt("INFO", `[${service}] ${msg}`, meta),
    warn: (msg: string, meta?: Record<string, unknown>) => fmt("WARN", `[${service}] ${msg}`, meta),
    error: (msg: string, meta?: Record<string, unknown>) => fmt("ERROR", `[${service}] ${msg}`, meta),
  };
}
