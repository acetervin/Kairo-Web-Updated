# Vercel Deployment Guide

Your project is now fully configured for Vercel deployment! 🎉

## ✅ What's Ready

- ✅ `vercel.json` configured
- ✅ `api/index.ts` serverless function entry point
- ✅ Database pooling optimized for serverless (pool size = 1)
- ✅ Startup query skipped in serverless to reduce cold starts
- ✅ In-memory rate limiting disabled in serverless
- ✅ Stripe webhook handling with raw body
- ✅ Frontend served statically via Vercel

## 🚀 Deployment Steps

### 1. Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Set Up Database

Use **Neon** (recommended for Vercel):

1. Go to [neon.tech](https://neon.tech)
2. Create a free PostgreSQL database
3. Copy your connection string (looks like: `postgresql://user:pass@ep-xxx.neon.tech/dbname`)

### 4. Prepare Environment Variables

Create a `.env.production` file (locally) with:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname
STRIPE_SECRET=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### 5. Deploy to Vercel

```bash
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

### 6. Configure Environment Variables in Vercel Dashboard

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add all the variables from step 4

### 7. Run Database Migrations

After first deployment, run migrations:

```bash
# Pull environment variables locally
vercel env pull .env.local

# Run migrations
npm run db:push
```

Or use Vercel's CLI:

```bash
vercel env pull
npm run db:push
```

### 8. Update Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Copy the webhook signing secret
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

## 📊 Vercel Pricing

### Free Hobby Plan
- ✅ Unlimited deployments
- ✅ 100GB bandwidth
- ✅ Serverless functions
- ✅ Automatic HTTPS
- ✅ Custom domains (1)

### Pro Plan ($20/month)
- ✅ Everything in Hobby
- ✅ More bandwidth ($0.15/GB after included)
- ✅ Faster builds
- ✅ Better analytics

### For Your App
**Estimated Cost**: Free tier is **likely sufficient** for moderate traffic!

Even with ~1,000 users/month:
- Bandwidth: ~10–20GB = **FREE**
- Function executions: ~10,000 = **FREE**
- Build minutes: ~100 = **FREE**

You'll only pay for database hosting (Neon free tier or $19/month).

## 🆚 Vercel vs Railway vs Render

### Vercel Advantages
- ✅ **Best for full-stack apps** with React/Next.js
- ✅ **Automatic CDN** for static assets
- ✅ **Zero-config** HTTPS and global edge network
- ✅ **Instant deployments** from Git
- ✅ **Great developer experience**

### Cost Comparison

| Platform | Monthly Cost | Best For |
|----------|--------------|----------|
| **Vercel Free** | $0 | Personal/small projects |
| **Vercel Pro** | $20 + usage | Production with traffic |
| **Railway Hobby** | $5 | Node.js apps |
| **Render Starter** | $7 | Node.js apps |

## 🔧 Troubleshooting

### Database Connection Issues

If you see connection errors:

1. Check `DATABASE_URL` is set correctly
2. Neon uses SSL by default - already handled in code
3. Pool size is set to 1 for serverless - should work fine

### Cold Start Issues

- Cold starts are ~200–500ms on Vercel
- Connection pooling is optimized for this
- First request after inactivity will be slower

### Function Timeout

Default timeout: 10 seconds (Hobby), 60 seconds (Pro)

If you hit timeouts:
- Check for slow database queries
- Consider Pro plan for 60s timeout
- Optimize your API endpoints

## 📝 Next Steps

1. Deploy to Vercel using steps above
2. Monitor performance in Vercel dashboard
3. Set up custom domain (optional)
4. Configure monitoring/alerts

## 🎉 You're All Set!

Your app is now production-ready on Vercel!


