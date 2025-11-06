export interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}
export declare function createRateLimiter(windowMs: number, maxRequests: number, identifier?: (req: any) => string): (req: any, res: any, next: any) => void;
export declare const loginRateLimiter: (req: any, res: any, next: any) => void;
export declare const generalRateLimiter: (req: any, res: any, next: any) => void;
export {};
