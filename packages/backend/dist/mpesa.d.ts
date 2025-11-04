import { Request, Response } from 'express';
export declare function loadMpesaSetup(_req: Request, res: Response): Promise<void>;
export declare function createMpesaOrder(_req: Request, res: Response): Promise<void>;
export declare function captureMpesaOrder(_req: Request, res: Response): Promise<void>;
