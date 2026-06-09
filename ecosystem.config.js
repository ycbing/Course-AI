// PM2 Ecosystem Config for CourseAI
const fs = require('fs');
const path = require('path');

const envFile = path.resolve(__dirname, '.env.local');
const envVars = {};
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx);
      const val = trimmed.slice(eqIdx + 1);
      envVars[key] = val;
    }
  }
}

// Pre-deploy: copy static assets into standalone (Next.js requires this)
const standaloneStatic = path.resolve(__dirname, '.next/standalone/.next/static');
const buildStatic = path.resolve(__dirname, '.next/static');
if (fs.existsSync(buildStatic) && !(fs.existsSync(standaloneStatic))) {
  fs.cpSync(buildStatic, standaloneStatic, { recursive: true });
  console.log('[pre-deploy] Copied .next/static → .next/standalone/.next/static');
} else if (fs.existsSync(buildStatic)) {
  // Always refresh to pick up new CSS/JS hashes after rebuild
  fs.rmSync(standaloneStatic, { recursive: true, force: true });
  fs.cpSync(buildStatic, standaloneStatic, { recursive: true });
  console.log('[pre-deploy] Refreshed .next/static in standalone');
}
const standalonePublic = path.resolve(__dirname, '.next/standalone/public');
const buildPublic = path.resolve(__dirname, 'public');
if (fs.existsSync(buildPublic) && !fs.existsSync(standalonePublic)) {
  fs.cpSync(buildPublic, standalonePublic, { recursive: true });
  console.log('[pre-deploy] Copied public → .next/standalone/public');
}

module.exports = {
  apps: [
    {
      name: 'course-ai',
      script: '.next/standalone/server.js',
      cwd: __dirname,
      env: { PORT: 3005, ...envVars },
    },
  ],
};
