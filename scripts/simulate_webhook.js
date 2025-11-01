(async () => {
  try {
    const fetch = globalThis.fetch;
    if (!fetch) throw new Error('global fetch is not available');
    const crypto = await import('crypto');
    const DB = await import('@neondatabase/serverless');

    const API = 'http://localhost:5000/api/stripe/create-booking-checkout';
    const WEBHOOK = 'http://localhost:5000/api/stripe/webhook';

    // Test booking payload - adjust dates if needed
    const bookingPayload = {
      amount: 1000,
      currency: 'KES',
      bookingData: {
        propertyId: 239,
        firstName: 'CLI Test',
        lastName: 'User',
        email: 'cli-test@example.com',
        phone: '+254700000001',
        checkIn: '2025-10-20',
        checkOut: '2025-10-22',
        adults: 2,
        children: 0,
        pricing: { total: 1000, currency: 'KES' }
      }
    };

    console.log('-> Creating pending booking via API...');
    const createRes = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(bookingPayload) });
    const createText = await createRes.text();
    let createJson;
    try { createJson = JSON.parse(createText); } catch(e) { throw new Error('Create booking did not return JSON: ' + createText); }
    if (!createRes.ok) throw new Error('Create booking failed: ' + JSON.stringify(createJson));

    console.log('-> create booking response:', createJson);
    const sessionId = createJson.id;
    const bookingId = createJson.bookingId;
    if (!sessionId || !bookingId) throw new Error('Missing session id or booking id in response');

    // Prepare a fake checkout.session.completed event payload with metadata.bookingId
    const event = {
      id: 'evt_test_' + Date.now(),
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          object: 'checkout.session',
          payment_intent: 'pi_test_' + Date.now(),
          metadata: { bookingId: String(bookingId) }
        }
      }
    };
    const payload = JSON.stringify(event);

    // Use webhook secret from env (should match the server's STRIPE_WEBHOOK_SECRET)
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
    const t = Math.floor(Date.now() / 1000);
    const signed = `${t}.${payload}`;
    const sig = crypto.createHmac('sha256', secret).update(signed).digest('hex');
    const sigHeader = `t=${t},v1=${sig}`;

    console.log('-> Sending signed webhook to server...');
    const whRes = await fetch(WEBHOOK, { method: 'POST', headers: { 'content-type': 'application/json', 'stripe-signature': sigHeader }, body: payload });
    const whText = await whRes.text();
    console.log('-> webhook response status', whRes.status, 'body:', whText);

    // Now query server API to verify booking finalization and blocked_dates (no DB access required)
    console.log('-> Querying server API for booking and blocked_dates...');
    const bookingRes = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
    const bookingJson = await bookingRes.json();
    console.log('-> booking (from API):', bookingJson);
    const blockedRes = await fetch(`http://localhost:5000/api/properties/${bookingJson.property_id}/blocked-dates`);
    const blockedJson = await blockedRes.json();
    console.log('-> blocked-dates (from API):', blockedJson);

    console.log('Done.');
  } catch (e) {
    console.error('simulate_webhook error', e);
    process.exit(1);
  }
})();
