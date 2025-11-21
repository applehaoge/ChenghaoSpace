@echo off
chcp 65001 >nul

echo =====================================
echo 🧹 一键清理并回到最新提交 (HEAD)
echo =====================================

REM === 确认处于 Git 仓库 ===
if not exist ".git" (
    echo ❌ 当前目录不是 Git 仓库！
    pause
    exit /b
)

REM === 检查是否为 detached HEAD ===
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set branch=%%i
if "%branch%"=="HEAD" (
    echo ❌ 当前处于 Detached HEAD！（游离状态）
    echo 请先切换回主分支：
    echo     git checkout main
    pause
    exit /b
)

echo 当前分支：%branch%
echo.

REM === 更稳定、更绝对不会出错的确认方式 ===
echo ⚠ 即将丢弃所有未保存修改和新文件！
choice /m "Continue? (Y/N)"
if errorlevel 2 (
    echo ❌ 已取消操作
    pause
    exit /b
)

echo 🔄 正在恢复到最新提交...
git reset --hard HEAD

echo.
echo ✅ 已恢复到最新提交：
git log -1 --oneline

echo -------------------------------------
pause
