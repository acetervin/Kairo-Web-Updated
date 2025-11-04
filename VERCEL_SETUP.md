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

2. **Configure Vercel Project Settings:**
   - Go to your project on https://vercel.com
   - Navigate to **Settings** → **Build and Deployment**
   - **Option A (Recommended):** Set Root Directory to `.` (empty/root)
     - **Output Directory:** `dist/public`
     - **Build Command:** `npm install && npm run build --workspace=@boo-back/frontend`
   - **Option B:** Keep Root Directory as `packages/frontend`
     - **Output Directory:** `../../dist/public`
     - **Build Command:** `npm install && npm run build --workspace=@boo-back/frontend`
   - Save the settings

3. **Set Environment Variable in Vercel Dashboard:**
   - Navigate to **Settings** → **Environment Variables**
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com`
     - Replace with your actual Render backend URL
   - Apply to: Production, Preview, and Development

4. **Update Backend CORS (CRITICAL):**
   - Go to your Render dashboard
   - Navigate to your backend service → **Environment** tab
   - Find the `CORS_ORIGINS` environment variable
   - Update it to include your Vercel domain(s):
     ```
     http://localhost:5000,http://127.0.0.1:5000,https://kairo-web-updated.vercel.app,https://kairo-web-updated-*.vercel.app
     ```
     - Replace `kairo-web-updated` with your actual Vercel project name
     - The `*.vercel.app` pattern allows preview deployments
   - **Save the changes** - Render will automatically restart your service
   - Wait for the service to restart (usually 1-2 minutes)

5. **Redeploy:**
   - After setting environment variables, redeploy from Vercel dashboard

## What Changed

- ✅ All API calls now use `apiUrl()` utility function
- ✅ Frontend makes direct calls to Render backend URL
- ✅ `vercel.json` configured for frontend-only deployment
- ✅ Works independently from backend

## Full Documentation

See `docs/VERCEL_FRONTEND_DEPLOYMENT.md` for detailed instructions.

