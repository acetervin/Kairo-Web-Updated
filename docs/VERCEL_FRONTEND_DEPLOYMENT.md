# Frontend Deployment on Vercel

This guide explains how to deploy the frontend independently on Vercel while the backend runs on Render.

## Overview

The frontend is configured to make API calls to your Render backend URL. All API calls are handled through the `apiUrl()` utility function which automatically uses the correct backend URL based on environment variables.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your backend running on Render (or any other hosting service)
3. Your Render backend URL (e.g., `https://your-backend.onrender.com`)

## Step 1: Prepare Your Repository

The frontend code has been updated to support independent deployment. All API calls now use the `apiUrl()` utility function which:
- Uses `VITE_API_URL` or `VITE_BACKEND_URL` environment variable in production
- Falls back to relative paths in development (handled by Vite proxy)

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to your project root:
   ```bash
   cd /path/to/boo-back
   ```

4. Deploy:
   ```bash
   vercel --prod
   ```

   When prompted:
   - **Set up and deploy?** Yes
   - **Which scope?** (Select your account)
   - **Link to existing project?** No (or Yes if you have an existing project)
   - **Project name?** (Enter a name or press Enter for default)
   - **Directory?** Enter `packages/frontend` or use the root (Vercel will auto-detect)
   - **Override settings?** No

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `packages/frontend` (or leave as root if using monorepo setup)
   - **Build Command:** `npm install && npm run build:frontend`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`

## Step 3: Configure Environment Variables

In your Vercel project settings, add the following environment variables:

1. Go to your project on Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `VITE_API_URL` | `https://your-backend.onrender.com` | Production, Preview, Development |
   | `VITE_BACKEND_URL` | `https://your-backend.onrender.com` | Production, Preview, Development (optional, fallback) |

   **Important:** Replace `https://your-backend.onrender.com` with your actual Render backend URL.

4. After adding environment variables, redeploy your application:
   - Go to **Deployments** tab
   - Click the **...** menu on the latest deployment
   - Select **Redeploy**

## Step 4: Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Open browser DevTools → Network tab
3. Navigate through the app and check that API calls are going to your Render backend
4. Verify that:
   - Properties load correctly
   - Booking flow works
   - Admin login works (if applicable)
   - Payment flows work (Stripe checkout redirects correctly)

## Step 5: Update Backend CORS Configuration

Make sure your Render backend allows requests from your Vercel domain:

1. Go to your Render backend environment variables
2. Update `CORS_ORIGINS` to include your Vercel URL:
   ```
   CORS_ORIGINS=http://localhost:5000,https://your-app.vercel.app,https://your-app-git-main.vercel.app
   ```
3. Restart your Render service

## Monorepo Configuration

If deploying from the monorepo root:

1. **Root Directory:** Leave as `.` (root)
2. **Build Command:** `npm install && npm run build:frontend`
3. **Output Directory:** `dist/public`
4. **Install Command:** `npm install`

Vercel will automatically detect the monorepo structure and install dependencies correctly.

## Troubleshooting

### API calls failing with CORS errors

- Verify your backend `CORS_ORIGINS` includes your Vercel domain
- Check that `VITE_API_URL` is set correctly in Vercel
- Ensure the backend URL doesn't have a trailing slash

### Environment variables not working

- Vite environment variables must be prefixed with `VITE_`
- After adding/updating environment variables, you must redeploy
- Check the build logs to ensure variables are being injected

### Build fails

- Ensure `npm run build:frontend` works locally
- Check that all dependencies are installed
- Verify the output directory path is correct (`dist/public`)

### API calls going to wrong URL

- Check browser console for the actual URLs being called
- Verify `VITE_API_URL` is set in Vercel environment variables
- Clear browser cache and hard refresh

## Development vs Production

- **Development:** Uses relative paths (`/api/...`) which are proxied by Vite to `localhost:3000`
- **Production:** Uses absolute URLs (`https://your-backend.onrender.com/api/...`) from `VITE_API_URL`

The `apiUrl()` utility function automatically handles this based on `import.meta.env.PROD`.

## Custom Domain

To use a custom domain:

1. Go to **Settings** → **Domains** in Vercel
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update backend `CORS_ORIGINS` to include your custom domain

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. To disable auto-deploy or configure branch-specific deployments:

1. Go to **Settings** → **Git**
2. Configure deployment settings as needed

## Additional Notes

- The frontend is a static SPA (Single Page Application)
- All routes are handled client-side by Wouter
- Vercel's rewrites ensure all routes serve `index.html` for proper routing
- API calls are made directly from the browser to your Render backend
- No server-side rendering is used (pure React SPA)

