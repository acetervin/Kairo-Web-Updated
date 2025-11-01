// Placeholder Mpesa payment backend integration
// Implement actual Mpesa API integration here

import { Request, Response } from 'express';

// Deprecated M-Pesa integration
// M-Pesa support was removed and replaced with Stripe. Keep this file as a stub to avoid breaking imports.

export async function loadMpesaSetup(_req: Request, res: Response) {
  res.status(410).json({ error: 'M-Pesa integration removed. Use Stripe endpoints instead.' });
}

export async function createMpesaOrder(_req: Request, res: Response) {
  res.status(410).json({ error: 'M-Pesa integration removed. Use Stripe endpoints instead.' });
}

export async function captureMpesaOrder(_req: Request, res: Response) {
  res.status(410).json({ error: 'M-Pesa integration removed. Use Stripe endpoints instead.' });
}
