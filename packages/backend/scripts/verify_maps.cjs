require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const conn = process.env.DB_URL || process.env.DATABASE_URL;
  if (!conn) {
    console.error('DB_URL not set in .env');
    process.exit(2);
  }
  const pool = new Pool({ connectionString: conn, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT id, name, map_url FROM properties WHERE id IN (247,239,240,241) ORDER BY id`);
    console.log('Verification query results:');
    console.table(res.rows);
  } catch (err) {
    console.error('Verification failed:', err.message || err);
    process.exit(3);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e); process.exit(99); });
