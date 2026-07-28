#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
node scripts/cleanup-relocated-assets.mjs
node scripts/validate-asset-cleanup.mjs
printf '%s\n' 'SUCCESS: commit all deleted public/assets files and push again.'
