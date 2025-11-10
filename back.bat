@echo off
echo =====================================
echo 🧹 一键回到当前最新提交 (HEAD)
echo !!! 所有未保存修改和新文件将被丢弃 !!!
echo =====================================

if not exist ".git" (
    echo ❌ 当前目录不是 Git 仓库！
    pause
    exit /b
)

cd /d %~dp0

echo 🔄 正在回到最新提交...
git reset --hard HEAD

echo ✅ 已回到當前最新提交：
git log -1 --oneline
echo -------------------------------------
pause
