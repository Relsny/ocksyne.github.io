@echo off
cd /d "%~dp0..\.."
where node >nul 2>nul
if errorlevel 1 (
  echo Installe Node.js 18 ou plus recent, puis relance ce fichier.
  pause
  exit /b 1
)
node src\index.js
pause
