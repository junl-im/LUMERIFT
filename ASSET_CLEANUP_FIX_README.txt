LUMERIFT ASSET CLEANUP + PIXI BUILD HOTFIX
Compatible with v1.10.0 and v1.10.1 repositories.

WHY THE BUILD FAILED
ZIP overwrite cannot delete files already tracked in Git.
The relocation plans say the old public/assets copies must be removed, but the
Git repository still contains those old files. validate-asset-cleanup correctly
stops the build.

HOW TO APPLY
1. Extract this ZIP into the project root and overwrite files.
2. Double-click APPLY_ASSET_CLEANUP_FIX.bat.
3. Confirm that the final message says SUCCESS.
4. Run: git status
5. Commit all deleted public/assets files plus the new/updated hotfix files.
6. Push to GitHub and rerun Actions.

SAFETY
The cleanup script deletes a public file only when:
- the relocation plan contains the path,
- the archived destination exists, and
- both source and archive SHA-256 hashes match the relocation plan.
A mismatched or missing archive stops deletion for that file.

INCLUDED
- PixiJS 8 Graphics.polygon -> Graphics.poly build fix
- Safe stale-asset cleanup script
- Clear validator recovery instruction
