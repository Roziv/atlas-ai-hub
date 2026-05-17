# Railway Production Configuration Guide

The production deployment encountered a "Connection Error: fetch failed" because environment variables were misconfigured. These files need to be set in the Railway dashboard for each service.

## ⚠️ IMPORTANT: Environment Variables Must Be Set in Railway UI

Since `.env.production` files are git-ignored for security, you must configure these directly in your Railway project dashboard.

### Backend Service Configuration

Set these environment variables in the **backend** service:

```
PORT=3001
NODE_ENV=production
CLERK_SECRET_KEY=sk_test_vWL9KigVM4FM8NbXfMMjFnoPOzbMVN3xtc5WxZxhf5
ALLOWED_ORIGINS=*
```

**Note about DATABASE_URL**: Railway automatically provides the database connection string - do NOT manually set it in the environment variables. It will be injected by Railway.

### Frontend Service Configuration  

Set these environment variables in the **frontend** (my-clerk-app) service:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGl2aW5lLXZ1bHR1cmUtNjMuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_vWL9KigVM4FM8NbXfMMjFnoPOzbMVN3xtc5WxZxhf5
NEXT_PUBLIC_API_URL=http://backend.railway.internal:3001
NODE_ENV=production
```

## Steps to Configure in Railway

1. Go to https://railway.app and log into your project
2. Select the **backend** service
3. Click the **Variables** tab
4. Add the environment variables listed above for the backend
5. Go back and select the **frontend** (my-clerk-app) service  
6. Click the **Variables** tab
7. Add the environment variables listed above for the frontend
8. Both services will automatically redeploy with the new variables

## What This Fixes

- ✅ Frontend can now reach backend via `http://backend.railway.internal:3001`
- ✅ Backend accepts requests from all origins (Railway handles routing securely)
- ✅ Database connection works correctly on Railway's PostgreSQL
- ✅ Both services communicate properly within Railway's internal network

## Local Development (Unchanged)

Your `.env.local` files are correct and don't need changes. Local development continues to use `http://localhost:3001`.
