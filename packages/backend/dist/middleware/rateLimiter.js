"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalRateLimiter = exports.loginRateLimiter = void 0;
exports.createRateLimiter = createRateLimiter;
// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = {};
// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach((key) => {
        if (rateLimitStore[key].resetTime < now) {
            delete rateLimitStore[key];
        }
    });
}, 60000); // Clean up every minute
function createRateLimiter(windowMs, maxRequests, identifier) {
    return (req, res, next) => {
        // Get identifier (IP address or custom function)
        const id = identifier ? identifier(req) : req.ip || req.socket.remoteAddress || 'unknown';
        const key = `${id}`;
        const now = Date.now();
        // Initialize or get existing entry
        if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
            rateLimitStore[key] = {
                count: 0,
                resetTime: now + windowMs,
            };
        }
        rateLimitStore[key].count++;
        // Check if limit exceeded
        if (rateLimitStore[key].count > maxRequests) {
            // Store retryAfter on request for potential use by route handler
            req.rateLimitRetryAfter = Math.ceil((rateLimitStore[key].resetTime - now) / 1000);
            const resetTime = new Date(rateLimitStore[key].resetTime).toISOString();
            res.status(429).json({
                message: 'Too many requests',
                error: `Rate limit exceeded. Try again after ${resetTime}`,
                retryAfter: Math.ceil((rateLimitStore[key].resetTime - now) / 1000),
            });
            return;
        }
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - rateLimitStore[key].count));
        res.setHeader('X-RateLimit-Reset', new Date(rateLimitStore[key].resetTime).toISOString());
        next();
    };
}
// Specific rate limiters
exports.loginRateLimiter = createRateLimiter(15 * 60 * 1000, // 15 minutes
5, // 5 attempts per 15 minutes
(req) => `login:${req.ip || req.socket.remoteAddress || 'unknown'}`);
exports.generalRateLimiter = createRateLimiter(60 * 1000, // 1 minute
100, // 100 requests per minute
(req) => req.ip || req.socket.remoteAddress || 'unknown');
module.exports = { createRateLimiter, loginRateLimiter: exports.loginRateLimiter, generalRateLimiter: exports.generalRateLimiter };
