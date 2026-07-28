@echo off
setlocal
cd /d "%~dp0"
title LUMERIFT v1.8.1 Optional Verification
call npm run verify
if errorlevel 1 (
  echo.
  echo LUMERIFT verification failed.
  pause
  exit /b 1
)
echo.
echo LUMERIFT verification passed.
pause
