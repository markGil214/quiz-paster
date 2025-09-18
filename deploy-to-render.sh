#!/bin/bash

# Render Deployment Helper Script
echo "🚀 Preparing for Render Deployment..."

# Check if git repository exists
if [ ! -d ".git" ]; then
    echo "❌ No git repository found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
else
    echo "✅ Git repository found"
fi

# Check for environment files
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found. Creating from example..."
    cp server/.env.example server/.env
    echo "📝 Please update server/.env with your MongoDB URI"
fi

if [ ! -f ".env" ]; then
    echo "⚠️  .env not found. Creating..."
    echo "VITE_API_URL=http://localhost:5000" > .env
fi

echo "📋 Deployment Checklist:"
echo "✅ 1. Push code to GitHub"
echo "✅ 2. Go to render.com and sign up"
echo "✅ 3. Deploy backend first (Web Service)"
echo "✅ 4. Deploy frontend second (Static Site)"
echo "✅ 5. Update CORS origins in server/index.js"

echo ""
echo "🔗 Useful links:"
echo "   - Render: https://render.com"
echo "   - MongoDB Atlas: https://cloud.mongodb.com"
echo "   - Documentation: https://render.com/docs"

echo ""
echo "Ready for deployment! 🎉"
