import type { Request, Response } from 'express';
const { pool } = require('./db');
const StripeLib = require('stripe');
// @ts-ignore - Stripe type from stripe package
type Stripe = import('stripe').default;

// Initialize Stripe client (ESM pattern)
// Using singleton pattern to avoid recreating the client on every request
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }
  
  const stripeSecret = process.env.STRIPE_SECRET || '';
  if (!stripeSecret) {
    throw new Error('STRIPE_SECRET environment variable is required');
  }
  
  // Support different shapes depending on CJS/ESM interop in runtime
  const StripeCtor: any = (StripeLib && (StripeLib.default || StripeLib.Stripe)) || StripeLib;
  stripeInstance = new StripeCtor(stripeSecret, {
    apiVersion: '2022-11-15',
  });
  return stripeInstance;
}

// Create a PaymentIntent for a booking
async function createPaymentIntent(req: any, res: any) {
  try {
    const { amount, currency = 'KES', bookingData } = req.body;
    if (!amount || !bookingData) return res.status(400).json({ error: 'amount and bookingData required' });

    // Stripe expects amounts in the smallest currency unit (cents)
    // For KES assume 100 cents per KES (if KES uses two decimal places); adjust if needed.
    const amountMinor = Math.round(Number(amount) * 100);

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountMinor,
      currency: currency.toLowerCase(),
      // optionally include metadata to connect to bookings
      metadata: {
        propertyId: String(bookingData.propertyId || ''),
        guestEmail: bookingData.email || bookingData.guestEmail || '',
        note: `Booking for ${bookingData.property?.name || ''}`,
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (err: any) {
    console.error('createPaymentIntent error', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}

// Create a Stripe Checkout session for a booking (recommended flow)
async function createCheckoutSession(req: any, res: any) {
  try {
    const { amount, currency = 'KES', bookingData } = req.body;
    console.log('bookingData:', bookingData);
    if (!amount || !bookingData) return res.status(400).json({ error: 'amount and bookingData required' });

    const amountMinor = Math.round(Number(amount) * 100);

    const frontend = process.env.FRONTEND_URL || 'http://localhost:5000';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Booking for ${bookingData.property?.name || 'property'}`,
            },
            unit_amount: amountMinor,
          },
          quantity: 1,
        },
      ],
      success_url: `${frontend.replace(/\/$/, '')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend.replace(/\/$/, '')}/payment-cancel`,
      metadata: {
        propertyId: String(bookingData.property?.id || bookingData.propertyId || ''),
        guestEmail: bookingData.email || bookingData.guestEmail || '',
      },
    });

    res.json({ url: session.url, id: session.id });
  } catch (err: any) {
    console.error('createCheckoutSession error', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

// Create a pending booking in DB and return a Checkout session URL (atomic checkout flow)
async function createBookingAndCheckout(req: any, res: any) {
  try {
    const { amount, currency = 'KES', bookingData } = req.body;
    if (!amount || !bookingData) return res.status(400).json({ error: 'amount and bookingData required' });

  // Insert a pending booking record
  const client = await pool.connect();
    let bookingRecord: any = null;
    try {
      await client.query('BEGIN');
      const guestName = `${bookingData.firstName || bookingData.guestName || ''} ${bookingData.lastName || ''}`.trim();
      const checkInRaw = bookingData.checkIn;
      const checkOutRaw = bookingData.checkOut;
      // normalize to UTC date-only strings (YYYY-MM-DD) to match storage behavior
      const checkInDate = new Date(checkInRaw);
      const checkOutDate = new Date(checkOutRaw);
      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        throw new Error('Invalid check-in / check-out dates');
      }
      const checkIn = new Date(Date.UTC(checkInDate.getUTCFullYear(), checkInDate.getUTCMonth(), checkInDate.getUTCDate())).toISOString().slice(0, 10);
      const checkOut = new Date(Date.UTC(checkOutDate.getUTCFullYear(), checkOutDate.getUTCMonth(), checkOutDate.getUTCDate())).toISOString().slice(0, 10);
      const totalAmount = bookingData.pricing?.total || amount;

      // Ensure property exists to avoid foreign key errors
      const propertyId = Number(bookingData.property?.id || bookingData.propertyId);
      if (!propertyId || isNaN(propertyId)) {
        throw Object.assign(new Error('Invalid propertyId: propertyId is required'), { name: 'ValidationError' });
      }
      const propRes = await client.query('SELECT id FROM properties WHERE id = $1 AND is_active = true', [propertyId]);
      console.log('Property lookup result:', { propertyId, rowCount: propRes.rowCount, rows: propRes.rows });
      if (!propRes || propRes.rowCount === 0) {
        throw Object.assign(new Error(`Invalid propertyId: Property with id ${propertyId} not found`), { name: 'ValidationError' });
      }

      // Check if dates are available (no overlapping blocked dates)
      const availabilityCheck = await client.query(
        `SELECT id FROM blocked_dates 
         WHERE property_id = $1 
         AND is_active = true 
         AND (
           (start_date <= $2 AND end_date > $2) OR
           (start_date < $3 AND end_date >= $3) OR
           (start_date >= $2 AND end_date <= $3)
         )
         LIMIT 1`,
        [propertyId, checkIn, checkOut]
      );
      
      if (availabilityCheck.rowCount && availabilityCheck.rowCount > 0) {
        throw Object.assign(new Error('Selected dates are no longer available. Please choose different dates.'), { name: 'ValidationError' });
      }

      const guestCount = bookingData.guests || (bookingData.adults ? Number(bookingData.adults) + Number(bookingData.children || 0) : 1);
      const adults = bookingData.adults != null ? Number(bookingData.adults) : Math.max(1, Number(bookingData.guests || 1));
      const children = bookingData.children != null ? Number(bookingData.children) : Math.max(0, Number(bookingData.guests || 1) - adults);

      const insertRes = await client.query(
        `INSERT INTO bookings
         (property_id, guest_name, guest_email, guest_phone, check_in, check_out, total_amount, currency, payment_method, payment_status, status, guest_count, adults, children, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW()) RETURNING *`,
        [propertyId, guestName, bookingData.email || bookingData.guestEmail, bookingData.phone || bookingData.guestPhone || '', checkIn, checkOut, totalAmount, bookingData.pricing?.currency || 'KES', 'stripe', 'pending', 'pending', guestCount, adults, children]
      );
      bookingRecord = insertRes.rows[0];
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    // Create Checkout session with bookingId metadata
    const amountMinor = Math.round(Number(amount) * 100);
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5000';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: `Booking for ${bookingData.property?.name || 'property'}` },
            unit_amount: amountMinor,
          },
          quantity: 1,
        },
      ],
      success_url: `${frontend.replace(/\/$/, '')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend.replace(/\/$/, '')}/payment-cancel`,
      metadata: {
        bookingId: String(bookingRecord.id),
      },
    });

    res.json({ url: session.url, id: session.id, bookingId: bookingRecord.id });
  } catch (err: any) {
    console.error('createBookingAndCheckout error', err);
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message || 'Validation error' });
    }
    res.status(500).json({ error: 'Failed to create booking and checkout session' });
  }
}

// Stripe webhook to handle events (payment_intent.succeeded etc.)
async function stripeWebhook(req: any, res: any) {
        console.log('🔔 Webhook received at /api/stripe/webhook');
        console.log('📋 Request body type:', typeof req.body);
        console.log('📋 Request body:', req.body?.toString?.().substring(0, 200) || req.body);
  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ Webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;
  try {
    // The raw middleware from express.raw() provides req.body as a Buffer
    // constructEvent requires the exact signed payload as a Buffer or string
    const rawBody = req.body;
    event = getStripe().webhooks.constructEvent(rawBody, sig!, webhookSecret);
    console.log('✅ Webhook signature verified. Event type:', event.type);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event types we care about
  console.log('📥 Processing webhook event:', event.type);
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as any;
      console.log('✅ PaymentIntent succeeded:', paymentIntent.id);
      try {
        // Try to mark any booking that contains this payment intent id
        try {
          const client = await pool.connect();
          let confirmedBooking: any = null;
          try {
            await client.query('BEGIN');
            // Update booking by payment_intent id
            const updateRes = await client.query("UPDATE bookings SET payment_status = 'completed', payment_intent_id = $1, status = 'confirmed' WHERE payment_intent_id = $1 AND payment_status != 'completed' RETURNING *", [paymentIntent.id]);                  if (updateRes && updateRes.rowCount && updateRes.rowCount > 0) {
              confirmedBooking = updateRes.rows[0];
              // Idempotency: use ON CONFLICT to prevent duplicate blocked_dates from concurrent webhooks
              await client.query("INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, booking_id, created_at, updated_at) VALUES ($1, $2, $3, 'direct_booking', 'direct_booking', $4, NOW(), NOW()) ON CONFLICT (booking_id) DO NOTHING", [confirmedBooking.property_id, confirmedBooking.check_in, confirmedBooking.check_out, confirmedBooking.id]);
            }
            if (updateRes.rowCount === 0) {
              // Try to find booking by metadata (if metadata was stored on payment intent)
              const meta = paymentIntent.metadata || {};
              if (meta.propertyId && meta.guestEmail) {
                const rows = await client.query("UPDATE bookings SET payment_status = 'completed', payment_intent_id = $1, status = 'confirmed' WHERE property_id = $2 AND guest_email = $3 AND payment_status != 'completed' RETURNING *", [paymentIntent.id, meta.propertyId, meta.guestEmail]);
                if (rows && rows.rowCount && rows.rowCount > 0) {
                  confirmedBooking = rows.rows[0];
                  // Idempotency: use ON CONFLICT to prevent duplicate blocked_dates from concurrent webhooks
                  await client.query("INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, booking_id, created_at, updated_at) VALUES ($1, $2, $3, 'direct_booking', 'direct_booking', $4, NOW(), NOW()) ON CONFLICT (booking_id) DO NOTHING", [confirmedBooking.property_id, confirmedBooking.check_in, confirmedBooking.check_out, confirmedBooking.id]);
                  console.log('Marked booking paid via metadata match');
                }
              }
            }
            await client.query('COMMIT');
            
            // Trigger iCal sync for connected calendars after successful booking (fire-and-forget)
            if (confirmedBooking) {
              // Non-blocking: trigger sync in background without awaiting
              setImmediate(async () => {
                try {
                  const { syncAllFeeds } = require('./calendarSync');
                  await syncAllFeeds();
                  console.log('iCal sync completed after booking confirmation for booking ID:', confirmedBooking.id);
                } catch (err) {
                  console.error('iCal sync failed for booking ID:', confirmedBooking.id, err);
                }
              });
            }
          } catch (e) {
            await client.query('ROLLBACK');
            throw e;
          } finally {
            client.release();
          }
        } catch (e) {
          console.error('Failed to connect to database:', e);
        }
      } catch (e) {
        console.error('Failed to finalize booking for paymentIntent:', e);
      }
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', (event.data.object as any).id);
      break;
    case 'checkout.session.completed':
      try {
        const session = event.data.object as any;
        console.log('✅ Checkout session completed:', session.id);
        console.log('📋 Session metadata:', session.metadata);
        const pi = session.payment_intent as string | undefined;
        try {
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            let confirmedBooking: any = null;
            if (session.metadata && session.metadata.bookingId) {
              // Prefer direct bookingId match from session metadata
              const bookingId = Number(session.metadata.bookingId);
              console.log('🔍 Looking for booking with ID:', bookingId);
                  const updateRes = await client.query(
                    "UPDATE bookings SET payment_status = 'completed', payment_intent_id = $1, status = 'confirmed' WHERE id = $2 AND payment_status != 'completed' RETURNING *",
                    [pi || null, bookingId]
                  );
                  if (updateRes && updateRes.rowCount && updateRes.rowCount > 0) {
                    confirmedBooking = updateRes.rows[0];
                    console.log('✅ Booking confirmed:', confirmedBooking.id);
                    // Idempotency: use ON CONFLICT to prevent duplicate blocked_dates from concurrent webhooks
                    const blockedResult = await client.query(
                      "INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, booking_id, created_at, updated_at) VALUES ($1, $2, $3, 'direct_booking', 'direct_booking', $4, NOW(), NOW()) ON CONFLICT (booking_id) DO NOTHING RETURNING *",
                      [confirmedBooking.property_id, confirmedBooking.check_in, confirmedBooking.check_out, confirmedBooking.id]
                    );
                    if (blockedResult.rows.length > 0) {
                      console.log('✅ Blocked dates created for booking:', confirmedBooking.id);
                    } else {
                      console.log('⚠️  Blocked dates already exist for booking:', confirmedBooking.id);
                    }
                  } else {
                    console.log('⚠️  No booking found to update with bookingId:', bookingId);
                  }
            } else if (pi) {
              // Fallback to matching by payment_intent_id
              console.log('🔍 Looking for booking with payment_intent_id:', pi);
              const updateRes = await client.query("UPDATE bookings SET payment_status = 'completed', payment_intent_id = $1, status = 'confirmed' WHERE payment_intent_id = $1 AND payment_status != 'completed' RETURNING *", [pi]);
                  if (updateRes && updateRes.rowCount && updateRes.rowCount > 0) {
                    confirmedBooking = updateRes.rows[0];
                    console.log('✅ Booking confirmed via payment_intent:', confirmedBooking.id);
                    // Idempotency: use ON CONFLICT to prevent duplicate blocked_dates from concurrent webhooks
                    const blockedResult = await client.query(
                      "INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, booking_id, created_at, updated_at) VALUES ($1, $2, $3, 'direct_booking', 'direct_booking', $4, NOW(), NOW()) ON CONFLICT (booking_id) DO NOTHING RETURNING *",
                      [confirmedBooking.property_id, confirmedBooking.check_in, confirmedBooking.check_out, confirmedBooking.id]
                    );
                    if (blockedResult.rows.length > 0) {
                      console.log('✅ Blocked dates created for booking:', confirmedBooking.id);
                    } else {
                      console.log('⚠️  Blocked dates already exist for booking:', confirmedBooking.id);
                    }
                  } else {
                    console.log('⚠️  No booking found with payment_intent_id:', pi);
                  }
            }
            await client.query('COMMIT');
            
            // Trigger iCal sync for connected calendars after successful booking (fire-and-forget)
            if (confirmedBooking) {
              // Non-blocking: trigger sync in background without awaiting
              setImmediate(async () => {
                try {
                  const { syncAllFeeds } = require('./calendarSync');
                  await syncAllFeeds();
                  console.log('iCal sync completed after booking confirmation for booking ID:', confirmedBooking.id);
                } catch (err) {
                  console.error('iCal sync failed for booking ID:', confirmedBooking.id, err);
                }
              });
            }
          } catch (e) {
            await client.query('ROLLBACK');
            throw e;
          } finally {
            client.release();
          }
        } catch (e) {
          console.error('Failed to connect to database:', e);
        }
      } catch (e) {
        console.error('Failed to finalize booking for checkout session:', e);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

module.exports = { createPaymentIntent, createCheckoutSession, createBookingAndCheckout, stripeWebhook };
