@echo off
setlocal
cd /d "%~dp0"
echo This patch has already been extracted into the repository root.
echo Running safe asset cleanup now...
node scripts\cleanup-relocated-assets.mjs
if errorlevel 1 (
  echo.
  echo FAILED: cleanup stopped for safety. Check archive files and hashes.
  pause
  exit /b 1
)
echo.
echo SUCCESS. Now run:
echo   git add -A
echo   git commit -m "fix: auto-clean relocated assets before verify"
echo   git push
pause
