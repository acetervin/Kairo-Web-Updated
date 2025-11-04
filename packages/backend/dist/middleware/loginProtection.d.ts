import { Request, Response, NextFunction } from 'express';
/**
 * Combined middleware that checks both rate limiting and account lockout
 * Account lockout takes precedence - if account is locked, return 423 immediately
 * For rate limiting, check lockout status before sending 429 response
 */
export declare function loginProtectionMiddleware(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
