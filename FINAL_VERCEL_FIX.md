# Final Vercel Deployment Fix

## Current Issue (from logs)

**Error:** `Cannot find module '/var/task/dist/server/index.js' imported from /var/task/api/index.js`

This means the `dist/server/index.js` file is not being created or included in the function package.

## Root Cause

The `buildCommand` at the root level may not be running before the function is packaged, OR the build output isn't being included properly.

## Solution Applied

### 1. Added `buildCommand` to Function Config
Added `buildCommand: "npm run build:server"` directly to the function's config so it runs BEFORE the function is packaged.

### 2. Verified Source Code
- ✅ `server/index.ts` imports from `./utils.js` (not `./vite.js`)
- ✅ `server/utils.ts` exists with `log` and `serveStatic` functions
- ✅ No Vite dependencies in production code

### 3. Build Process

**What should happen:**
1. Root `buildCommand` runs → Creates `dist/server/index.js`
2. Function's `buildCommand` runs → Ensures build is done before packaging
3. `includeFiles` includes `dist/server/**` and `dist/shared/**`
4. Function packages with compiled code

## Build Output Structure

```
dist/
  ├── server/
  │   ├── index.js      ← Must exist (imports from utils.js)
  │   ├── utils.js      ← Must exist
  │   ├── db.js
  │   └── ...
  └── shared/
      └── schema.js
```

## Verification Steps

After deployment, check Vercel build logs for:

1. **Build logs should show:**
   ```
   > npm run build:server
   > tsc -p tsconfig.server.json && tsc-alias -p tsconfig.server.json
   ```
   - Should complete without errors
   - Should create `dist/server/index.js`

2. **Function logs should show:**
   - No "module not found" errors
   - Function initializes successfully

3. **If error persists:**
   - Check build logs to see if `buildCommand` actually ran
   - Verify `dist/server/index.js` was created
   - Check if `includeFiles` is working (might need to check function package)

## Alternative: If Build Command Doesn't Work

If the function config `buildCommand` doesn't work, we might need to:

1. **Use a pre-build script:**
   ```json
   "scripts": {
     "vercel-build": "npm run build:server && npm run build"
   }
   ```

2. **Or ensure build happens in install phase:**
   - Move build to `postinstall` script (not recommended, but might work)

3. **Or bundle everything differently:**
   - Use esbuild to bundle server code into a single file
   - Import that file directly

## Current Configuration

```json
{
  "buildCommand": "npm run build:server",  // Root level
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node",
      "config": {
        "buildCommand": "npm run build:server",  // Function level
        "includeFiles": ["dist/server/**", "dist/shared/**"]
      }
    }
  ]
}
```

This ensures the build runs both at root level AND before function packaging.

