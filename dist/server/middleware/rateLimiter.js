// In-memory store for rate limiting (use Redis in production)
var rateLimitStore = {};
// Clean up old entries periodically
setInterval(function () {
    var now = Date.now();
    Object.keys(rateLimitStore).forEach(function (key) {
        if (rateLimitStore[key].resetTime < now) {
            delete rateLimitStore[key];
        }
    });
}, 60000); // Clean up every minute
export function createRateLimiter(windowMs, maxRequests, identifier) {
    return function (req, res, next) {
        // Get identifier (IP address or custom function)
        var id = identifier ? identifier(req) : req.ip || req.socket.remoteAddress || 'unknown';
        var key = "".concat(id);
        var now = Date.now();
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
            var resetTime = new Date(rateLimitStore[key].resetTime).toISOString();
            res.status(429).json({
                message: 'Too many requests',
                error: "Rate limit exceeded. Try again after ".concat(resetTime),
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
export var loginRateLimiter = createRateLimiter(15 * 60 * 1000, // 15 minutes
5, // 5 attempts per 15 minutes
function (req) { return "login:".concat(req.ip || req.socket.remoteAddress || 'unknown'); });
export var generalRateLimiter = createRateLimiter(60 * 1000, // 1 minute
100, // 100 requests per minute
function (req) { return req.ip || req.socket.remoteAddress || 'unknown'; });
