@echo off
set /p msg=请输入提交说明（commit message）: 
git add .
git commit -m "%msg%"
git push
pause
