@echo off
echo ========================================
echo MongoDB Quick Setup for DevPulse
echo ========================================
echo.

echo You have 3 options to get MongoDB running:
echo.
echo 1. Install MongoDB Community Edition (Local)
echo    - Download: https://www.mongodb.com/try/download/community
echo    - Run installer and check "Install as Service"
echo.
echo 2. Use MongoDB Atlas (Cloud - FREE, Easiest)
echo    - Sign up: https://www.mongodb.com/cloud/atlas/register
echo    - Create free M0 cluster (takes 5 minutes)
echo    - Get connection string and update backend/.env
echo    - See MONGODB_SETUP.md for detailed steps
echo.
echo 3. Use Docker (If you have Docker installed)
echo    - Run: docker run -d -p 27017:27017 --name mongodb mongo
echo.
echo ========================================
echo RECOMMENDED: Use MongoDB Atlas (Option 2)
echo ========================================
echo.
echo Would you like to open MongoDB Atlas signup page? (Y/N)
set /p choice=

if /i "%choice%"=="Y" (
    start https://www.mongodb.com/cloud/atlas/register
    echo.
    echo After creating your cluster:
    echo 1. Get your connection string
    echo 2. Update backend/.env with your MONGO_URL
    echo 3. Run: python server.py
    echo.
    echo See MONGODB_SETUP.md for detailed instructions
)

pause
