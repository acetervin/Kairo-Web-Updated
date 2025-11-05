require('dotenv/config');
const express = require("express");
const { serveStatic, log } = require("./utils");
const { securityHeaders } = require("./middleware/securityHeaders");
const { generalRateLimiter } = require("./middleware/rateLimiter");
const { cors } = require("./middleware/cors");
// This function creates and configures the Express app.
// It's async to allow for async setup tasks like registering routes.
async function createApp() {
    const app = express();
    // Apply CORS before other middleware
    app.use(cors);
    // Apply security headers to all routes
    app.use(securityHeaders);
    // Apply general rate limiting to all API routes
    app.use('/api', generalRateLimiter);
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
        const { registerCalendarFeed, syncCalendarFeed, getBlockedDates, exportPropertyICal } = require('./calendarSync');
        app.post('/api/calendar-sync', registerCalendarFeed);
        app.post('/api/calendar-sync/:id/sync', syncCalendarFeed);
        app.get('/api/properties/:propertyId/blocked-dates', getBlockedDates);
        app.get('/api/properties/:propertyId/ical', exportPropertyICal);
    }
    catch (e) {
        console.error('Failed to register calendar sync routes', e);
    }
    try {
        const stripeRoutes = require('./routes/stripe');
        app.use('/api/stripe', stripeRoutes);
        console.log('✅ Stripe routes registered successfully');
    }
    catch (e) {
        console.error('❌ Failed to register stripe routes:', e);
        console.error('This may be because the routes were not compiled. Make sure to run: npm run build --workspace=@boo-back/backend');
    }
    try {
        const propertiesRoutes = require('./routes/properties');
        app.use('/api/properties', propertiesRoutes);
    }
    catch (e) {
        console.error('Failed to register properties routes', e);
    }
    try {
        const bookingsRoutes = require('./routes/bookings');
        app.use('/api/bookings', bookingsRoutes);
    }
    catch (e) {
        console.error('Failed to register bookings routes', e);
    }
    try {
        const adminRoutes = require('./routes/admin');
        app.use('/api/admin', adminRoutes);
    }
    catch (e) {
        console.error('Failed to register admin routes', e);
    }
    try {
        const migrateMapUrlRoutes = require('./routes/migrate-map-url');
        app.use('/api/migrate-map-url', migrateMapUrlRoutes);
    }
    catch (e) {
        console.error('Failed to register migrate-map-url routes', e);
    }
    try {
        const migrateCategorizedImagesRoutes = require('./routes/migrate-categorized-images');
        app.use('/api/migrate-categorized-images', migrateCategorizedImagesRoutes);
    }
    catch (e) {
        console.error('Failed to register migrate-categorized-images routes', e);
    }
    try {
        const migrateImagesStructureRoutes = require('./routes/migrate-images-structure');
        app.use('/api/migrate-images-structure', migrateImagesStructureRoutes);
    }
    catch (e) {
        console.error('Failed to register migrate-images-structure routes', e);
    }
    // For Render deployment, we serve the static frontend files.
    // Only serve static in production (dist must exist for static serving)
    if (process.env.NODE_ENV === 'production') {
        serveStatic(app);
    }
    return app;
}
module.exports = { createApp };
