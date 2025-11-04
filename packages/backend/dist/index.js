import 'dotenv/config';
import express from "express";
import { serveStatic, log } from "./utils.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { generalRateLimiter } from "./middleware/rateLimiter.js";
import { cors } from "./middleware/cors.js";
// This function creates and configures the Express app.
// It's async to allow for async setup tasks like registering routes.
export async function createApp() {
    const app = express();
    // Apply CORS before other middleware
    app.use(cors);
    // Apply security headers to all routes
    app.use(securityHeaders);
    // Apply general rate limiting to all API routes (skip in serverless)
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    if (!isServerless) {
        app.use('/api', generalRateLimiter);
    }
    // Don't parse JSON for Stripe webhook - it needs raw body
    app.use((req, res, next) => {
        if (req.path === '/api/stripe/webhook') {
            next();
        }
        else {
            express.json()(req, res, next);
        }
    });
    app.use((req, res, next) => {
        if (req.path === '/api/stripe/webhook') {
            next();
        }
        else {
            express.urlencoded({ extended: false })(req, res, next);
        }
    });
    app.use((req, res, next) => {
        const start = Date.now();
        const path = req.path;
        let capturedJsonResponse = undefined;
        const originalResJson = res.json;
        res.json = function (bodyJson, ...args) {
            capturedJsonResponse = bodyJson;
            return originalResJson.apply(res, [bodyJson, ...args]);
        };
        res.on("finish", () => {
            const duration = Date.now() - start;
            if (path.startsWith("/api")) {
                let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
                if (capturedJsonResponse) {
                    logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
                }
                if (logLine.length > 80) {
                    logLine = logLine.slice(0, 79) + "…";
                }
                log(logLine);
            }
        });
        next();
    });
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
    });
    // Register API routes
    // Calendar sync endpoints
    try {
        // Lazy import to avoid requiring optional deps during lighter dev runs
        // @ts-ignore
        const { registerCalendarFeed, syncCalendarFeed, getBlockedDates, exportPropertyICal } = await import('./calendarSync.js');
        app.post('/api/calendar-sync', registerCalendarFeed);
        app.post('/api/calendar-sync/:id/sync', syncCalendarFeed);
        app.get('/api/properties/:propertyId/blocked-dates', getBlockedDates);
        app.get('/api/properties/:propertyId/ical', exportPropertyICal);
    }
    catch (e) {
        console.error('Failed to register calendar sync routes', e);
    }
    try {
        // @ts-ignore
        const stripeRoutes = (await import('./routes/stripe.js')).default;
        app.use('/api/stripe', stripeRoutes);
    }
    catch (e) {
        console.error('Failed to register stripe routes', e);
    }
    try {
        // @ts-ignore
        const propertiesRoutes = (await import('./routes/properties.js')).default;
        app.use('/api/properties', propertiesRoutes);
    }
    catch (e) {
        console.error('Failed to register properties routes', e);
    }
    try {
        // @ts-ignore
        const bookingsRoutes = (await import('./routes/bookings.js')).default;
        app.use('/api/bookings', bookingsRoutes);
    }
    catch (e) {
        console.error('Failed to register bookings routes', e);
    }
    try {
        // @ts-ignore
        const adminRoutes = (await import('./routes/admin.js')).default;
        app.use('/api/admin', adminRoutes);
    }
    catch (e) {
        console.error('Failed to register admin routes', e);
    }
    try {
        // @ts-ignore
        const migrateMapUrlRoutes = (await import('./routes/migrate-map-url.js')).default;
        app.use('/api/migrate-map-url', migrateMapUrlRoutes);
    }
    catch (e) {
        console.error('Failed to register migrate-map-url routes', e);
    }
    try {
        // @ts-ignore
        const migrateCategorizedImagesRoutes = (await import('./routes/migrate-categorized-images.js')).default;
        app.use('/api/migrate-categorized-images', migrateCategorizedImagesRoutes);
    }
    catch (e) {
        console.error('Failed to register migrate-categorized-images routes', e);
    }
    try {
        // @ts-ignore
        const migrateImagesStructureRoutes = (await import('./routes/migrate-images-structure.js')).default;
        app.use('/api/migrate-images-structure', migrateImagesStructureRoutes);
    }
    catch (e) {
        console.error('Failed to register migrate-images-structure routes', e);
    }
    // For Vercel deployment, we serve the static frontend files.
    // Only serve static in production (dist must exist for static serving)
    if (process.env.NODE_ENV === 'production') {
        serveStatic(app);
    }
    return app;
}
