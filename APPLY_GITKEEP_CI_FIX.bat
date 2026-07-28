@echo off
setlocal
cd /d "%~dp0"
echo [LUMERIFT] Running safe relocated-asset and .gitkeep cleanup...
node scripts\cleanup-relocated-assets.mjs
if errorlevel 1 (
  echo.
  echo FAILED: cleanup safety check failed.
  exit /b 1
)
echo.
echo SUCCESS: cleanup completed.
echo Commit all modified and deleted files with: git add -A
endlocal
