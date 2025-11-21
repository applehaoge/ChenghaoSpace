@echo off
chcp 65001 >nul

echo ===============================
echo   检查是否在 main 分支
echo ===============================
for /f "tokens=*" %%i in ('git branch --show-current') do set branch=%%i

if not "%branch%"=="main" (
    echo ❌ 你现在不在 main 分支，而是在 "%branch%"！
    echo 请先执行：git checkout main
    pause
    exit /b
)

echo ===============================
echo   输入提交说明：
echo ===============================
set /p msg=commit message： 

if "%msg%"=="" (
    echo ❌ commit message 不能为空！
    pause
    exit /b
)

echo ===============================
echo   添加并提交
echo ===============================
git add .

echo.
git commit -m "%msg%"

echo ===============================
echo   推送到远程 main
echo ===============================
git push origin main

echo ===============================
echo   完成！
echo ===============================
pause