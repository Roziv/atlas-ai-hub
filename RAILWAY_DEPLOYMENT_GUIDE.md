# Railway Deployment Guide for Atlas AI Hub

## Overview
This guide will help you deploy Atlas AI Hub (frontend + backend) to Railway.com

Your project has:
- **Frontend**: Next.js app (my-clerk-app) - Port 3000
- **Backend**: Express.js API (backend) - Port 3001  
- **Database**: SQLite

---

## STEP 1: Create Railway Account & Project

### 1.1 Create Account
1. Go to https://railway.app/
2. Click **"Start Building"**
3. Sign up with GitHub (recommended for easier deployment)
4. Authorize Railway access to your GitHub

### 1.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub"**
3. Connect your GitHub repository (or upload manually)
4. Select the atlas-ai-hub repository

---

## STEP 2: Prepare Frontend (Next.js)

### 2.1 Create Production Environment File
Create file: `my-clerk-app/.env.production`

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app

# Node Environment
NODE_ENV=production
```

### 2.2 Verify Build Configuration
Your `my-clerk-app/package.json` should have:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

### 2.3 Update API Calls
In your frontend code, use the environment variable for API:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

---

## STEP 3: Prepare Backend (Express.js)

### 3.1 Create Production Environment File
Create file: `backend/.env.production`

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=file:./prisma/dev.db

# Clerk
CLERK_SECRET_KEY=your_clerk_secret_key

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.railway.app

# Optional: Add other API keys
```

### 3.2 Create Procfile
Create file: `backend/Procfile`

```
web: npm run start
```

### 3.3 Verify Backend Package.json
Should include:
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## STEP 4: Deploy to Railway (Step by Step)

### 4.1 Deploy Frontend

**Option A: Via Railway Dashboard**
1. Go to Railway dashboard
2. Click "New Service" → "GitHub Repo"
3. Select your repository
4. Set root directory: `my-clerk-app`
5. Add environment variables:
   - Copy from your `.env.production` file
6. Click "Deploy"

**Option B: Via Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway init
railway service add next
railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx
railway variables set CLERK_SECRET_KEY=xxx
railway up
```

### 4.2 Deploy Backend

1. In Railway dashboard, click "New Service" → "GitHub Repo"
2. Select same repository
3. Set root directory: `backend`
4. Add environment variables from `.env.production`
5. Set start command: `npm run start`
6. Click "Deploy"

### 4.3 Link Frontend to Backend

1. Get backend service URL from Railway dashboard
2. Update frontend `.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
3. Redeploy frontend

---

## STEP 5: Database Setup

### 5.1 SQLite on Railway
SQLite should work out of the box. The database file persists in Railway's file system.

### 5.2 Database Migrations
After backend deploys, run migrations:

1. In Railway backend service settings
2. Go to "Deployments"
3. In the active deployment, find the "Logs" tab
4. Run migration command (if needed):
   ```bash
   npx prisma migrate deploy
   ```

### 5.3 Seed Database (Optional)
If you have seed data:
```bash
npx prisma db seed
```

---

## STEP 6: Add Custom Domain

### 6.1 For Frontend
1. Go to frontend service in Railway
2. Click "Settings"
3. Find "Domains" section
4. Click "Add Domain"
5. Enter your domain (e.g., atlas.yourdomain.com)
6. Railway will generate DNS records
7. Add these records to your domain registrar (GoDaddy, Namecheap, etc.)

### 6.2 For Backend
1. Repeat same process for backend service
2. Use subdomain like api.yourdomain.com

---

## STEP 7: Verify Deployment

### 7.1 Test Frontend
1. Visit your frontend URL
2. Check browser console for errors
3. Verify logo loads
4. Test "Watch Demo" button

### 7.2 Test Backend
1. Visit `https://your-backend-url/health`
2. Should return `{"status": "ok"}`

### 7.3 Test API Connection
1. Click "Launch Dashboard" on landing page
2. Should attempt to load `/dashboard/manager`
3. If auth works, you'll see Clerk login

---

## STEP 8: Environment Variables Checklist

**Frontend needs:**
- ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- ✅ CLERK_SECRET_KEY
- ✅ NEXT_PUBLIC_API_URL

**Backend needs:**
- ✅ CLERK_SECRET_KEY
- ✅ ALLOWED_ORIGINS
- ✅ DATABASE_URL (optional, defaults to SQLite)
- ✅ PORT (set to 3001)

---

## STEP 9: Troubleshooting

### Frontend not loading
- Check browser console for errors
- Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set
- Check NEXT_PUBLIC_API_URL matches backend URL

### Backend returning 500 errors
- Check backend logs in Railway dashboard
- Verify CLERK_SECRET_KEY is correct
- Check ALLOWED_ORIGINS includes your frontend URL

### API calls failing
- Verify CORS is enabled in backend
- Check ALLOWED_ORIGINS matches frontend URL
- Test with `curl https://your-api.railway.app/health`

### Database errors
- Check SQLite file permissions
- Verify DATABASE_URL path
- Run migrations if needed

---

## STEP 10: Monitoring & Maintenance

### Monitor Deployments
1. Railway dashboard → Your project
2. Check logs for errors
3. Monitor resource usage
4. Set up alerts (optional)

### Update Code
```bash
git push origin main  # Railway auto-deploys on push
```

### View Logs
1. Railway dashboard → Service → "Logs" tab
2. Or use CLI: `railway logs`

---

## Estimated Timeline
- Account setup: 5 minutes
- Environment prep: 10 minutes
- Frontend deployment: 5 minutes
- Backend deployment: 5 minutes
- Testing & verification: 10 minutes
- **Total: ~35 minutes**

---

## Cost Estimate (Hobby Plan)
- Free credit: $5/month
- Estimated usage: $2-8/month
- **Total: Usually covered by free credits**

---

## Next Steps
1. ✅ Create Railway account
2. ✅ Prepare environment files
3. ✅ Deploy frontend
4. ✅ Deploy backend
5. ✅ Add custom domain (optional)
6. ✅ Test everything
7. ✅ Share live link!

Need help with any step? Let me know! 🚀
