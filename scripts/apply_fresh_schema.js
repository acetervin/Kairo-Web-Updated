import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function applySql(client, sql) {
  // naive split on ; respecting simple cases
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await client.query(stmt);
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
  if (!dbUrl) throw new Error('Set DATABASE_URL or DB_URL in .env');

  const sqlPath = path.join(process.cwd(), 'migrations', '0100_fresh_schema.sql');
  if (!fs.existsSync(sqlPath)) throw new Error('Missing migrations/0100_fresh_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();
  try {
    console.log('Applying fresh schema...');
    await applySql(client, sql);
    console.log('✓ Fresh schema applied');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


