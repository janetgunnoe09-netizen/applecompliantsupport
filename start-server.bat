@echo off
echo Starting Apple Support Website Server...
echo.
echo This will start your website on http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
node simple-server.js
pause
