# Quickstart

1) Configure environment
- Create a `.env` and set: `DATABASE_URL`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL=http://localhost:5000`

2) Fresh database
```
npm run db:fresh
```

3) Seed properties/images
```
npm run seed:fresh
```

4) Start dev server
```
npm run dev
```

5) Stripe webhooks (local)
```
stripe login
stripe listen --forward-to localhost:5000/api/stripe/webhook
```
- Copy the printed `whsec_...` into `.env` as `STRIPE_WEBHOOK_SECRET` and restart the server

6) Test end-to-end
- Make a booking via the UI and complete payment
- Booking becomes confirmed and dates are blocked in the calendar
