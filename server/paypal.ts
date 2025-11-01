// Deprecated PayPal integration
// PayPal support was removed and replaced with Stripe. Keep this file as a stub to avoid breaking imports.
import { Request, Response } from 'express';

export async function createPaypalOrder(_req: Request, res: Response) {
	res.status(410).json({ error: 'PayPal integration removed. Use Stripe endpoints instead.' });
}

export async function capturePaypalOrder(_req: Request, res: Response) {
	res.status(410).json({ error: 'PayPal integration removed. Use Stripe endpoints instead.' });
}

export async function loadPaypalDefault(_req: Request, res: Response) {
	res.status(410).json({ error: 'PayPal integration removed. Use Stripe endpoints instead.' });
}
