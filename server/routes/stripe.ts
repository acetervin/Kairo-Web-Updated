
import { Router } from 'express';
import express from 'express';
import { createCheckoutSession, createBookingAndCheckout, stripeWebhook } from '../stripe.js';

const router = Router();

router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-booking-checkout', createBookingAndCheckout);
// Use express.raw() for webhook to get raw body for signature verification
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhook);

export default router;
