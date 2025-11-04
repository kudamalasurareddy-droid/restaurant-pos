@echo off
echo Starting Restaurant POS Backend Server...
echo.

cd backend

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file from .env.example
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting backend server...
echo Server will run on http://localhost:5000
echo Press Ctrl+C to stop
echo.

call npm run dev

pause

