@echo off
setlocal
set SCRIPT=%~dp0start-dev.ps1
if not exist "%SCRIPT%" (
  echo [ERROR] start-dev.ps1 not found at %SCRIPT%
  exit /b 1
)
echo Launching dev environment via PowerShell (server -> front -> runner) ...
powershell.exe -NoProfile -NoLogo -ExecutionPolicy Bypass -File "%SCRIPT%"
endlocal
