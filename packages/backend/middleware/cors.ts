/**
 * CORS middleware for allowing cross-origin requests
 * Fully configurable via environment variables - NO hardcoded values
 * 
 * Required environment variables:
 * - CORS_ORIGINS: Comma-separated list of allowed origins (required)
 * - CORS_METHODS: Comma-separated list of allowed HTTP methods (required)
 * - CORS_HEADERS: Comma-separated list of allowed headers (required)
 * 
 * Optional environment variables:
 * - CORS_ENABLED: Enable/disable CORS entirely (set to 'false' to disable, otherwise enabled)
 * - CORS_CREDENTIALS: Whether to allow credentials (set to 'true' to enable, otherwise disabled)
 * - CORS_MAX_AGE: Max age for preflight requests in seconds (must be set to use)
 * 
 * Legacy support (only used if CORS_ORIGINS is not set):
 * - FRONTEND_URL: Single frontend URL (will be added to allowed origins)
 * - ORIGIN: Alias for FRONTEND_URL
 */
function cors(req: any, res: any, next: any) {
  // Check if CORS is disabled
  if (process.env.CORS_ENABLED === 'false') {
    return next();
  }

  // Get all configuration from environment - no defaults
  const corsOrigins = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || process.env.ORIGIN;
  const corsMethods = process.env.CORS_METHODS;
  const corsHeaders = process.env.CORS_HEADERS;
  
  // If required environment variables are not set, skip CORS
  if (!corsOrigins || !corsMethods || !corsHeaders) {
    return next();
  }

  const origin = req.headers.origin;
  
  // Parse allowed origins from environment
  const allowedOrigins: string[] = corsOrigins.split(',').map(o => o.trim()).filter(Boolean);
  
  // Check if origin is allowed
  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => {
      // Support wildcard subdomains (e.g., *.example.com)
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\./g, '\\.').replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return origin === allowed || origin.startsWith(allowed);
    });
    
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else if (allowedOrigins.length > 0 && allowedOrigins[0] === '*') {
    // Allow all origins if explicitly set to '*'
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Set CORS headers from environment variables only
  res.setHeader('Access-Control-Allow-Methods', corsMethods);
  res.setHeader('Access-Control-Allow-Headers', corsHeaders);
  
  // Credentials - only set if explicitly configured
  if (process.env.CORS_CREDENTIALS === 'true' && res.getHeader('Access-Control-Allow-Origin') !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Max age - only set if explicitly configured
  if (process.env.CORS_MAX_AGE) {
    res.setHeader('Access-Control-Max-Age', process.env.CORS_MAX_AGE);
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
}

module.exports = { cors };

export {};