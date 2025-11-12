@echo off
setlocal enabledelayedexpansion

REM 根目录
set "ROOT=%~dp0"

REM 1. 打包前端（生产环境）
pushd "%ROOT%front"
echo [1/3] 构建前端生产包...
call pnpm build:client --mode production
if errorlevel 1 (
  echo 前端构建失败，终止脚本。
  popd
  exit /b 1
)
popd

REM 2. 启动 Docker 服务（server + python-runner）
pushd "%ROOT%"
echo [2/3] 启动 Docker 容器（server + python-runner）...
docker compose up -d
if errorlevel 1 (
  echo Docker 启动失败，终止脚本。
  popd
  exit /b 1
)
popd

REM 3. 启动静态站点（独立 PowerShell 窗口）
echo [3/3] 启动前端静态服务器：http://localhost:4173
start "KidsCoding Frontend" powershell -NoExit -Command ^
  "cd /d '%ROOT%'; npx serve front/dist/static --listen 4173 --single"

echo.
echo 所有服务已启动：
echo   - API/Runner：docker compose up -d
echo   - 前端生产包：front/dist/static (serve@4173)
echo.
echo 完成。可在新开的 PowerShell 窗口查看前端日志，Ctrl+C 即可关闭。
endlocal
