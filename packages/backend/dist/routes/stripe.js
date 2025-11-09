"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const express = require('express');
const { createCheckoutSession, createBookingAndCheckout, stripeWebhook } = require('../stripeHandler');
const router = Router();
router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-booking-checkout', createBookingAndCheckout);
// Use express.raw() for webhook to get raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
module.exports = router;
