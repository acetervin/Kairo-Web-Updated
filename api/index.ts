import { type Express } from 'express';
// @ts-ignore - dist/index.js is built at deployment time
import { createApp } from '../dist/index.js';

// This file serves as the entry point for the Vercel serverless function.
// It creates the app instance on the first request and caches it for subsequent ones.
let cachedApp: Express;

export default async function handler(req: any, res: any) {
  try {
    // Log environment info for debugging
    console.log('Vercel function invoked:', {
      path: req.url,
      method: req.method,
      hasDatabaseUrl: !!(process.env.DATABASE_URL || process.env.DB_URL),
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL
    });

    // Don't cache the app in production/Vercel environment
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      const app = await createApp();
      return app(req, res);
    } else {
      // Cache only in development
      if (!cachedApp) {
        console.log('Initializing server in development environment');
        console.log('Database URL configured:', !!(process.env.DATABASE_URL || process.env.DB_URL));
        console.log('Node ENV:', process.env.NODE_ENV);
        
        cachedApp = await createApp();
        console.log('Server initialized successfully');
      }
      return cachedApp(req, res);
    }
  } catch (error: unknown) {
    console.error('Error in Vercel handler:', error);
    
    // Extract error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', { errorMessage, errorStack });
    
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
