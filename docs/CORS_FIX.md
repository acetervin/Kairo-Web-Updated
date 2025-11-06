# Fix CORS Errors for Vercel Frontend

If you're seeing CORS errors like:
```
Access to fetch at 'https://your-backend.onrender.com/api/properties' from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

Follow these steps:

## Quick Fix

1. **Go to Render Dashboard:**
   - Navigate to your backend service
   - Click on **Environment** tab

2. **Update CORS_ORIGINS:**
   - Find the `CORS_ORIGINS` environment variable
   - Add your Vercel domain(s) to the comma-separated list:
   
   **Current value might look like:**
   ```
   http://localhost:5000,http://127.0.0.1:5000
   ```
   
   **Update to:**
   ```
   http://localhost:5000,http://127.0.0.1:5000,https://kairo-web-updated.vercel.app,https://kairo-web-updated-*.vercel.app
   ```
   
   Replace `kairo-web-updated` with your actual Vercel project name.

3. **Save Changes:**
   - Click **Save Changes**
   - Render will automatically restart your service
   - Wait 1-2 minutes for the restart to complete

4. **Test:**
   - Refresh your Vercel app
   - The CORS errors should be gone

## Understanding the CORS_ORIGINS Format

- Comma-separated list of allowed origins
- Include your production Vercel domain: `https://your-app.vercel.app`
- Include preview deployments: `https://your-app-*.vercel.app` (wildcard pattern)
- Keep local development URLs for local testing

## Example Configuration

If your Vercel app is at `https://my-app.vercel.app`, your `CORS_ORIGINS` should be:

```
http://localhost:5000,http://127.0.0.1:5000,http://localhost:3000,https://my-app.vercel.app,https://my-app-*.vercel.app
```

## Verify CORS is Working

After updating, check the browser console. You should see:
- ✅ No CORS errors
- ✅ API requests succeeding
- ✅ Data loading correctly

If you still see errors:
1. Make sure you saved the environment variable in Render
2. Wait for Render to restart the service
3. Clear your browser cache
4. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)




