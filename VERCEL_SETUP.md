# Quick Vercel Setup Guide

## One-Time Setup

1. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI (if not already installed)
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel --prod
   ```

2. **Set Environment Variable in Vercel Dashboard:**
   - Go to your project on https://vercel.com
   - Navigate to **Settings** → **Environment Variables**
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com`
     - Replace with your actual Render backend URL
   - Apply to: Production, Preview, and Development

3. **Update Backend CORS:**
   - In Render dashboard, update `CORS_ORIGINS` environment variable
   - Add your Vercel domain: `https://your-app.vercel.app`

4. **Redeploy:**
   - After setting environment variables, redeploy from Vercel dashboard

## What Changed

- ✅ All API calls now use `apiUrl()` utility function
- ✅ Frontend makes direct calls to Render backend URL
- ✅ `vercel.json` configured for frontend-only deployment
- ✅ Works independently from backend

## Full Documentation

See `docs/VERCEL_FRONTEND_DEPLOYMENT.md` for detailed instructions.

