import { Request, Response } from 'express';
export declare function createPaymentIntent(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createCheckoutSession(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createBookingAndCheckout(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function stripeWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
