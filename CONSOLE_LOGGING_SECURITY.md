# Console Logging Security

## 🔒 Security Improvements

Console logging has been made more secure to prevent exposure of sensitive information in production environments.

### Changes Made:

1. **Environment-Based Logging:**
   - Console logs only appear in `development` mode by default
   - Production logs are minimal and sanitized
   - Optional `ENABLE_CONSOLE_AUDIT=true` for sanitized console logs in production

2. **Data Sanitization:**
   - **Usernames:** Masked (e.g., `ad***` instead of `admin`)
   - **IP Addresses:** Partial masking (e.g., `192.168.**` instead of full IP)
   - **User Agents:** Not logged to console (too verbose)
   - **Sensitive Details:** Only reason/type logged, not full details

3. **Account Lockout Logs:**
   - Only logged in development mode
   - No sensitive information exposed in production

### Security Best Practices:

✅ **In Production:**
- Console logs are minimal and don't expose sensitive data
- Full audit trail stored securely in database
- Only error messages logged (no usernames/IPs)

✅ **In Development:**
- Full debug logs for troubleshooting
- All account lockout events visible
- Sanitized audit logs to console (if database unavailable)

### Configuration:

**Production (default):**
```env
NODE_ENV=production
# Console logs: Minimal, sanitized errors only
# Full audit: Database only
```

**Development:**
```env
NODE_ENV=development
# Console logs: Full debug information
# Full audit: Database + console (if DB fails)
```

**Production with Console Audit (optional):**
```env
NODE_ENV=production
ENABLE_CONSOLE_AUDIT=true
# Console logs: Sanitized audit events
# Full audit: Database + sanitized console
```

### What's Safe Now:

- ✅ Usernames are masked in console logs
- ✅ IP addresses are partially masked
- ✅ Full sensitive details only in database
- ✅ Account lockout info only in development
- ✅ Error messages don't expose internal details
- ✅ Production logs are minimal and secure

### What to Monitor:

1. **Database Audit Logs:** Primary source of truth
2. **Error Logs:** Only log errors, not sensitive data
3. **Development Logs:** Full details only in dev mode

## 📊 Recommended Setup

For production, rely on:
1. **Database audit_logs table** - Primary audit trail
2. **Application monitoring** (e.g., Sentry) - Error tracking
3. **Server logs** - Minimal, sanitized error logs only

Do NOT rely on console logs for security auditing in production.

