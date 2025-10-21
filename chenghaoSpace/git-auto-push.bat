@echo off
set /p msg=shuoming:（commit message）: 
git add .
git commit -m "%msg%"
git push
pause
