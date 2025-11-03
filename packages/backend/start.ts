import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createApp } from './index.js';
import minimist from 'minimist';

// Load .env from project root (2 levels up from packages/backend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');
config({ path: resolve(rootDir, '.env') });

async function start() {
    console.log('Starting server...');
    console.log('DB_URL:', process.env.DB_URL ? 'configured' : 'not set');
    const app = await createApp();
    // raw body capture for Stripe webhook is now handled in createApp()
    console.log('App created.');
    const argv = minimist(process.argv.slice(2));
    // Backend runs on port 3000 by default, frontend on 5000
    const port = argv.port || process.env.PORT || process.env.BACKEND_PORT || 3000;

    // In development, backend runs independently (frontend connects via proxy)
    // In production, backend serves static files
    app.listen(port, '0.0.0.0', () => {
        const mode = process.env.NODE_ENV === 'production' ? 'Production' : 'Development (API only)';
        console.log(`${mode} server is running on http://0.0.0.0:${port}`);
        if (process.env.NODE_ENV !== 'production') {
            console.log('Frontend should run separately on port 5000');
        }
    });
    // Optional: automatic calendar sync if interval set
    try {
        const interval = process.env.CALENDAR_SYNC_INTERVAL_MINUTES;
        if (interval) {
            // @ts-ignore
            const { syncAllFeeds } = await import('./calendarSync.js');
            const minutes = Number(interval);
            console.log(`Calendar sync enabled every ${minutes} minutes`);
            // run once on startup
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