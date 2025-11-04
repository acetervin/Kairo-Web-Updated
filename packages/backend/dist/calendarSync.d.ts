import { Request, Response } from 'express';
export declare function registerCalendarFeed(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function syncCalendarFeed(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function syncAllFeeds(): Promise<{
    imported: number;
    feeds: number;
}>;
export declare function getBlockedDates(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function exportPropertyICal(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
