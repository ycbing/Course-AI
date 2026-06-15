#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "📦 Building CourseAI..."
npx next build

echo "🔗 Creating standalone symlinks..."
SERVER=".next/standalone/server.js"
if [ -f "$SERVER" ]; then
  SDIR=$(dirname "$SERVER")
  # Static & Public
  rm -rf "${SDIR}/.next/static" "${SDIR}/public"
  ln -s "$(pwd)/.next/static" "${SDIR}/.next/static"
  ln -s "$(pwd)/public" "${SDIR}/public"
  
  # Fix serverExternalPackages: bcryptjs needs full source (umd/ subfolder)
  # Next.js copy is incomplete (missing umd/index.js)
  rm -rf "${SDIR}/node_modules/bcryptjs"
  ln -s "$(pwd)/node_modules/bcryptjs" "${SDIR}/node_modules/bcryptjs"
fi

echo "✅ Build complete."
pm2 describe course-ai &>/dev/null && pm2 restart course-ai
