# Security Enhancements

This document outlines the security enhancements that have been implemented to protect the admin authentication system.

## ✅ Implemented Security Features

### 1. **Rate Limiting**
- **Login endpoint**: 5 attempts per 15 minutes per IP address
- **General API**: 100 requests per minute per IP address
- Prevents brute-force attacks and API abuse
- Automatically cleans up old entries
- Returns rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)

**Files:**
- `server/middleware/rateLimiter.ts`

### 2. **Account Lockout**
- Locks account after 5 failed login attempts
- 15-minute lockout duration
- Prevents username enumeration by treating non-existent users the same
- Automatically resets after lockout period expires

**Files:**
- `server/middleware/accountLockout.ts`

### 3. **Password Validation**
- Minimum 8 characters
- Maximum 128 characters
- Requires uppercase letter
- Requires lowercase letter
- Requires number
- Requires special character
- Blocks common passwords

**Files:**
- `server/utils/passwordValidator.ts`

### 4. **Input Sanitization**
- Removes null bytes
- Trims whitespace
- Applied to all user inputs (username, name, email)
- Prevents injection attacks

**Files:**
- `server/utils/passwordValidator.ts` (includes `sanitizeInput`)

### 5. **Security Headers**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Enables XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` - Restricts resource loading
- `Permissions-Policy` - Restricts browser features
- `Strict-Transport-Security` - Enforces HTTPS (when using HTTPS)

**Files:**
- `server/middleware/securityHeaders.ts`

### 6. **Audit Logging**
- Logs all security events:
  - Login successes and failures
  - Account lockouts
  - User creation/updates/deletions
  - Password changes
  - Unauthorized access attempts
- Captures IP address and user agent
- Stores details about each event
- Can be stored in database (audit_logs table) or console

**Files:**
- `server/utils/auditLogger.ts`

### 7. **Enhanced Authentication Middleware**
- Verifies JWT tokens on all protected routes
- Logs unauthorized access attempts
- Provides detailed error messages (without exposing sensitive info)

### 8. **Protected Routes**
- Frontend routes protected with authentication checks
- Redirects to login if not authenticated
- Validates token on each route access

## 🔒 Security Best Practices Applied

1. **Defense in Depth**: Multiple layers of security
2. **Principle of Least Privilege**: Role-based access control
3. **Fail Secure**: Default deny, explicit allow
4. **Input Validation**: All inputs sanitized and validated
5. **Secure by Default**: Strong defaults, secure configurations
6. **Audit Trail**: All security events logged

## 📋 Configuration

### Rate Limiting
- Login: 5 attempts per 15 minutes
- API: 100 requests per minute

### Account Lockout
- Max failed attempts: 5
- Lockout duration: 15 minutes

### Password Requirements
- Minimum length: 8 characters
- Maximum length: 128 characters
- Must contain: uppercase, lowercase, number, special character

## 🚀 Production Recommendations

### 1. **Use Redis for Rate Limiting**
Currently using in-memory storage. For production, use Redis:
```typescript
// Example Redis implementation
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

### 2. **Use HTTPS Only**
Ensure all connections use HTTPS in production. The `Strict-Transport-Security` header is automatically applied when HTTPS is detected.

### 3. **Set Strong JWT Secret**
```bash
JWT_SECRET=your-very-strong-random-secret-key-here
```

### 4. **Enable Database Audit Logging**
Create the `audit_logs` table to store audit events persistently:
```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES admin_users(id),
  username VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 5. **Regular Security Audits**
- Review audit logs regularly
- Monitor failed login attempts
- Check for suspicious activity patterns
- Update dependencies regularly

### 6. **Add Two-Factor Authentication (2FA)**
Consider implementing 2FA for additional security:
- TOTP (Time-based One-Time Password)
- SMS verification
- Email verification

### 7. **Session Management**
- Implement token refresh mechanism
- Add device fingerprinting
- Implement session timeout
- Add "logout all devices" feature

### 8. **Additional Headers**
Consider adding:
- `X-Permitted-Cross-Domain-Policies`
- `Cross-Origin-Embedder-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`

## 🔍 Monitoring

### Key Metrics to Monitor
1. Failed login attempts
2. Account lockouts
3. Unauthorized access attempts
4. Rate limit violations
5. Password changes
6. User creation/deletion

### Alert Thresholds
- Multiple failed logins from same IP
- Account lockouts
- Unusual access patterns
- Rate limit violations

## 📝 Notes

- Current implementation uses in-memory storage for rate limiting and account lockout
- For production scale, migrate to Redis or similar distributed cache
- Audit logs are logged to console if database table doesn't exist
- Security headers are applied to all routes automatically
- Rate limiting is applied to all API routes

## 🛡️ Additional Security Considerations

1. **CSRF Protection**: Consider adding CSRF tokens for state-changing operations
2. **CORS Configuration**: Configure CORS properly for production
3. **API Versioning**: Implement API versioning for backward compatibility
4. **Request Size Limits**: Set limits on request body size
5. **Timeout Configuration**: Set appropriate timeouts for requests
6. **Error Handling**: Don't expose sensitive information in error messages
7. **Dependency Scanning**: Regularly scan for vulnerable dependencies
8. **Secrets Management**: Use secret management services (AWS Secrets Manager, etc.)

