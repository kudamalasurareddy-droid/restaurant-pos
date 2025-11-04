@echo off
echo ========================================
echo MongoDB Migration to Atlas
echo ========================================
echo.
echo This script will help you migrate from local MongoDB to MongoDB Atlas
echo.

REM Check if MongoDB tools are installed
where mongodump >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MongoDB tools not found!
    echo Please install MongoDB Community Server or add MongoDB bin to PATH
    echo MongoDB bin is usually at: C:\Program Files\MongoDB\Server\7.0\bin
    echo.
    pause
    exit /b 1
)

echo Step 1: Exporting from local MongoDB...
echo Database: restaurant_pos_db
echo.
mongodump --host localhost:27017 --db restaurant_pos_db --out ./backup

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Export failed!
    echo Make sure:
    echo   1. MongoDB is running locally
    echo   2. Database name is correct (restaurant_pos_db)
    echo   3. You have write permissions
    echo.
    pause
    exit /b 1
)

echo.
echo Export complete! Backup saved to ./backup folder
echo.

echo Step 2: Enter your MongoDB Atlas connection string
echo Format: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant_pos_db?retryWrites=true^&w=majority
echo.
set /p ATLAS_URI="Atlas connection string: "

if "%ATLAS_URI%"=="" (
    echo ERROR: Connection string cannot be empty!
    pause
    exit /b 1
)

echo.
echo Step 3: Importing to MongoDB Atlas...
echo This may take a few minutes...
echo.

mongorestore --uri="%ATLAS_URI%" ./backup/restaurant_pos_db

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Import failed!
    echo Check:
    echo   1. Connection string is correct
    echo   2. Network Access allows your IP (0.0.0.0/0)
    echo   3. Username and password are correct
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Migration Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update backend/.env file with Atlas connection string
echo 2. Restart your backend server
echo 3. Test the connection
echo.
echo Your Atlas connection string:
echo %ATLAS_URI%
echo.
pause

