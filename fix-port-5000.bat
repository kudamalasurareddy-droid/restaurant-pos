@echo off
echo ========================================
echo Fix Port 5000 Already in Use
echo ========================================
echo.

echo Checking what's using port 5000...
netstat -ano | findstr :5000

echo.
echo Finding process ID...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo.
    echo Process using port 5000: PID %%a
    echo Killing process...
    taskkill /PID %%a /F
    echo Process killed!
)

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Now you can start the backend server:
echo   cd backend
echo   npm run dev
echo.
pause

