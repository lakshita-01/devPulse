@echo off
color 0A
cls

echo.
echo  ========================================================
echo   DevPulse - MongoDB Setup Wizard
echo  ========================================================
echo.
echo  MongoDB is NOT installed on your computer.
echo  You need MongoDB to run DevPulse.
echo.
echo  ========================================================
echo   EASIEST OPTION: MongoDB Atlas (Cloud - FREE)
echo  ========================================================
echo.
echo  Benefits:
echo   - No installation required
echo   - FREE forever (M0 tier)
echo   - Setup takes 5 minutes
echo   - Works immediately
echo.
echo  ========================================================
echo.
echo  Press any key to open MongoDB Atlas signup page...
pause >nul

start https://www.mongodb.com/cloud/atlas/register

cls
echo.
echo  ========================================================
echo   Step-by-Step Instructions
echo  ========================================================
echo.
echo  1. Create FREE account on MongoDB Atlas
echo.
echo  2. Click "Build a Database"
echo     - Choose FREE (M0 Sandbox)
echo     - Click Create
echo.
echo  3. Create Database User
echo     - Username: devpulse
echo     - Password: devpulse123 (or your choice)
echo     - Click "Create User"
echo.
echo  4. Network Access
echo     - Click "Add My Current IP Address"
echo     - Click "Finish and Close"
echo.
echo  5. Get Connection String
echo     - Click "Connect"
echo     - Choose "Connect your application"
echo     - Copy the connection string
echo.
echo  6. Update backend\.env file
echo     - Replace MONGO_URL with your connection string
echo     - Replace ^<password^> with your actual password
echo.
echo  Example:
echo  MONGO_URL=mongodb+srv://devpulse:devpulse123@cluster0.xxxxx.mongodb.net/
echo.
echo  ========================================================
echo.
echo  After updating .env file, run:
echo    cd backend
echo    python server.py
echo.
echo  ========================================================
echo.
echo  Press any key to open QUICKSTART.md for detailed steps...
pause >nul

start QUICKSTART.md

echo.
echo  Setup wizard complete!
echo  Follow the instructions in QUICKSTART.md
echo.
pause
