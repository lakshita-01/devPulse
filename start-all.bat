@echo off
echo ========================================
echo Starting DevPulse Application
echo ========================================
echo.

echo Starting Backend Server...
start "DevPulse Backend" cmd /k "cd backend && python server.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "DevPulse Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo DevPulse is starting!
echo ========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all servers...
pause >nul

taskkill /FI "WindowTitle eq DevPulse Backend*" /T /F
taskkill /FI "WindowTitle eq DevPulse Frontend*" /T /F
