# Token Refresh & Audit Log Implementation

## ✅ Implementation Complete

### 1. Database Audit Logs Table

**Migration File:** `migrations/0107_create_audit_logs.sql`

The audit_logs table stores all security events persistently in the database.

**To apply the migration:**
```bash
# Option 1: Run the SQL directly in your database
psql your_database_url < migrations/0107_create_audit_logs.sql

# Option 2: Use your database client to execute the SQL file
```

**Table Structure:**
- `id` - Primary key
- `event_type` - Type of event (LOGIN_SUCCESS, LOGIN_FAILURE, etc.)
- `user_id` - Reference to admin_users (nullable)
- `username` - Username (for tracking even if user is deleted)
- `ip_address` - Client IP address
- `user_agent` - Browser/client information
- `details` - Additional event details (JSONB)
- `success` - Whether the event was successful
- `created_at` - Timestamp of the event

**Indexes:**
- Indexed on `event_type`, `user_id`, `created_at`, `username`, `ip_address`, and `success` for fast queries

### 2. Token Refresh Mechanism

**Backend Endpoint:** `POST /api/admin/refresh`

Allows refreshing JWT tokens without requiring re-login. Features:
- Works even with expired tokens (within reason)
- Validates user still exists and is active
- Logs refresh events to audit log
- Returns new token with 24-hour expiration

**Frontend Implementation:**
- **Automatic Refresh:** Tokens are automatically refreshed every 30 minutes
- **Pre-expiry Refresh:** Tokens refresh when they're within 1 hour of expiration
- **On-Demand Refresh:** ProtectedRoute attempts to refresh expired tokens automatically
- **Auto-refresh Service:** Runs in AdminLayout component while user is logged in

**Files Created/Modified:**
- `client/src/utils/tokenRefresh.ts` - Token refresh utilities
- `client/src/components/admin/ProtectedRoute.tsx` - Updated to use token refresh
- `client/src/components/admin/AdminLayout.tsx` - Auto-refresh on mount
- `server/routes/admin.ts` - Added `/refresh` endpoint

## 🔄 How Token Refresh Works

### Automatic Refresh Flow:
1. User logs in → receives JWT token (24h expiration)
2. AdminLayout mounts → starts auto-refresh service
3. Every 30 minutes → checks if token needs refresh
4. If token expires within 1 hour → automatically refreshes
5. On 401 errors → ProtectedRoute attempts refresh automatically
6. User stays logged in seamlessly

### Manual Refresh:
```typescript
import { refreshToken } from '@/utils/tokenRefresh';

// Check and refresh if needed
const refreshed = await checkAndRefreshToken();

// Force refresh
const refreshed = await refreshToken();
```

## 📊 Audit Logging

All security events are now stored in the database:

### Event Types:
- `LOGIN_SUCCESS` - Successful login
- `LOGIN_FAILURE` - Failed login attempt
- `LOGIN_LOCKOUT` - Account locked due to failed attempts
- `LOGOUT` - User logout
- `USER_CREATED` - New admin user created
- `USER_UPDATED` - Admin user updated
- `USER_DELETED` - Admin user deleted
- `PASSWORD_CHANGED` - Password changed
- `UNAUTHORIZED_ACCESS` - Failed authentication attempts
- `PROPERTY_CREATED`, `PROPERTY_UPDATED`, `PROPERTY_DELETED`
- `BOOKING_UPDATED`, `BOOKING_DELETED`

### Querying Audit Logs:

```sql
-- View all login attempts
SELECT * FROM audit_logs 
WHERE event_type IN ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGIN_LOCKOUT')
ORDER BY created_at DESC;

-- Failed login attempts in last 24 hours
SELECT username, ip_address, created_at, details
FROM audit_logs
WHERE event_type = 'LOGIN_FAILURE'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- User activity for specific user
SELECT * FROM audit_logs
WHERE user_id = 1
ORDER BY created_at DESC;

-- Unauthorized access attempts
SELECT ip_address, user_agent, created_at, details
FROM audit_logs
WHERE event_type = 'UNAUTHORIZED_ACCESS'
ORDER BY created_at DESC;
```

## 🚀 Benefits

### Token Refresh:
- **Seamless UX:** Users don't get logged out unexpectedly
- **Security:** Tokens still expire, but refresh extends sessions
- **Automatic:** Works in the background, user doesn't notice
- **Resilient:** Handles network errors gracefully

### Audit Logs:
- **Security Monitoring:** Track all authentication events
- **Compliance:** Maintain audit trail for security audits
- **Forensics:** Investigate security incidents
- **Analytics:** Understand login patterns and failures

## 📝 Notes

1. **Token Refresh Grace Period:**
   - Tokens refresh automatically 1 hour before expiration
   - This prevents expiration during active sessions
   - Refresh happens every 30 minutes as a safety check

2. **Audit Log Performance:**
   - All inserts are async and don't block requests
   - If database insert fails, events are logged to console
   - Indexes ensure fast queries even with many logs

3. **Production Considerations:**
   - Consider archiving old audit logs (>90 days) to separate table
   - Set up monitoring/alerts for unusual patterns
   - Regular reviews of failed login attempts
   - Consider rate limiting audit log queries

4. **Migration:**
   - The audit_logs table is optional - if it doesn't exist, events log to console
   - Run the migration to enable persistent logging
   - Existing code works whether table exists or not

## 🔍 Testing

### Test Token Refresh:
1. Login to admin panel
2. Wait for automatic refresh (check console logs)
3. Make API calls - they should work even after token would have expired
4. Check localStorage - token should be updated automatically

### Test Audit Logs:
1. Perform various admin actions (login, create user, etc.)
2. Query the audit_logs table
3. Verify all events are recorded with correct details

## ✅ Status

Both features are fully implemented and ready for use!

