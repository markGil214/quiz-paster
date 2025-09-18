@echo off
echo 🚀 Preparing for Render Deployment...

REM Check if git repository exists
if not exist ".git" (
    echo ❌ No git repository found. Initializing...
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
) else (
    echo ✅ Git repository found
)

REM Check for environment files
if not exist "server\.env" (
    echo ⚠️  server\.env not found. Creating from example...
    copy "server\.env.example" "server\.env"
    echo 📝 Please update server\.env with your MongoDB URI
)

if not exist ".env" (
    echo ⚠️  .env not found. Creating...
    echo VITE_API_URL=http://localhost:5000 > .env
)

echo.
echo 📋 Deployment Checklist:
echo ✅ 1. Push code to GitHub
echo ✅ 2. Go to render.com and sign up
echo ✅ 3. Deploy backend first (Web Service)
echo ✅ 4. Deploy frontend second (Static Site)
echo ✅ 5. Update CORS origins in server/index.js

echo.
echo 🔗 Useful links:
echo    - Render: https://render.com
echo    - MongoDB Atlas: https://cloud.mongodb.com
echo    - Documentation: https://render.com/docs

echo.
echo Ready for deployment! 🎉
pause
