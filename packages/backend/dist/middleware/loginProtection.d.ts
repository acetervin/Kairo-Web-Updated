export interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}
/**
 * Combined middleware that checks both rate limiting and account lockout
 * Account lockout takes precedence - if account is locked, return 423 immediately
 * For rate limiting, check lockout status before sending 429 response
 */
export declare function loginProtectionMiddleware(req: any, res: any, next: any): any;
