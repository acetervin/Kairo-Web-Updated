import { createApp } from './index.js';
import http from 'http';
import minimist from 'minimist';
async function start() {
    console.log('Starting server...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'not set');
    const app = await createApp();
    // raw body capture for Stripe webhook is now handled in createApp()
    console.log('App created.');
    const argv = minimist(process.argv.slice(2));
    const port = argv.port || process.env.PORT || 5000;
    if (process.env.NODE_ENV !== 'production') {
        // Create raw HTTP server so we can attach Vite middleware (HMR) to it
        const server = http.createServer(app);
        try {
            // @ts-ignore
            const { setupVite } = await import('./vite.js');
            await setupVite(app, server);
        }
        catch (e) {
            console.error('Failed to setup Vite middleware', e);
        }
        server.listen(port, '0.0.0.0', () => {
            console.log(`Dev server (with Vite) is running on http://0.0.0.0:${port}`);
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
    else {
        app.listen(port, '0.0.0.0', () => {
            console.log(`Server is running on http://0.0.0.0:${port}`);
        });
        // In production also start background sync (process manager must keep process alive)
        /* try {
            // @ts-ignore
            const { syncAllFeeds } = await import('./calendarSync.js');
            syncAllFeeds().then((r: any) => console.log('Initial calendar sync result:', r)).catch((e: any) => console.error('Initial calendar sync error', e));
            const minutes = Number(process.env.CALENDAR_SYNC_INTERVAL_MINUTES || '15');
            setInterval(() => {
                syncAllFeeds().then((r: any) => console.log('Scheduled calendar sync result:', r)).catch((e: any) => console.error('Scheduled calendar sync error', e));
            }, minutes * 60 * 1000);
        } catch (e) {
            console.error('Failed to start calendar sync', e);
        } */
    }
}
start().catch(console.error);
