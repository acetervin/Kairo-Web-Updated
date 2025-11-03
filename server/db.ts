import { Pool } from 'pg';

// Create a single shared connection pool for the application
const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or DB_URL environment variable is required');
}

// Determine if SSL is required (e.g., Neon, Railway, or sslmode=require)
const sslRequired =
  process.env.DB_SSL === 'true' ||
  /neon\.tech|sslmode=require/i.test(connectionString || '');

// Determine pool size based on environment
// Serverless (Vercel, AWS Lambda) should use smaller pools
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const poolSize = isServerless ? 1 : 10;

export const pool = new Pool({
  connectionString,
  max: poolSize,
  idleTimeoutMillis: 30000,
  // Increase connect timeout to reduce transient timeouts
  connectionTimeoutMillis: 20000,
  // Enable SSL for Neon/sslmode URLs or when DB_SSL=true
  ssl: sslRequired ? { rejectUnauthorized: false } : false,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Test the connection on startup (skip in serverless to reduce cold start)
if (!isServerless) {
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection test failed:', err);
    } else {
      console.log('Database connection test successful:', res.rows[0]);
    }
  });
}

// Pool is already exported above with 'export const pool'