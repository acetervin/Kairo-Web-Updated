"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node" />
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
        // @ts-ignore
        const { registerCalendarFeed, syncCalendarFeed, getBlockedDates, exportPropertyICal } = await Promise.resolve().then(() => __importStar(require('./calendarSync.js')));
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
        const stripeRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/stripe.js')))).default;
        app.use('/api/stripe', stripeRoutes);
        console.log('✅ Stripe routes registered successfully');
    }
    catch (e) {
        console.error('❌ Failed to register stripe routes:', e);
        console.error('This may be because the routes were not compiled. Make sure to run: npm run build --workspace=@boo-back/backend');
    }
    try {
        // @ts-ignore
        const propertiesRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/properties.js')))).default;
        app.use('/api/properties', propertiesRoutes);
    }
    catch (e) {
        console.error('Failed to register properties routes', e);
    }
    try {
        // @ts-ignore
        const bookingsRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/bookings.js')))).default;
        app.use('/api/bookings', bookingsRoutes);
    }
    catch (e) {
        console.error('Failed to register bookings routes', e);
    }
    try {
        // @ts-ignore
        const adminRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/admin.js')))).default;
        app.use('/api/admin', adminRoutes);
    }
    catch (e) {
        console.error('Failed to register admin routes', e);
    }
    try {
        // @ts-ignore
        const migrateMapUrlRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/migrate-map-url.js')))).default;
        app.use('/api/migrate-map-url', migrateMapUrlRoutes);
    }
    catch (e) {
        console.error('Failed to register migrate-map-url routes', e);
    }
    try {
        // @ts-ignore
        const migrateCategorizedImagesRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/migrate-categorized-images.js')))).default;
        app.use('/api/migrate-categorized-images', migrateCategorizedImagesRoutes);
    }
    catch (e) {
        console.error('Failed to register migrate-categorized-images routes', e);
    }
    try {
        // @ts-ignore
        const migrateImagesStructureRoutes = (await Promise.resolve().then(() => __importStar(require('./routes/migrate-images-structure.js')))).default;
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
