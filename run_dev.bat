@echo off
echo ===================================================
echo     Starting OlivePark AI - Smart Parking Solapur
echo ===================================================
echo.

start "OlivePark AI - Backend" cmd /k "cd backend && python app.py"
timeout /t 2 /nobreak >nul
start "OlivePark AI - Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo Backend running on http://127.0.0.1:5000
echo Frontend running on http://localhost:3000
echo.
echo Press any key to exit this launcher window...
pause >nul
