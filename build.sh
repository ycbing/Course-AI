#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "📦 Building CourseAI..."
npx next build

echo "🔗 Creating standalone symlinks..."
SERVER=".next/standalone/server.js"
if [ -f "$SERVER" ]; then
  SDIR=$(dirname "$SERVER")
  rm -rf "${SDIR}/.next/static" "${SDIR}/public"
  ln -s "$(pwd)/.next/static" "${SDIR}/.next/static"
  ln -s "$(pwd)/public" "${SDIR}/public"
fi

echo "✅ Build complete."
pm2 describe course-ai &>/dev/null && pm2 restart course-ai
