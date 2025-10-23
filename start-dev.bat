@echo off
setlocal
rem Launches both server and front-end dev processes via the PowerShell script
powershell.exe -NoProfile -NoLogo -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"
