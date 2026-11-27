@echo off
rem Double-click to install Monte TV on your TV. Runs install-tv.ps1 without
rem changing PowerShell settings on this PC.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-tv.ps1" %*
echo.
pause
