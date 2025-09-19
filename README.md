# Quiz App - Frontend & Backend

A Vue 3 + Express.js quiz application with MongoDB storage.

## 🚀 Quick Start

### Frontend (Vue + Tailwind)
```bash
npm install
npm run dev
```
→ Opens http://localhost:5173

### Backend (Express + MongoDB)
```bash
cd server
npm install
# Create .env file (copy from .env.example and set MONGO_URI)
npm run dev
```
→ Opens http://localhost:5000

## 🌐 Deployment Options

### Option 1: Render (100% FREE) - RECOMMENDED

**Backend Deployment:**
1. Push code to GitHub
2. Go to [Render.com](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `quiz-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
7. Deploy (takes 2-3 minutes)
8. Copy the generated URL (e.g., `https://quiz-backend.onrender.com`)

**Frontend Deployment:**
1. Create another Render service
2. Click "New +" → "Static Site"
3. Connect same GitHub repository
4. Configure:
   - **Name**: `quiz-frontend`
   - **Root Directory**: `.` (leave empty or use dot)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://quiz-backend.onrender.com` (from step above)
6. Deploy

### Option 2: Netlify (Frontend) + Render (Backend)

Similar setup but use Netlify for static site hosting.

### Option 3: Both on Railway ($5/month)

Deploy both services on Railway for better performance.

### **💰 Cost Breakdown**

| Platform | Frontend | Backend | Database | Monthly Cost |
|----------|----------|---------|----------|--------------|
| **Render (Recommended)** | Free | Free* | MongoDB Atlas Free | **FREE** |
| **Netlify + Render** | Free | Free* | MongoDB Atlas Free | **FREE** |
| **Vercel + Railway** | Free | $5 | MongoDB Atlas Free | **$5** |
| **Railway Full** | $5 | $5 | $5 | **$15** |

*Render free tier: 750 hours/month (enough for small to medium usage)

### **🎯 Why Render is Perfect for Your Quiz App (100% FREE)**

✅ **Render advantages:**
- **Completely free** for both frontend and backend
- Simple deployment from GitHub
- Automatic HTTPS/SSL certificates
- Good performance on free tier
- 750 hours/month backend (≈25 days of 24/7 uptime)
- No credit card required
- Auto-deploys on code changes

## 🔧 Setup

1. **Frontend**: Already configured with Vue 3, TypeScript, Vite, and Tailwind CSS
2. **Backend**: Express server in `server/` folder with MongoDB integration
3. **Database**: Create `.env` in `server/` with your MongoDB Atlas connection:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster0.mongodb.net/quizdb
   PORT=5000
   ```

## 📁 Project Structure
```
├── src/              # Vue frontend
│   ├── services/     # API calls (axios)
│   └── style.css     # Tailwind directives
├── server/           # Express backend
│   ├── index.js      # Main server file
│   └── .env.example  # Environment template
└── README.md
```

## 🔑 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000  # Local development
# VITE_API_URL=https://your-backend.railway.app  # Production
```

### Backend (server/.env)
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/database
PORT=5000
NODE_ENV=development
```
Trigger Vercel redeploy
