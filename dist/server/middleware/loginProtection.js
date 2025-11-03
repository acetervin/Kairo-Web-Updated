import { checkAccountLockout, checkAccountLockoutSync } from './accountLockout.js';
import { sanitizeInput } from '../utils/passwordValidator.js';
// Rate limit store for login
var loginRateLimitStore = {};
// Clean up old entries periodically
setInterval(function () {
    var now = Date.now();
    Object.keys(loginRateLimitStore).forEach(function (key) {
        if (loginRateLimitStore[key].resetTime < now) {
            delete loginRateLimitStore[key];
        }
    });
}, 60000); // Clean up every minute
/**
 * Combined middleware that checks both rate limiting and account lockout
 * Account lockout takes precedence - if account is locked, return 423 immediately
 * For rate limiting, check lockout status before sending 429 response
 */
export function loginProtectionMiddleware(req, res, next) {
    var _a;
    var username = sanitizeInput(((_a = req.body) === null || _a === void 0 ? void 0 : _a.username) || '');
    var windowMs = 15 * 60 * 1000; // 15 minutes
    var maxRequests = 5; // 5 attempts per 15 minutes
    // First check account lockout (takes precedence)
    if (username) {
        checkAccountLockout(username).then(function (lockoutStatus) {
            if (lockoutStatus.isLocked && lockoutStatus.lockedUntil) {
                // Account is locked - return 423 immediately, skip rate limiter
                return res.status(423).json({
                    message: 'Account temporarily locked',
                    error: "Too many failed login attempts. Account locked until ".concat(lockoutStatus.lockedUntil.toISOString()),
                    lockedUntil: lockoutStatus.lockedUntil.toISOString(),
                });
            }
            // Account is not locked, now check rate limiting
            var id = "login:".concat(req.ip || req.socket.remoteAddress || 'unknown');
            var key = "".concat(id);
            var now = Date.now();
            // Initialize or get existing entry
            if (!loginRateLimitStore[key] || loginRateLimitStore[key].resetTime < now) {
                loginRateLimitStore[key] = {
                    count: 0,
                    resetTime: now + windowMs,
                };
            }
            loginRateLimitStore[key].count++;
            // Check if limit exceeded
            if (loginRateLimitStore[key].count > maxRequests) {
                // Before sending 429, check account lockout status (synchronously)
                var currentLockoutStatus = checkAccountLockoutSync(username);
                // If account is already locked, send 423 instead of 429
                if (currentLockoutStatus.isLocked && currentLockoutStatus.lockedUntil) {
                    return res.status(423).json({
                        message: 'Account temporarily locked',
                        error: "Too many failed login attempts. Account locked until ".concat(currentLockoutStatus.lockedUntil.toISOString()),
                        lockedUntil: currentLockoutStatus.lockedUntil.toISOString(),
                        accountLocked: true,
                    });
                }
                // If account is one attempt away from lockout (4 failed attempts),
                // allow this request through so the route handler can properly lock it
                if (currentLockoutStatus.remainingAttempts === 1) {
                    // Don't rate limit - let route handler process and lock the account
                    res.setHeader('X-RateLimit-Limit', maxRequests);
                    res.setHeader('X-RateLimit-Remaining', 0);
                    res.setHeader('X-RateLimit-Reset', new Date(loginRateLimitStore[key].resetTime).toISOString());
                    next();
                    return;
                }
                // Rate limited and account won't be locked by this request
                var retryAfter = Math.ceil((loginRateLimitStore[key].resetTime - now) / 1000);
                var resetTime = new Date(loginRateLimitStore[key].resetTime).toISOString();
                return res.status(429).json({
                    message: 'Too many requests',
                    error: "Rate limit exceeded. Try again after ".concat(resetTime),
                    retryAfter: retryAfter,
                    remainingAttempts: currentLockoutStatus.remainingAttempts,
                });
            }
            // Add rate limit headers
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - loginRateLimitStore[key].count));
            res.setHeader('X-RateLimit-Reset', new Date(loginRateLimitStore[key].resetTime).toISOString());
            // Continue to route handler
            next();
        }).catch(function () {
            // If lockout check fails, allow request through (don't block)
            next();
        });
    }
    else {
        // No username, just check rate limiting
        var id = "login:".concat(req.ip || req.socket.remoteAddress || 'unknown');
        var key = "".concat(id);
        var now = Date.now();
        if (!loginRateLimitStore[key] || loginRateLimitStore[key].resetTime < now) {
            loginRateLimitStore[key] = {
                count: 0,
                resetTime: now + windowMs,
            };
        }
        loginRateLimitStore[key].count++;
        if (loginRateLimitStore[key].count > maxRequests) {
            var retryAfter = Math.ceil((loginRateLimitStore[key].resetTime - now) / 1000);
            var resetTime = new Date(loginRateLimitStore[key].resetTime).toISOString();
            return res.status(429).json({
                message: 'Too many requests',
                error: "Rate limit exceeded. Try again after ".concat(resetTime),
                retryAfter: retryAfter,
            });
        }
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - loginRateLimitStore[key].count));
        res.setHeader('X-RateLimit-Reset', new Date(loginRateLimitStore[key].resetTime).toISOString());
        next();
    }
}
