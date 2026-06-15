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

const standalone = path.resolve(__dirname, '.next/standalone');
const buildRoot = __dirname;

// Use symlinks for static/public (never cpSync which breaks symlinks)
const links = [
  { target: `${buildRoot}/.next/static`, link: `${standalone}/.next/static` },
  { target: `${buildRoot}/public`, link: `${standalone}/public` },
  { target: `${buildRoot}/node_modules/bcryptjs`, link: `${standalone}/node_modules/bcryptjs` },
];

for (const { target, link } of links) {
  if (fs.existsSync(target)) {
    if (fs.existsSync(link)) {
      const stat = fs.lstatSync(link);
      if (!stat.isSymbolicLink()) {
        fs.rmSync(link, { recursive: true, force: true });
      } else {
        fs.unlinkSync(link);
      }
    }
    fs.symlinkSync(target, link);
  }
}

module.exports = {
  apps: [
    {
      name: 'course-ai',
      script: '.next/standalone/server.js',
      cwd: __dirname,
      env: { PORT: 3004, ...envVars },
    },
  ],
};
