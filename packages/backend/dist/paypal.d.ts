import { Request, Response } from 'express';
export declare function createPaypalOrder(_req: Request, res: Response): Promise<void>;
export declare function capturePaypalOrder(_req: Request, res: Response): Promise<void>;
export declare function loadPaypalDefault(_req: Request, res: Response): Promise<void>;
