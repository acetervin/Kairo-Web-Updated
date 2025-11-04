import { Request, Response, NextFunction } from 'express';
export declare function createRateLimiter(windowMs: number, maxRequests: number, identifier?: (req: Request) => string): (req: Request, res: Response, next: NextFunction) => void;
export declare const loginRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const generalRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
