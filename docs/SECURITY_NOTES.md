# Security Notes

## Known Vulnerabilities

### esbuild <=0.24.2 (Moderate)
**Affected Package:** `@esbuild-kit/core-utils` (dependency of `drizzle-kit`)
**Status:** Known issue, awaiting upstream fix
**Risk Level:** Low - Development only

**Details:**
- This vulnerability affects the development server only, not production builds
- The issue allows websites to send requests to the development server and read responses
- This is only exploitable if:
  1. You're running a development server
  2. A malicious website can make requests to your dev server (which should only be accessible locally/privately)

**Mitigation:**
- ✅ Vite has been updated to 6.4.1 (fixed)
- ⚠️ The esbuild vulnerability in drizzle-kit's dependency chain cannot be fixed via npm overrides due to nested dependency structure
- The drizzle-kit team will need to update `@esbuild-kit/core-utils` in a future release

**Recommendation:**
- Do not expose your development server to the public internet
- Use localhost or a private network for development
- Monitor drizzle-kit releases for updates that resolve this issue
- Consider using production builds for testing when possible

**Alternative:**
If you need to completely eliminate this vulnerability, you could:
1. Remove drizzle-kit from development dependencies and use it only via npx
2. Wait for drizzle-kit to update its dependencies
3. Use a different database migration tool

