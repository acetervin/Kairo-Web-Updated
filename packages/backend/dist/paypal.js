export async function createPaypalOrder(_req, res) {
    res.status(410).json({ error: 'PayPal integration removed. Use Stripe endpoints instead.' });
}
export async function capturePaypalOrder(_req, res) {
    res.status(410).json({ error: 'PayPal integration removed. Use Stripe endpoints instead.' });
}
export async function loadPaypalDefault(_req, res) {
    res.status(410).json({ error: 'PayPal integration removed. Use Stripe endpoints instead.' });
}
