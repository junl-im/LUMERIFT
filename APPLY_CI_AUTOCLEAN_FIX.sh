#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
node scripts/cleanup-relocated-assets.mjs
printf '%s\n' 'SUCCESS. Commit package.json, scripts, source fixes, and deleted assets with git add -A.'
