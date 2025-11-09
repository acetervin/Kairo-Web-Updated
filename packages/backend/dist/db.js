"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Pool } = require('pg');
// Lazy initialization of database pool to avoid errors at module load time
let poolInstance = null;
function initializePool() {
    if (poolInstance) {
        return poolInstance;
    }
    const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
    if (!connectionString) {
        const errorMsg = 'DATABASE_URL or DB_URL environment variable is required. Please configure it in your environment variables.';
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    // Determine if SSL is required (e.g., Neon, Railway, or sslmode=require)
    const sslRequired = process.env.DB_SSL === 'true' ||
        /neon\.tech|sslmode=require/i.test(connectionString || '');
    // Pool size for Render deployment (non-serverless)
    const poolSize = 10;
    poolInstance = new Pool({
        connectionString,
        max: poolSize,
        idleTimeoutMillis: 30000,
        // Increase connect timeout to reduce transient timeouts
        connectionTimeoutMillis: 20000,
        // Enable SSL for Neon/sslmode URLs or when DB_SSL=true
        ssl: sslRequired ? { rejectUnauthorized: false } : false,
    });
    // Handle pool errors
    poolInstance.on('error', (err) => {
        console.error('Unexpected database pool error:', err);
    });
    // Test the connection on startup
    poolInstance.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Database connection test failed:', err);
        }
        else {
            console.log('Database connection test successful:', res.rows[0]);
        }
    });
    return poolInstance;
}
// Export pool as a Proxy that lazily initializes on first access
// This prevents the Pool from being created at module load time
const pool = new Proxy({}, {
    get(_target, prop) {
        const pool = initializePool();
        const value = pool[prop];
        // If it's a method, bind it to the pool instance
        if (typeof value === 'function') {
            return value.bind(pool);
        }
        return value;
    }
});
module.exports = { pool };
