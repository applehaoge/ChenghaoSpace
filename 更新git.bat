@echo off
chcp 65001 >nul
set /p msg=shuoming:（commit message？） 
git add .
git commit -m "%msg%"
git push
pause
