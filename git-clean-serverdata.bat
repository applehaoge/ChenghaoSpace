@echo off
setlocal

echo ===========================
echo 🚀 开始清理 server_data 目录
echo ===========================

:: 检查当前目录是否为 Git 仓库
if not exist ".git" (
    echo ❌ 当前目录不是 Git 仓库，请切换到项目根目录再运行。
    pause
    exit /b
)

:: 追加忽略规则
echo 添加 .gitignore 忽略规则...
(
    echo server_data/
    echo server/server_data/
) >> .gitignore

:: 从缓存中移除但保留本地文件
echo 移除 Git 缓存中的 server_data ...
git rm -r --cached server_data 2>nul
git rm -r --cached server\server_data 2>nul

:: 提交更改
echo 提交修改...
git add .gitignore
git commit -m "chore: ignore server_data directories and stop tracking user data"

:: 推送到远程
echo 推送到远端...
git push

echo ===========================
echo ✅ 清理完成！
echo ===========================
pause
