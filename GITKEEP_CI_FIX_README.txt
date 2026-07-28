LUMERIFT v1.10.0 CI .gitkeep cleanup hotfix

Cause
- preverify successfully deleted relocated legacy assets.
- Four .gitkeep files remained under public/assets.
- validate-asset-cleanup treated those repository placeholders as deployable/archive-only assets.

Fix
1. preverify cleanup now removes every .gitkeep below public/assets.
2. validate-asset-cleanup explicitly excludes .gitkeep from runtime file and byte accounting.
3. The previous PixiJS 8 Graphics.polygon -> Graphics.poly fix is included.
4. package.json keeps preverify connected to cleanup-relocated-assets.mjs.

Apply
- Extract this ZIP at the repository root and overwrite files.
- Commit everything, including deletions:
    git add -A
    git commit -m "fix: ignore and remove public asset placeholders"
    git push

Expected Actions log
PASS relocated asset cleanup: deleted 0 stale file(s), 4 placeholder file(s), 0.00 MB
DELETE public/assets/atlases/.gitkeep
DELETE public/assets/audio/.gitkeep
DELETE public/assets/loading/.gitkeep
DELETE public/assets/maps/.gitkeep
PASS asset cleanup: public 37 files 4.98 MB, archived 194 files across 3 plans
