import 'dotenv/config';
import express, { type Express, type Request, Response, NextFunction } from "express";
import { serveStatic, log } from "./utils.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { generalRateLimiter } from "./middleware/rateLimiter.js";
import { cors } from "./middleware/cors.js";

// This function creates and configures the Express app.
// It's async to allow for async setup tasks like registering routes.
export async function createApp(): Promise<Express> {
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
        } else {
            express.json()(req, res, next);
        }
    });
    
    app.use((req, res, next) => {
        if (req.path === '/api/stripe/webhook') {
            next();
        } else {
            express.urlencoded({ extended: false })(req, res, next);
        }
    });

    app.use((req, res, next) => {
        const start = Date.now();
        const path = req.path;
        let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
    } catch (e) {
        console.error('Failed to register calendar sync routes', e);
    }

    try {
        // @ts-ignore
        const stripeRoutes = (await import('./routes/stripe.js')).default;
        app.use('/api/stripe', stripeRoutes);
    } catch (e) {
        console.error('Failed to register stripe routes', e);
    }

    try {
        // @ts-ignore
        const propertiesRoutes = (await import('./routes/properties.js')).default;
        app.use('/api/properties', propertiesRoutes);
    } catch (e) {
        console.error('Failed to register properties routes', e);
    }

    try {
        // @ts-ignore
        const bookingsRoutes = (await import('./routes/bookings.js')).default;
        app.use('/api/bookings', bookingsRoutes);
    } catch (e) {
        console.error('Failed to register bookings routes', e);
    }

    try {
        // @ts-ignore
        const adminRoutes = (await import('./routes/admin.js')).default;
        app.use('/api/admin', adminRoutes);
    } catch (e) {
        console.error('Failed to register admin routes', e);
    }

    try {
        // @ts-ignore
        const migrateMapUrlRoutes = (await import('./routes/migrate-map-url.js')).default;
        app.use('/api/migrate-map-url', migrateMapUrlRoutes);
    } catch (e) {
        console.error('Failed to register migrate-map-url routes', e);
    }

    try {
        // @ts-ignore
        const migrateCategorizedImagesRoutes = (await import('./routes/migrate-categorized-images.js')).default;
        app.use('/api/migrate-categorized-images', migrateCategorizedImagesRoutes);
    } catch (e) {
        console.error('Failed to register migrate-categorized-images routes', e);
    }

    try {
        // @ts-ignore
        const migrateImagesStructureRoutes = (await import('./routes/migrate-images-structure.js')).default;
        app.use('/api/migrate-images-structure', migrateImagesStructureRoutes);
    } catch (e) {
        console.error('Failed to register migrate-images-structure routes', e);
    }

    // For Vercel deployment, we serve the static frontend files.
    // Only serve static in production (dist must exist for static serving)
    if (process.env.NODE_ENV === 'production') {
        serveStatic(app);
    }

    return app;
}

// If this file is run directly (e.g., as entry point for Render), start the server
// This allows index.js to work both as an exportable module and as a standalone entry point
import { fileURLToPath as urlToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = urlToPath(import.meta.url);
// Check if we're running as the main module or if PORT is set (Render always sets PORT)
const isMainModule = process.argv[1] && urlToPath(process.argv[1]) === __filename;
const shouldStartServer = isMainModule || (process.env.NODE_ENV === 'production' && process.env.PORT);

if (shouldStartServer) {
    const { config } = await import('dotenv');
    // @ts-ignore - minimist types are available but may not be resolved in some environments
    const minimist = (await import('minimist')).default;

    // Load .env from project root (2 levels up from packages/backend)
    const mainDirname = dirname(__filename);
    const rootDir = resolve(mainDirname, '../..');
    config({ path: resolve(rootDir, '.env') });

    async function start() {
        console.log('Starting server...');
        console.log('DB_URL:', process.env.DB_URL ? 'configured' : 'not set');
        const app = await createApp();
        console.log('App created.');
        const argv = minimist(process.argv.slice(2));
        // Use PORT from environment (Render sets this) or default to 3000
        const port = argv.port || process.env.PORT || process.env.BACKEND_PORT || 3000;

        app.listen(port, '0.0.0.0', () => {
            const mode = process.env.NODE_ENV === 'production' ? 'Production' : 'Development (API only)';
            console.log(`${mode} server is running on http://0.0.0.0:${port}`);
        });

        // Optional: automatic calendar sync if interval set
        try {
            const interval = process.env.CALENDAR_SYNC_INTERVAL_MINUTES;
            if (interval) {
                // @ts-ignore
                const { syncAllFeeds } = await import('./calendarSync.js');
                const minutes = Number(interval);
                console.log(`Calendar sync enabled every ${minutes} minutes`);
                syncAllFeeds().then((r: any) => console.log('Initial calendar sync result:', r)).catch((e: any) => console.error('Initial calendar sync error', e));
                setInterval(() => {
                    syncAllFeeds().then((r: any) => console.log('Scheduled calendar sync result:', r)).catch((e: any) => console.error('Scheduled calendar sync error', e));
                }, minutes * 60 * 1000);
            }
        } catch (e) {
            console.error('Failed to start calendar sync', e);
        }
    }

    start().catch(console.error);
}
