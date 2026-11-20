@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

rem Code credite par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetes autorise.

if not defined DCAS_STARTUP set "DCAS_STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
if not defined DCAS_VBS set "DCAS_VBS=%DCAS_STARTUP%\DCAS-bot.vbs"
if not defined DCAS_CMD set "DCAS_CMD=%DCAS_STARTUP%\DCAS-bot-start.cmd"

goto :after_helpers

:is_bot_dir
if not exist "%~1\package.json" exit /b 1
if exist "%~1\src\index.js" exit /b 0
if exist "%~1\src\token.js" exit /b 0
exit /b 1

:detect_bot_dir
set "DCAS_FOUND="
call :is_bot_dir "%~dp0"
if not errorlevel 1 (
  set "DCAS_FOUND=%~dp0"
  goto :detect_done
)
call :is_bot_dir "%~dp0.."
if not errorlevel 1 (
  pushd "%~dp0.." >nul
  set "DCAS_FOUND=!CD!"
  popd
  goto :detect_done
)
for /d %%D in ("%~dp0*") do (
  call :is_bot_dir "%%~fD"
  if not errorlevel 1 (
    set "DCAS_FOUND=%%~fD"
    goto :detect_done
  )
)
for /d %%D in ("%~dp0..\*") do (
  call :is_bot_dir "%%~fD"
  if not errorlevel 1 (
    set "DCAS_FOUND=%%~fD"
    goto :detect_done
  )
)
:detect_done
if defined DCAS_FOUND (
  for %%I in ("!DCAS_FOUND!") do set "DCAS_FOUND=%%~fI"
  set "BOT=!DCAS_FOUND!"
  exit /b 0
)
exit /b 1

:resolve_bot_dir
set "BOT="
if defined DCAS_BOT_DIR (
  call :is_bot_dir "%DCAS_BOT_DIR%"
  if errorlevel 1 (
    echo Le dossier indique dans DCAS_BOT_DIR n’est pas un bot DCAS.
    exit /b 1
  )
  for %%I in ("%DCAS_BOT_DIR%") do set "BOT=%%~fI"
  exit /b 0
)
call :detect_bot_dir
if not errorlevel 1 exit /b 0
if defined DCAS_AUTOSTART_TEST exit /b 1
if defined DCAS_AUTOSTART_DRY_RUN exit /b 1
echo Le dossier du bot n’a pas été trouvé automatiquement.
echo C’est le dossier qui contient le fichier package.json (souvent « fichiers-du-bot »).
echo Glissez-le dans cette fenêtre, puis appuyez sur Entrée.
set "INPUT="
set /p "INPUT=Dossier du bot : "
if defined INPUT (
  set "INPUT=!INPUT:"=!"
  if "!INPUT:~-1!"==" " set "INPUT=!INPUT:~0,-1!"
  if "!INPUT:~-1!"=="\" set "INPUT=!INPUT:~0,-1!"
)
if not defined INPUT (
  echo Aucun dossier n’a été indiqué.
  exit /b 1
)
call :is_bot_dir "!INPUT!"
if errorlevel 1 (
  echo Ce dossier ne ressemble pas à un bot DCAS (package.json et src\index.js sont absents).
  exit /b 1
)
for %%I in ("!INPUT!") do set "BOT=%%~fI"
exit /b 0

:find_node
set "NODE="
if defined DCAS_NODE_PATH if exist "%DCAS_NODE_PATH%" (
  set "NODE=%DCAS_NODE_PATH%"
  exit /b 0
)
where node >nul 2>&1
if not errorlevel 1 (
  for /f "delims=" %%I in ('where node 2^>nul') do (
    if not defined NODE set "NODE=%%~fI"
  )
  if defined NODE exit /b 0
)
if exist "%ProgramFiles%\nodejs\node.exe" (
  set "NODE=%ProgramFiles%\nodejs\node.exe"
  exit /b 0
)
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
  set "NODE=%ProgramFiles(x86)%\nodejs\node.exe"
  exit /b 0
)
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
  set "NODE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
  exit /b 0
)
exit /b 1

:find_npm
set "NPM="
if defined NODE if exist "%~dp0" (
  for %%I in ("%NODE%") do if exist "%%~dpInode.exe" if exist "%%~dpInpm.cmd" set "NPM=%%~dpInpm.cmd"
)
if defined NPM exit /b 0
where npm >nul 2>&1
if not errorlevel 1 (
  for /f "delims=" %%I in ('where npm 2^>nul') do (
    if not defined NPM set "NPM=%%~fI"
  )
)
if defined NPM exit /b 0
exit /b 1

:pause_end
if defined DCAS_AUTOSTART_TEST exit /b 0
if defined DCAS_AUTOSTART_DRY_RUN exit /b 0
echo.
pause
exit /b 0

:write_startup
if not exist "%BOT%\logs" mkdir "%BOT%\logs"
> "%DCAS_CMD%" (
  echo @echo off
  echo chcp 65001 ^>nul
  echo set "DCAS_BOT=%BOT%"
  echo set "NODE=%NODE%"
  echo cd /d "%%DCAS_BOT%%"
  echo if not exist "logs" mkdir "logs"
  echo "%%NODE%%" "src\index.js" ^>^> "logs\dcas-autostart.log" 2^>^&1
)
> "%DCAS_VBS%" (
  echo Option Explicit
  echo Dim sh, starter
  echo Set sh = CreateObject("WScript.Shell"^)
  echo starter = "{STARTER}"
  echo sh.Run Chr(34^) ^& starter ^& Chr(34^), 0, False
)
rem Replace placeholder with the real startup cmd path (spaces/accents safe).
call :patch_vbs
exit /b 0

:patch_vbs
set "TMPVBS=%DCAS_VBS%.tmp"
if exist "%TMPVBS%" del /f /q "%TMPVBS%"
for /f "usebackq delims=" %%L in ("%DCAS_VBS%") do (
  set "LINE=%%L"
  set "LINE=!LINE:{STARTER}=%DCAS_CMD%!"
  echo !LINE!>>"%TMPVBS%"
)
move /y "%TMPVBS%" "%DCAS_VBS%" >nul
exit /b 0

:after_helpers

echo DCAS — Désactiver le démarrage automatique (Windows)
echo.

set "TARGET="
if exist "%DCAS_CMD%" (
  for /f "usebackq delims=" %%L in ("%DCAS_CMD%") do (
    echo %%L | findstr /C:"set \"DCAS_BOT=" >nul
    if not errorlevel 1 set "LINE=%%L"
  )
)
if defined LINE (
  set "LINE=!LINE:set "DCAS_BOT=!"
  set "LINE=!LINE:"=!"
  set "TARGET=!LINE!"
)

if defined TARGET if not defined DCAS_AUTOSTART_TEST if not defined DCAS_AUTOSTART_DRY_RUN (
  powershell -NoProfile -Command "$bot=$env:TARGET; Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'node' -and $_.CommandLine -and ($_.CommandLine -like '*src\\index.js*' -or $_.CommandLine -like '*src/index.js*') -and $_.CommandLine -like ('*'+$bot+'*') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
)

if exist "%DCAS_VBS%" (
  del /f /q "%DCAS_VBS%"
  echo Le lanceur invisible a été retiré du dossier Démarrage.
) else (
  echo Aucun lanceur DCAS-bot.vbs n’était présent dans le dossier Démarrage.
)
if exist "%DCAS_CMD%" (
  del /f /q "%DCAS_CMD%"
  echo Le script DCAS-bot-start.cmd a été retiré.
)

echo.
echo Le démarrage automatique est désactivé. Le bot ne se lancera plus à l’ouverture de votre session.
echo Ce n’était pas un hébergement : le bot ne tourne que lorsque vous laissez cet ordinateur allumé.
call :pause_end
exit /b 0
