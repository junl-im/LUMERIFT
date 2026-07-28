#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
echo "[LUMERIFT] Running safe relocated-asset and .gitkeep cleanup..."
node scripts/cleanup-relocated-assets.mjs
echo "SUCCESS: cleanup completed."
echo "Commit all modified and deleted files with: git add -A"
