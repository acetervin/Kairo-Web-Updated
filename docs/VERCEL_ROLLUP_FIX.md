# Vercel Rollup/Vite Runtime Error Fix

## Problem
Rollup was being loaded at runtime in the serverless function, causing errors because native binaries weren't available.

## Root Cause
1. `dist/server/index.js` was importing from `./vite.js`
2. `vite.js` imports Vite, which imports Rollup
3. Rollup tries to load native binaries at runtime
4. These binaries aren't available in Vercel's serverless environment

## Solution Applied

### 1. Created `server/utils.ts`
- Extracted `log` and `serveStatic` functions
- No Vite/Rollup dependencies
- Used only by production code

### 2. Updated `server/index.ts`
- Changed import from `./vite.js` to `./utils.js`
- Production code no longer imports Vite

### 3. Updated `vercel.json`
- Added `excludeFiles` to prevent vite/rollup from being bundled:
  ```json
  "excludeFiles": [
    "dist/server/vite.js",
    "dist/server/start.js",
    "node_modules/vite/**",
    "node_modules/rollup/**",
    "node_modules/@rollup/**"
  ]
  ```

### 4. Removed Optional Rollup Dependency
- Removed `@rollup/rollup-linux-x64-gnu` from `optionalDependencies`
- This was causing npm installation issues

## File Structure

```
server/
  ├── index.ts       → imports from utils.js (production)
  ├── utils.ts       → no vite dependency (production)
  ├── vite.ts        → only used in development
  └── start.ts       → only used in development
```

## Build Process

1. **Vercel builds:**
   - `buildCommand` runs → compiles `server/index.ts` → `dist/server/index.js`
   - New compiled code imports from `./utils.js` (not `./vite.js`)

2. **Function packaging:**
   - `includeFiles` includes `dist/server/**`
   - `excludeFiles` excludes `vite.js`, `start.js`, and rollup modules
   - Result: Function has no Vite/Rollup dependencies

## Verification

After deployment, check:
1. No "Cannot find module @rollup" errors
2. API endpoints work correctly
3. Function logs show no rollup-related errors

## If Error Persists

If you still see rollup errors after deployment:
1. Check that `dist/server/index.js` imports from `utils.js` (not `vite.js`)
2. Verify `dist/server/utils.js` exists
3. Check function package doesn't include `node_modules/rollup`

## Alternative Solution (if needed)

If excludeFiles doesn't work, you can:
1. Use Vercel's `installCommand` to explicitly exclude devDependencies:
   ```json
   "installCommand": "npm install --production=false && npm prune --production"
   ```

2. Or ensure vite is truly only in devDependencies and not being bundled

