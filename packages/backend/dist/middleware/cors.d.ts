import { Request, Response, NextFunction } from 'express';
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
export declare function cors(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
