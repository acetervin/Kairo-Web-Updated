import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node scripts/apply_sql_file.js <path-to-sql>');
    process.exit(1);
  }
  const sqlPath = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg);
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
  if (!dbUrl) {
    console.error('Set DATABASE_URL or DB_URL in .env');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();
  try {
    console.log('Applying SQL from', sqlPath);
    await client.query(sql);
    console.log('✓ Applied');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


