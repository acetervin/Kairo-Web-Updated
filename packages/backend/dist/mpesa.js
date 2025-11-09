"use strict";
// Placeholder Mpesa payment backend integration
// Implement actual Mpesa API integration here
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMpesaSetup = loadMpesaSetup;
exports.createMpesaOrder = createMpesaOrder;
exports.captureMpesaOrder = captureMpesaOrder;
// Deprecated M-Pesa integration
// M-Pesa support was removed and replaced with Stripe. Keep this file as a stub to avoid breaking imports.
async function loadMpesaSetup(_req, res) {
    res.status(410).json({ error: 'M-Pesa integration removed. Use Stripe endpoints instead.' });
}
async function createMpesaOrder(_req, res) {
    res.status(410).json({ error: 'M-Pesa integration removed. Use Stripe endpoints instead.' });
}
async function captureMpesaOrder(_req, res) {
    res.status(410).json({ error: 'M-Pesa integration removed. Use Stripe endpoints instead.' });
}
