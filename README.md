
# boo-back — README

This repository contains a full-stack booking application (client + server) with payments (Stripe), calendar sync, and a small database layer. The README below explains the architecture, how the booking/payment/calendar flows work, environment variables, how to run locally, and troubleshooting steps for common issues (webhooks and DB connection timeouts).

## High-level overview

- Frontend: located in `client/` (Vite + React + TypeScript). Pages include property listings, property detail, booking flow and checkout pages.
- Server: located in `server/` (Express + TypeScript). Provides API endpoints for properties, bookings, Stripe integration and calendar sync.
- DB layer: Drizzle ORM + migrations in `migrations/` and `shared/schema.ts` describing the tables (properties, bookings, blocked_dates, calendar_sync, contact_messages).
- Payments: Stripe integration is implemented in `server/stripe.ts`. The app creates pending bookings and then finalizes them on webhook events (checkout.session.completed / payment_intent.succeeded).
- Calendar / blocked dates: `blocked_dates` table stores disabled dates for properties (manual, external calendar feeds, or created after a successful booking). `server/calendarSync.ts` handles fetching iCal feeds and inserting/updating `blocked_dates`.

## Important files

- `client/` — frontend app (Vite + React). Key files:
	- `client/src/pages/BookingPage.tsx` — reads `/api/properties/:id/blocked-dates` to disable dates in the UI.
	- `client/src/components/BookingForm.tsx` — booking UI that calls the server to create bookings / start checkout.
- `server/` — Express server code
	- `server/index.ts` — app bootstrap and route registration.
	- `server/stripe.ts` — Stripe handlers: create checkout, create booking+checkout, and `stripeWebhook` which finalizes bookings and inserts `blocked_dates` on successful payments.
	- `server/calendarSync.ts` — registers external calendar feeds, syncs feeds and exposes `getBlockedDates` endpoint.
- `shared/schema.ts` — Drizzle ORM schema describing tables and types.
- `migrations/` — SQL migration files. Add new migrations here.
- `scripts/simulate_webhook.js` — local helper to create a pending booking and POST a signed fake `checkout.session.completed` webhook to the server for testing.

## How the booking + blocked dates flow works (simplified)

1. The frontend starts a booking by calling `/api/stripe/create-booking-checkout` (or `/api/bookings` for direct non-checkout flows). The server creates a pending booking row in `bookings` with `payment_status = 'pending'` and returns a Stripe Checkout session URL and the booking id.
2. The user completes payment in Stripe. Stripe sends a webhook to `/api/stripe/webhook` with `checkout.session.completed` (or `payment_intent.succeeded`).
3. `server/stripe.ts` verifies the webhook signature, finds the booking (either by session metadata.bookingId or by payment_intent), marks `bookings.payment_status = 'completed'` and `status = 'confirmed'`, and inserts a corresponding `blocked_dates` row for that booking (reason = 'direct_booking', source = 'direct_booking', and booking_id set).
4. The frontend requests `/api/properties/:id/blocked-dates` (server handler in `server/calendarSync.ts`), which returns active blocked dates. The calendar disables those dates.

If step (3) fails (for example webhook not delivered, signature mismatch, or DB write failed), the booking remains `pending` and `blocked_dates` are not created — the calendar will therefore still show those dates as available.

## Environment variables

Create a `.env` file in the project root for local development. Important variables:

- `DB_URL` — Postgres connection string (required). Example: `postgres://user:pass@host:5432/dbname`.
- `STRIPE_SECRET` — Stripe API secret key (sk_...); used for creating sessions and payment intents.
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (whsec_...) for verifying webhook payloads.
- `FRONTEND_URL` — URL of the frontend used to set success/cancel URLs for Checkout. Defaults to `http://localhost:3000` when not set.

Note: `drizzle.config.ts` requires `DB_URL` to be present when running migrations.

## Running locally (development)

1. Install dependencies (from repo root):

```powershell
npm install
```

2. Apply DB migrations (Drizzle Kit):

```powershell
#$env:DB_URL must be set first (PowerShell)
#$env:DB_URL = "postgres://user:pass@host:5432/dbname"
npm run db:push
```

Notes about index creation: some migration files require `CREATE INDEX CONCURRENTLY` which cannot run inside a transaction. If you added such a migration, run the CONCURRENTLY index command separately using `psql -c "CREATE INDEX CONCURRENTLY ..."` as described in the migrations file.

3. Start the dev server (this runs the Express server with Vite middleware for the client):

```powershell
npm run dev
```

4. Open the app in your browser: `http://localhost:3000`.

5. Testing Stripe webhooks locally: use the Stripe CLI to forward webhooks and copy the webhook signing secret into `.env`:

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copy the printed webhook signing secret into STRIPE_WEBHOOK_SECRET
```

Or run the included simulator which posts a signed fake webhook using the value in your `.env` (defaults to `whsec_test`):

```powershell
node .\scripts\simulate_webhook.js
```

## Troubleshooting (common issues)

1. Blocked dates not appearing after successful payment
	 - Confirm the booking's `payment_status` is `completed`. If it reads `pending`, the webhook didn't update the booking.
		 ```powershell
		 psql $env:DB_URL -c "SELECT id, payment_status, status, payment_intent_id FROM bookings WHERE id = <bookingId>"
		 ```
	 - Inspect server logs for the `stripeWebhook` handler. Look for `Checkout session completed:` or `PaymentIntent succeeded:` logs and any DB error stack traces.
	 - If webhook signature verification fails, ensure `STRIPE_WEBHOOK_SECRET` matches the one printed by the Stripe CLI or from Stripe dashboard.

2. `getBlockedDates error Error: Connection terminated due to connection timeout`
	 - This indicates the DB pool is hitting connection or timeout limits (common in serverless DBs like Neon when multiple pools are created). The app centralizes a single pool in `dist/server/db.js`; ensure other modules reuse that pool instead of creating new ones.
	 - Increase `connectionTimeoutMillis` temporarily or increase `max` connections in `dist/server/db.js` if you see frequent timeouts; but prefer centralizing the pool to avoid excessive connections.

3. Drizzle warns about destructive changes during `npm run db:push`
	 - If Drizzle detects a column deletion (for example `sync_errors`) it will prompt. If data is important, either add the column back to `shared/schema.ts` (to prevent deletion) or back up the data before forcing the migration.

## Developer tips & notes

- Keep `shared/schema.ts` in sync with DB migrations. When you change the schema via Drizzle types, generate the SQL migration and apply it with `drizzle-kit`.
- Use the `scripts/simulate_webhook.js` helper to reproduce webhook flows without depending on Stripe in development.
- When adding indices to large tables, prefer `CREATE INDEX CONCURRENTLY` run outside transaction to avoid locking the table.

## Useful commands

- Run dev server: `npm run dev`
- Build: `npm run build`
- Apply DB changes with Drizzle: `npm run db:push`
- Run the webhook simulator: `node .\scripts\simulate_webhook.js`

## Where to look when things go wrong

- Server logs: Express logs printed in console include API path, status and the JSON body when applicable.
- Stripe logs: If using Stripe CLI, it shows delivered events and responses.
- Database: Use `psql` or your DB provider console to inspect `bookings` and `blocked_dates` tables directly.

---


