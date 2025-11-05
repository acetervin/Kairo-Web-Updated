"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
// @ts-ignore - dist/index.js is built at deployment time
const index_js_1 = require("../dist/index.js");
// This file serves as the entry point for the Vercel serverless function.
// It creates the app instance on the first request and caches it for subsequent ones.
let cachedApp;
// Helper function to wrap Express app call in a Promise
// Vercel serverless functions must wait for the response to complete before the function exits
// Express handles responses asynchronously, so we need to wait for res.end() to be called
function promisifyHandler(app, req, res) {
    return new Promise((resolve, reject) => {
        // Monitor when the response finishes
        res.once('finish', resolve);
        res.once('close', resolve);
        res.once('error', reject);
        // Call Express app handler - it will eventually call res.end() or res.send()
        app(req, res, (err) => {
            if (err) {
                reject(err);
            }
            // If middleware chain completes without error but no response sent, resolve
            // (Express might send response asynchronously via res.end())
            if (!res.headersSent && !res.writableEnded) {
                // Give Express a moment to send response, then resolve
                setTimeout(resolve, 0);
            }
        });
    });
}
async function handler(req, res) {
    try {
        // Log environment info for debugging
        console.log('Vercel function invoked:', {
            path: req.url,
            method: req.method,
            hasDatabaseUrl: !!(process.env.DATABASE_URL || process.env.DB_URL),
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL
        });
        // Cache the app instance - Vercel can reuse function instances across requests
        // This reduces cold start time for subsequent invocations
        if (!cachedApp) {
            console.log('Initializing Express app...');
            console.log('Database URL configured:', !!(process.env.DATABASE_URL || process.env.DB_URL));
            cachedApp = await (0, index_js_1.createApp)();
            console.log('Express app initialized successfully');
        }
        // Wait for Express to fully handle the request before the function exits
        await promisifyHandler(cachedApp, req, res);
    }
    catch (error) {
        console.error('Error in Vercel handler:', error);
        // Extract error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Error details:', { errorMessage, errorStack });
        // Only send error response if headers haven't been sent yet
        if (!res.headersSent) {
            // Check if it's a database connection error
            if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('DB_URL')) {
                return res.status(500).json({
                    error: 'Database Configuration Error',
                    message: 'DATABASE_URL environment variable is not configured. Please set it in Vercel project settings.',
                    hint: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables → Add DATABASE_URL'
                });
            }
            // Ensure we always send a response even if there's an error
            res.status(500).json({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development' ?
                    errorMessage :
                    'Failed to initialize server. Check Vercel function logs for details.'
            });
        }
    }
}
