@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE_EXE%" (
  where node >nul 2>nul
  if errorlevel 1 (
    echo Node.js could not be found.
    echo Open this project in Codex and ask it to start the local server.
    pause
    exit /b 1
  )
  set "NODE_EXE=node"
)

start "Avantage AI local server" /min "%NODE_EXE%" preview-server.cjs
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8765/"
endlocal
