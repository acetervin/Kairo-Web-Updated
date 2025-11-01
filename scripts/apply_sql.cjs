#!/usr/bin/env node
// Small migration runner using pg (CommonJS). Reads DB_URL from .env and applies provided SQL file inside a transaction.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/apply_sql.cjs <path-to-sql-file>');
    process.exit(2);
  }
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error('SQL file not found:', filePath);
    process.exit(3);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const conn = process.env.DB_URL || process.env.DATABASE_URL;
  if (!conn) {
    console.error('DB_URL or DATABASE_URL not found in environment. Please set it in .env');
    process.exit(4);
  }

  const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    console.log('Connected to DB. Running migration from', filePath);
    await client.query('BEGIN');
    const res = await client.query(sql);
    await client.query('COMMIT');

    if (res && res.rows) {
      console.log('Final SELECT result rows:');
      console.table(res.rows);
    } else {
      console.log('Migration executed. No rows returned from final statement.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Migration failed, rolling back. Error:', err.message || err);
    try {
      await client.query('ROLLBACK');
    } catch (rbErr) {
      console.error('Rollback failed:', rbErr.message || rbErr);
    }
    process.exit(5);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(99);
});
