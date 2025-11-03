var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import Stripe from 'stripe';
import { pool } from './db.js';
var stripeSecret = process.env.STRIPE_SECRET || '';
var stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' });
// Create a PaymentIntent for a booking
export function createPaymentIntent(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, amount, _b, currency, bookingData, amountMinor, paymentIntent, err_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    _a = req.body, amount = _a.amount, _b = _a.currency, currency = _b === void 0 ? 'KES' : _b, bookingData = _a.bookingData;
                    if (!amount || !bookingData)
                        return [2 /*return*/, res.status(400).json({ error: 'amount and bookingData required' })];
                    amountMinor = Math.round(Number(amount) * 100);
                    return [4 /*yield*/, stripe.paymentIntents.create({
                            amount: amountMinor,
                            currency: currency.toLowerCase(),
                            // optionally include metadata to connect to bookings
                            metadata: {
                                propertyId: String(bookingData.propertyId || ''),
                                guestEmail: bookingData.email || bookingData.guestEmail || '',
                                note: "Booking for ".concat(((_c = bookingData.property) === null || _c === void 0 ? void 0 : _c.name) || ''),
                            }
                        })];
                case 1:
                    paymentIntent = _d.sent();
                    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _d.sent();
                    console.error('createPaymentIntent error', err_1);
                    res.status(500).json({ error: 'Failed to create payment intent' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Create a Stripe Checkout session for a booking (recommended flow)
export function createCheckoutSession(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, amount, _b, currency, bookingData, amountMinor, frontend, session, err_2;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    _a = req.body, amount = _a.amount, _b = _a.currency, currency = _b === void 0 ? 'KES' : _b, bookingData = _a.bookingData;
                    console.log('bookingData:', bookingData);
                    if (!amount || !bookingData)
                        return [2 /*return*/, res.status(400).json({ error: 'amount and bookingData required' })];
                    amountMinor = Math.round(Number(amount) * 100);
                    frontend = process.env.FRONTEND_URL || 'http://localhost:5000';
                    return [4 /*yield*/, stripe.checkout.sessions.create({
                            mode: 'payment',
                            payment_method_types: ['card'],
                            line_items: [
                                {
                                    price_data: {
                                        currency: currency.toLowerCase(),
                                        product_data: {
                                            name: "Booking for ".concat(((_c = bookingData.property) === null || _c === void 0 ? void 0 : _c.name) || 'property'),
                                        },
                                        unit_amount: amountMinor,
                                    },
                                    quantity: 1,
                                },
                            ],
                            success_url: "".concat(frontend.replace(/\/$/, ''), "/payment-success?session_id={CHECKOUT_SESSION_ID}"),
                            cancel_url: "".concat(frontend.replace(/\/$/, ''), "/payment-cancel"),
                            metadata: {
                                propertyId: String(((_d = bookingData.property) === null || _d === void 0 ? void 0 : _d.id) || bookingData.propertyId || ''),
                                guestEmail: bookingData.email || bookingData.guestEmail || '',
                            },
                        })];
                case 1:
                    session = _e.sent();
                    res.json({ url: session.url, id: session.id });
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _e.sent();
                    console.error('createCheckoutSession error', err_2);
                    res.status(500).json({ error: 'Failed to create checkout session' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Create a pending booking in DB and return a Checkout session URL (atomic checkout flow)
export function createBookingAndCheckout(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, amount, _b, currency, bookingData, client, bookingRecord, guestName, checkInRaw, checkOutRaw, checkInDate, checkOutDate, checkIn, checkOut, totalAmount, propertyId, propRes, availabilityCheck, guestCount, adults, children, insertRes, e_1, amountMinor, frontend, session, err_3;
        var _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 13, , 14]);
                    _a = req.body, amount = _a.amount, _b = _a.currency, currency = _b === void 0 ? 'KES' : _b, bookingData = _a.bookingData;
                    if (!amount || !bookingData)
                        return [2 /*return*/, res.status(400).json({ error: 'amount and bookingData required' })];
                    return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _g.sent();
                    bookingRecord = null;
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 8, 10, 11]);
                    return [4 /*yield*/, client.query('BEGIN')];
                case 3:
                    _g.sent();
                    guestName = "".concat(bookingData.firstName || bookingData.guestName || '', " ").concat(bookingData.lastName || '').trim();
                    checkInRaw = bookingData.checkIn;
                    checkOutRaw = bookingData.checkOut;
                    checkInDate = new Date(checkInRaw);
                    checkOutDate = new Date(checkOutRaw);
                    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                        throw new Error('Invalid check-in / check-out dates');
                    }
                    checkIn = new Date(Date.UTC(checkInDate.getUTCFullYear(), checkInDate.getUTCMonth(), checkInDate.getUTCDate())).toISOString().slice(0, 10);
                    checkOut = new Date(Date.UTC(checkOutDate.getUTCFullYear(), checkOutDate.getUTCMonth(), checkOutDate.getUTCDate())).toISOString().slice(0, 10);
                    totalAmount = ((_c = bookingData.pricing) === null || _c === void 0 ? void 0 : _c.total) || amount;
                    propertyId = Number(((_d = bookingData.property) === null || _d === void 0 ? void 0 : _d.id) || bookingData.propertyId);
                    if (!propertyId || isNaN(propertyId)) {
                        throw Object.assign(new Error('Invalid propertyId: propertyId is required'), { name: 'ValidationError' });
                    }
                    return [4 /*yield*/, client.query('SELECT id FROM properties WHERE id = $1 AND is_active = true', [propertyId])];
                case 4:
                    propRes = _g.sent();
                    console.log('Property lookup result:', { propertyId: propertyId, rowCount: propRes.rowCount, rows: propRes.rows });
                    if (!propRes || propRes.rowCount === 0) {
                        throw Object.assign(new Error("Invalid propertyId: Property with id ".concat(propertyId, " not found")), { name: 'ValidationError' });
                    }
                    return [4 /*yield*/, client.query("SELECT id FROM blocked_dates \n         WHERE property_id = $1 \n         AND is_active = true \n         AND (\n           (start_date <= $2 AND end_date > $2) OR\n           (start_date < $3 AND end_date >= $3) OR\n           (start_date >= $2 AND end_date <= $3)\n         )\n         LIMIT 1", [propertyId, checkIn, checkOut])];
                case 5:
                    availabilityCheck = _g.sent();
                    if (availabilityCheck.rowCount && availabilityCheck.rowCount > 0) {
                        throw Object.assign(new Error('Selected dates are no longer available. Please choose different dates.'), { name: 'ValidationError' });
                    }
                    guestCount = bookingData.guests || (bookingData.adults ? Number(bookingData.adults) + Number(bookingData.children || 0) : 1);
                    adults = bookingData.adults != null ? Number(bookingData.adults) : Math.max(1, Number(bookingData.guests || 1));
                    children = bookingData.children != null ? Number(bookingData.children) : Math.max(0, Number(bookingData.guests || 1) - adults);
                    return [4 /*yield*/, client.query("INSERT INTO bookings\n         (property_id, guest_name, guest_email, guest_phone, check_in, check_out, total_amount, currency, payment_method, payment_status, status, guest_count, adults, children, created_at)\n         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW()) RETURNING *", [propertyId, guestName, bookingData.email || bookingData.guestEmail, bookingData.phone || bookingData.guestPhone || '', checkIn, checkOut, totalAmount, ((_e = bookingData.pricing) === null || _e === void 0 ? void 0 : _e.currency) || 'KES', 'stripe', 'pending', 'pending', guestCount, adults, children])];
                case 6:
                    insertRes = _g.sent();
                    bookingRecord = insertRes.rows[0];
                    return [4 /*yield*/, client.query('COMMIT')];
                case 7:
                    _g.sent();
                    return [3 /*break*/, 11];
                case 8:
                    e_1 = _g.sent();
                    return [4 /*yield*/, client.query('ROLLBACK')];
                case 9:
                    _g.sent();
                    throw e_1;
                case 10:
                    client.release();
                    return [7 /*endfinally*/];
                case 11:
                    amountMinor = Math.round(Number(amount) * 100);
                    frontend = process.env.FRONTEND_URL || 'http://localhost:5000';
                    return [4 /*yield*/, stripe.checkout.sessions.create({
                            mode: 'payment',
                            payment_method_types: ['card'],
                            line_items: [
                                {
                                    price_data: {
                                        currency: currency.toLowerCase(),
                                        product_data: { name: "Booking for ".concat(((_f = bookingData.property) === null || _f === void 0 ? void 0 : _f.name) || 'property') },
                                        unit_amount: amountMinor,
                                    },
                                    quantity: 1,
                                },
                            ],
                            success_url: "".concat(frontend.replace(/\/$/, ''), "/payment-success?session_id={CHECKOUT_SESSION_ID}"),
                            cancel_url: "".concat(frontend.replace(/\/$/, ''), "/payment-cancel"),
                            metadata: {
                                bookingId: String(bookingRecord.id),
                            },
                        })];
                case 12:
                    session = _g.sent();
                    res.json({ url: session.url, id: session.id, bookingId: bookingRecord.id });
                    return [3 /*break*/, 14];
                case 13:
                    err_3 = _g.sent();
                    console.error('createBookingAndCheckout error', err_3);
                    if (err_3 && err_3.name === 'ValidationError') {
                        return [2 /*return*/, res.status(400).json({ error: err_3.message || 'Validation error' })];
                    }
                    res.status(500).json({ error: 'Failed to create booking and checkout session' });
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
// Stripe webhook to handle events (payment_intent.succeeded etc.)
export function stripeWebhook(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var sig, webhookSecret, event, rawBody, _a, paymentIntent, client, confirmedBooking_1, updateRes, meta, rows, e_2, e_3, e_4, session, pi, client, confirmedBooking_2, bookingId, updateRes, blockedResult, updateRes, blockedResult, e_5, e_6, e_7;
        var _this = this;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('🔔 Webhook received at /api/stripe/webhook');
                    console.log('📋 Request body type:', typeof req.body);
                    console.log('📋 Request body:', ((_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.toString) === null || _c === void 0 ? void 0 : _c.call(_b).substring(0, 200)) || req.body);
                    sig = req.headers['stripe-signature'];
                    webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
                    if (!webhookSecret) {
                        console.error('❌ Webhook secret not configured');
                        return [2 /*return*/, res.status(400).send('Webhook secret not configured')];
                    }
                    try {
                        rawBody = req.body;
                        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
                        console.log('✅ Webhook signature verified. Event type:', event.type);
                    }
                    catch (err) {
                        console.error('❌ Webhook signature verification failed', err);
                        return [2 /*return*/, res.status(400).send("Webhook Error: ".concat(err.message))];
                    }
                    // Handle the event types we care about
                    console.log('📥 Processing webhook event:', event.type);
                    _a = event.type;
                    switch (_a) {
                        case 'payment_intent.succeeded': return [3 /*break*/, 1];
                        case 'payment_intent.payment_failed': return [3 /*break*/, 22];
                        case 'checkout.session.completed': return [3 /*break*/, 23];
                    }
                    return [3 /*break*/, 46];
                case 1:
                    paymentIntent = event.data.object;
                    console.log('✅ PaymentIntent succeeded:', paymentIntent.id);
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 20, , 21]);
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 18, , 19]);
                    return [4 /*yield*/, pool.connect()];
                case 4:
                    client = _d.sent();
                    confirmedBooking_1 = null;
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 14, 16, 17]);
                    return [4 /*yield*/, client.query('BEGIN')];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, client.query("UPDATE bookings SET payment_status = 'completed', payment_intent_id = $1, status = 'confirmed' WHERE payment_intent_id = $1 AND payment_status != 'completed' RETURNING *", [paymentIntent.id])];
                case 7:
                    updateRes = _d.sent();
                    if (!(updateRes && updateRes.rowCount && updateRes.rowCount > 0)) return [3 /*break*/, 9];
                    confirmedBooking_1 = updateRes.rows[0];
                    // Idempotency: use ON CONFLICT to prevent duplicate blocked_dates from concurrent webhooks
                    return [4 /*yield*/, client.query("INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, booking_id, created_at, updated_at) VALUES ($1, $2, $3, 'direct_booking', 'direct_booking', $4, NOW(), NOW()) ON CONFLICT (booking_id) DO NOTHING", [confirmedBooking_1.property_id, confirmedBooking_1.check_in, confirmedBooking_1.check_out, confirmedBooking_1.id])];
                case 8:
                    // Idempotency: use ON CONFLICT to prevent duplicate blocked_dates from concurrent webhooks
                    _d.sent();
                    _d.label = 9;
                case 9:
                    if (!(updateRes.rowCount === 0)) return [3 /*break*/, 12];
                    meta = paymentIntent.metadata || {};
                    if (!(meta.propertyId && meta.guestEmail)) return [3 /*break*/, 12];
                    return [4 /*yield*/, client.query("UPDATE bookings SET payment_status = 'completed', payment_intent_id = $1, status = 'confirmed' WHERE property_id = $2 AND guest_email = $3 AND payment_status != 'completed' RETURNING *", [paymentIntent.id, meta.propertyId, meta.guestEmail])];
                case 10:
                    rows = _d.sent();
                    if (!(rows && rows.rowCount && rows.rowCount > 0)) return [3 /*break*/, 12];
                    confirmedBooking_1 = rows.rows[0];
                    // Idempotency: use ON CONFLICT to prevent duplicate blocked_dates from concurrent webhooks
                    return [4 /*yield*/, client.query("INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, booking_id, created_at, updated_at) VALUES ($1, $2, $3, 'direct_booking', 'direct_booking', $4, NOW(), NOW()) ON CONFLICT (booking_id) DO NOTHING", [confirmedBooking_1.property_id, confirmedBooking_1.check_in, confirmedBooking_1.check_out, confirmedBooking_1.id])];
                case 11:
                    // Idempotency: use ON CONFLICT to prevent duplicate blocked_dates from concurrent webhooks
                    _d.sent();
                    console.log('Marked booking paid via metadata match');
                    _d.label = 12;
                case 12: return [4 /*yield*/, client.query('COMMIT')];
                case 13:
                    _d.sent();
                    // Trigger iCal sync for connected calendars after successful booking (fire-and-forget)
                    if (confirmedBooking_1) {
                        // Non-blocking: trigger sync in background without awaiting
                        setImmediate(function () { return __awaiter(_this, void 0, void 0, function () {
                            var syncAllFeeds, err_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, import('./calendarSync.js')];
                                    case 1:
                                        syncAllFeeds = (_a.sent()).syncAllFeeds;
                                        return [4 /*yield*/, syncAllFeeds()];
                                    case 2:
                                        _a.sent();
                                        console.log('iCal sync completed after booking confirmation for booking ID:', confirmedBooking_1.id);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_4 = _a.sent();
                                        console.error('iCal sync failed for booking ID:', confirmedBooking_1.id, err_4);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); });
                    }
                    return [3 /*break*/, 17];
                case 14:
                    e_2 = _d.sent();
                    return [4 /*yield*/, client.query('ROLLBACK')];
                case 15:
                    _d.sent();
                    throw e_2;
                case 16:
                    client.release();
                    return [7 /*endfinally*/];
                case 17: return [3 /*break*/, 19];
                case 18:
                    e_3 = _d.sent();
                    console.error('Failed to connect to database:', e_3);
                    return [3 /*break*/, 19];
                case 19: return [3 /*break*/, 21];
                case 20:
                    e_4 = _d.sent();
                    console.error('Failed to finalize booking for paymentIntent:', e_4);
                    return [3 /*break*/, 21];
                case 21: return [3 /*break*/, 47];
                case 22:
                    console.log('Payment failed:', event.data.object.id);
                    return [3 /*break*/, 47];
                case 23:
                    _d.trys.push([23, 44, , 45]);
                    session = event.data.object;
                    console.log('✅ Checkout session completed:', session.id);
                    console.log('📋 Session metadata:', session.metadata);
                    pi = session.payment_intent;
                    _d.label = 24;
                case 24:
                    _d.trys.push([24, 42, , 43]);
                    return [4 /*yield*/, pool.connect()];
                case 25:
                    client = _d.sent();
                    _d.label = 26;
                case 26:
                    _d.trys.push([26, 38, 40, 41]);
                    return [4 /*yield*/, client.query('BEGIN')];
                case 27:
                    _d.sent();
                    confirmedBooking_2 = null;
                    if (!(session.metadata && session.metadata.bookingId)) return [3 /*break*/, 32];
                    bookingId = Number(session.metadata.bookingId);
                    console.log('🔍 Looking for booking with ID:', bookingId);
                    return [4 /*yield*/, client.query("UPDATE bookings SET payment_status = 'completed', payment_intent_id = $1, status = 'confirmed' WHERE id = $2 AND payment_status != 'completed' RETURNING *", [pi || null, bookingId])];
                case 28:
                    updateRes = _d.sent();
                    if (!(updateRes && updateRes.rowCount && updateRes.rowCount > 0)) return [3 /*break*/, 30];
                    confirmedBooking_2 = updateRes.rows[0];
                    console.log('✅ Booking confirmed:', confirmedBooking_2.id);
                    return [4 /*yield*/, client.query("INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, booking_id, created_at, updated_at) VALUES ($1, $2, $3, 'direct_booking', 'direct_booking', $4, NOW(), NOW()) ON CONFLICT (booking_id) DO NOTHING RETURNING *", [confirmedBooking_2.property_id, confirmedBooking_2.check_in, confirmedBooking_2.check_out, confirmedBooking_2.id])];
                case 29:
                    blockedResult = _d.sent();
                    if (blockedResult.rows.length > 0) {
                        console.log('✅ Blocked dates created for booking:', confirmedBooking_2.id);
                    }
                    else {
                        console.log('⚠️  Blocked dates already exist for booking:', confirmedBooking_2.id);
                    }
                    return [3 /*break*/, 31];
                case 30:
                    console.log('⚠️  No booking found to update with bookingId:', bookingId);
                    _d.label = 31;
                case 31: return [3 /*break*/, 36];
                case 32:
                    if (!pi) return [3 /*break*/, 36];
                    // Fallback to matching by payment_intent_id
                    console.log('🔍 Looking for booking with payment_intent_id:', pi);
                    return [4 /*yield*/, client.query("UPDATE bookings SET payment_status = 'completed', payment_intent_id = $1, status = 'confirmed' WHERE payment_intent_id = $1 AND payment_status != 'completed' RETURNING *", [pi])];
                case 33:
                    updateRes = _d.sent();
                    if (!(updateRes && updateRes.rowCount && updateRes.rowCount > 0)) return [3 /*break*/, 35];
                    confirmedBooking_2 = updateRes.rows[0];
                    console.log('✅ Booking confirmed via payment_intent:', confirmedBooking_2.id);
                    return [4 /*yield*/, client.query("INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, booking_id, created_at, updated_at) VALUES ($1, $2, $3, 'direct_booking', 'direct_booking', $4, NOW(), NOW()) ON CONFLICT (booking_id) DO NOTHING RETURNING *", [confirmedBooking_2.property_id, confirmedBooking_2.check_in, confirmedBooking_2.check_out, confirmedBooking_2.id])];
                case 34:
                    blockedResult = _d.sent();
                    if (blockedResult.rows.length > 0) {
                        console.log('✅ Blocked dates created for booking:', confirmedBooking_2.id);
                    }
                    else {
                        console.log('⚠️  Blocked dates already exist for booking:', confirmedBooking_2.id);
                    }
                    return [3 /*break*/, 36];
                case 35:
                    console.log('⚠️  No booking found with payment_intent_id:', pi);
                    _d.label = 36;
                case 36: return [4 /*yield*/, client.query('COMMIT')];
                case 37:
                    _d.sent();
                    // Trigger iCal sync for connected calendars after successful booking (fire-and-forget)
                    if (confirmedBooking_2) {
                        // Non-blocking: trigger sync in background without awaiting
                        setImmediate(function () { return __awaiter(_this, void 0, void 0, function () {
                            var syncAllFeeds, err_5;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, import('./calendarSync.js')];
                                    case 1:
                                        syncAllFeeds = (_a.sent()).syncAllFeeds;
                                        return [4 /*yield*/, syncAllFeeds()];
                                    case 2:
                                        _a.sent();
                                        console.log('iCal sync completed after booking confirmation for booking ID:', confirmedBooking_2.id);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_5 = _a.sent();
                                        console.error('iCal sync failed for booking ID:', confirmedBooking_2.id, err_5);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); });
                    }
                    return [3 /*break*/, 41];
                case 38:
                    e_5 = _d.sent();
                    return [4 /*yield*/, client.query('ROLLBACK')];
                case 39:
                    _d.sent();
                    throw e_5;
                case 40:
                    client.release();
                    return [7 /*endfinally*/];
                case 41: return [3 /*break*/, 43];
                case 42:
                    e_6 = _d.sent();
                    console.error('Failed to connect to database:', e_6);
                    return [3 /*break*/, 43];
                case 43: return [3 /*break*/, 45];
                case 44:
                    e_7 = _d.sent();
                    console.error('Failed to finalize booking for checkout session:', e_7);
                    return [3 /*break*/, 45];
                case 45: return [3 /*break*/, 47];
                case 46:
                    console.log("Unhandled event type ".concat(event.type));
                    _d.label = 47;
                case 47:
                    res.json({ received: true });
                    return [2 /*return*/];
            }
        });
    });
}
