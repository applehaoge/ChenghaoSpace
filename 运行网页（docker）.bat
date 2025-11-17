@echo off
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "MISSING_TOOL="

for %%T in (pnpm docker npx) do (
  call :ensure_tool %%T
  if errorlevel 1 (
    set "MISSING_TOOL=%%T"
    goto :missing_tool
  )
)

pushd "%ROOT%front"
echo [1/3] Build frontend (production mode)...
call pnpm build:client --mode production
if errorlevel 1 (
  echo !!! Frontend build failed, see log above.
  popd
  goto :fail
)
popd

pushd "%ROOT%"
echo [2/3] Start Docker containers (server + python-runner)...
call docker compose up -d --build
if errorlevel 1 (
  echo !!! Docker compose failed. Make sure Docker Desktop is running.
  popd
  goto :fail
)
popd

echo [3/3] Launch frontend static server at http://localhost:4173
start "KidsCoding Frontend" powershell -NoExit -Command ^
  "cd /d ""%ROOT%""; npx serve front/dist/static --listen 4173 --single"

echo.
echo [DONE] All services started:
echo    - API/Runner: docker compose up -d
echo    - Frontend : http://localhost:4173
echo.
echo To stop: close the serve window and run "docker compose down".
goto :end

:missing_tool
if defined MISSING_TOOL (
  echo !!! Required tool missing: %MISSING_TOOL%. Please ensure it is installed and on PATH.
) else (
  echo !!! Required tool missing. Please ensure pnpm / docker / npx are installed and on PATH.
)
goto :fail

:fail
echo.
pause
exit /b 1

:end
echo.
pause
exit /b 0

:ensure_tool
where %1 >nul 2>&1
exit /b %errorlevel%
