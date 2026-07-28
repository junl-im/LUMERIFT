@echo off
setlocal
cd /d "%~dp0"

echo [LUMERIFT] Cleaning stale relocated assets...
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found.
  echo Install Node.js or run this from the same environment used by npm.
  pause
  exit /b 1
)

node scripts\cleanup-relocated-assets.mjs
if errorlevel 1 (
  echo.
  echo ERROR: Cleanup stopped for safety. Review the messages above.
  pause
  exit /b 1
)

echo.
echo [LUMERIFT] Validating asset cleanup...
node scripts\validate-asset-cleanup.mjs
if errorlevel 1 (
  echo.
  echo ERROR: Asset cleanup validation still failed.
  pause
  exit /b 1
)

echo.
echo SUCCESS: Stale public assets were removed safely.
echo Next: run "git status", commit all deleted files, and push again.
pause
exit /b 0
