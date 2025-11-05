const { config } = require('dotenv');
const path = require('path');
const { createApp } = require('./index');
const minimist = require('minimist');
// Load .env from project root (2 levels up from packages/backend)
const rootDir = path.resolve(__dirname, '../..');
config({ path: path.resolve(rootDir, '.env') });
async function start() {
    console.log('Starting server...');
    console.log('DB_URL:', process.env.DB_URL ? 'configured' : 'not set');
    const app = await createApp();
    // raw body capture for Stripe webhook is now handled in createApp()
    console.log('App created.');
    const argv = minimist(process.argv.slice(2));
    // Prioritize PORT (Render.com convention), then BACKEND_PORT, then argv.port, or use 0 to find an open port
    const requestedPort = process.env.PORT || process.env.BACKEND_PORT || argv.port;
    // Convert to number, or use 0 if not provided (0 = find an open port)
    const port = requestedPort && requestedPort !== '' ? Number(requestedPort) : 0;
    if (port === 0 && process.env.NODE_ENV === 'production') {
        console.warn('Warning: No PORT specified in production. Using auto-assigned port.');
    }
    console.log(`Attempting to listen on port: ${port === 0 ? 'auto (0)' : port}`);
    if (process.env.PORT) {
        console.log(`PORT environment variable: ${process.env.PORT}`);
    }
    // In development, backend runs independently (frontend connects via proxy)
    // In production, backend serves static files
    const server = app.listen(port, '0.0.0.0', () => {
        const address = server.address();
        const actualPort = typeof address === 'object' && address ? address.port : port;
        const mode = process.env.NODE_ENV === 'production' ? 'Production' : 'Development (API only)';
        console.log(`${mode} server is running on http://0.0.0.0:${actualPort}`);
        if (process.env.NODE_ENV !== 'production') {
            console.log('Frontend should run separately on port 5000');
        }
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use.`);
        }
        else {
            console.error('Server error:', err);
        }
        process.exit(1);
    });
    // Optional: automatic calendar sync if interval set
    try {
        const interval = process.env.CALENDAR_SYNC_INTERVAL_MINUTES;
        if (interval) {
            const { syncAllFeeds } = require('./calendarSync');
            const minutes = Number(interval);
            console.log(`Calendar sync enabled every ${minutes} minutes`);
            // run once on startup
            syncAllFeeds().then((r) => console.log('Initial calendar sync result:', r)).catch((e) => console.error('Initial calendar sync error', e));
            setInterval(() => {
                syncAllFeeds().then((r) => console.log('Scheduled calendar sync result:', r)).catch((e) => console.error('Scheduled calendar sync error', e));
            }, minutes * 60 * 1000);
        }
    }
    catch (e) {
        console.error('Failed to start calendar sync', e);
    }
}
start().catch(console.error);
