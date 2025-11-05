"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaypalOrder = createPaypalOrder;
exports.capturePaypalOrder = capturePaypalOrder;
exports.loadPaypalDefault = loadPaypalDefault;
async function createPaypalOrder(_req, res) {
    res.status(410).json({ error: 'PayPal integration removed. Use Stripe endpoints instead.' });
}
async function capturePaypalOrder(_req, res) {
    res.status(410).json({ error: 'PayPal integration removed. Use Stripe endpoints instead.' });
}
async function loadPaypalDefault(_req, res) {
    res.status(410).json({ error: 'PayPal integration removed. Use Stripe endpoints instead.' });
}
