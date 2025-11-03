# Vercel includeFiles Fix for dist Folder

## Problem
The serverless function couldn't find `/var/task/dist/server/index.js` even though the import path was correct. The issue was that the compiled `dist` folder wasn't being included in the function package.

## Solution Applied

### 1. Created Separate Build Script
Added `build:server` script in `package.json`:
```json
{
  "scripts": {
    "build:server": "tsc -p tsconfig.server.json && tsc-alias -p tsconfig.server.json"
  }
}
```

### 2. Updated vercel.json
- Root `buildCommand` runs `npm run build:server` to compile TypeScript first
- `functions` API with `includeFiles: "dist/**"` to include all compiled files
- Used string format instead of array for `includeFiles` (some Vercel versions prefer this)

### 3. Created .vercelignore
Created `.vercelignore` to ensure `dist` folder isn't excluded:
```
# Don't exclude dist folder - it's needed for serverless functions
node_modules
.env*
```

## How It Works

**Build Order:**
1. Root `buildCommand` runs → compiles `server/**` to `dist/server/**`
2. Function build runs → `@vercel/node` packages `api/index.ts`
3. `includeFiles` ensures `dist/**` is included in the function package

**File Structure in Deployment:**
```
/var/task/
  ├── api/
  │   └── index.js (compiled from api/index.ts)
  └── dist/
      ├── server/
      │   └── index.js ← This file must be included
      └── shared/
          └── schema.js
```

## Verification

After deployment, check:
1. Function logs should show no "module not found" errors
2. API endpoints should respond correctly
3. You can inspect the function package in Vercel dashboard (if available)

## Alternative Solutions (If This Doesn't Work)

### Option 1: Use Dynamic Import
```typescript
// In api/index.ts
const { createApp } = await import('../dist/server/index.js');
```
This might work better with some Vercel configurations.

### Option 2: Bundle Everything
Use a bundler (esbuild, rollup) to create a single bundled file instead of separate modules.

### Option 3: Copy dist to api folder
Add a build step that copies `dist/server/**` to `api/server/**` before packaging.

## Troubleshooting

If files still aren't included:

1. **Check build logs**: Verify `buildCommand` actually runs and creates `dist/server/index.js`
2. **Verify paths**: Make sure `includeFiles` paths match actual file locations
3. **Check .vercelignore**: Ensure `dist` isn't being ignored
4. **Try absolute paths**: Some versions require absolute paths in `includeFiles`
5. **Check Vercel version**: Newer Vercel versions handle `includeFiles` differently

## Key Takeaways

- `includeFiles` in `functions` API is more reliable than in `builds` config
- Root `buildCommand` must run before function packaging
- `.vercelignore` should explicitly allow `dist` folder
- Always verify files exist after build before packaging

