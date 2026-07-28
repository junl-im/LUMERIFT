LUMERIFT v1.10.0 CI AUTO-CLEAN HOTFIX

Purpose
- npm run verify automatically runs scripts/cleanup-relocated-assets.mjs first.
- Stale public/assets files are deleted only when their archived copy exists and SHA-256 matches the relocation plan.
- PixiJS 8 Graphics.polygon calls are replaced by Graphics.poly.

Apply
1. Extract this ZIP at the Git repository root and overwrite files.
2. Commit all changed files and push.
3. Re-run GitHub Actions.

Expected Actions order
> lumerift-web-rpg@1.10.0 preverify
> node scripts/cleanup-relocated-assets.mjs
PASS relocated asset cleanup: deleted N stale file(s)

Then npm run verify continues normally.

Optional repository cleanup after a successful local run
npm run cleanup:relocated-assets
git add -A
git commit -m "chore: remove relocated public assets"
git push
