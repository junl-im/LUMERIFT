@echo off
setlocal
cd /d "%~dp0"
title LUMERIFT v1.11.0 Optional Windows Setup

echo [LUMERIFT] Node.js environment check...
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22.12 or newer is required.
  pause
  exit /b 1
)

if not exist .env.local copy .env.example .env.local >nul

echo [LUMERIFT] Installing dependencies...
call npm install
if errorlevel 1 goto :error

echo [LUMERIFT] Running full verification...
call npm run verify
if errorlevel 1 goto :error

echo [LUMERIFT] Starting development server...
call npm run dev
exit /b 0

:error
echo.
echo LUMERIFT setup or verification failed. Review the error above.
pause
exit /b 1
