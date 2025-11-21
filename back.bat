@echo off

:: 防止双击闪退：重新打开 cmd 运行
if "%~1" neq "run" (
    start cmd /k "%~f0 run"
    exit /b
)

chcp 65001 >nul

echo =====================================
echo 🧹 一键回退到任意历史版本
echo =====================================

REM === 确认处于 Git 仓库 ===
if not exist ".git" (
    echo ❌ 当前目录不是 Git 仓库！
    pause
    exit /b
)

REM === 检查分支状态 ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set branch=%%i
if "%branch%"=="HEAD" (
    echo ❌ 当前处于 Detached HEAD！
    echo 请先： git checkout main
    pause
    exit /b
)

echo 当前分支：%branch%
echo.

echo 正在读取最近 5 个版本...
echo -------------------------------------

:: 生成临时文件，存储最近 5 条 commit
git log -5 --pretty=format:"%%h %%ad %%s" --date=short > commit_list.tmp

setlocal enabledelayedexpansion

set count=0

for /f "delims=" %%L in (commit_list.tmp) do (
    set /a count+=1
    set line!count!=%%L
)

if %count%==0 (
    echo ❌ 无法读取 Git log
    del commit_list.tmp
    pause
    exit /b
)

:: 显示 5 条记录
for /l %%i in (1,1,%count%) do (
    echo [%%i] !line%%i!
)

echo -------------------------------------
set /p choice=选择要回退的序号（1-%count%）： 

if "%choice%"=="" goto invalid
if %choice% LSS 1 goto invalid
if %choice% GTR %count% goto invalid

set selected=!line%choice%!

:: 解析哈希（取第一段）
for /f "tokens=1" %%h in ("!selected!") do set target=%%h

echo.
echo ⚠ 即将回退到：%target%
choice /m "确认执行回退？ (Y/N)"
if errorlevel 2 goto end

echo 🔄 正在回退...
git reset --hard %target%

echo.
echo 🚀 正在推送到远程 main...
git push -f origin main

echo.
echo ✅ 回退完成！
git log -1 --oneline

goto end

:invalid
echo ❌ 输入无效（必须输入 1-%count%）
goto end

:end
del commit_list.tmp >nul 2>&1
echo.
echo 完成。按任意键关闭…
pause
