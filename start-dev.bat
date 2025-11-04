@echo off
echo Starting Restaurant POS System...
echo.

echo [1/3] Checking if MongoDB is running...
echo Make sure MongoDB is installed and running on localhost:27017
echo.

echo [2/3] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo [3/3] Starting Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo  Restaurant POS System is starting!
echo ========================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend App:   http://localhost:3000
echo.
echo Both servers are starting in separate windows.
echo Close this window when you're done.
echo.
pause