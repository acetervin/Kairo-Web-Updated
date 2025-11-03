const fs = require('fs');
const { Pool } = require('pg');

function loadEnvDbUrl() {
  const env = fs.readFileSync('.env', 'utf8');
  const line = env.split(/\r?\n/).find((l) => l.startsWith('DB_URL'));
  if (!line) return process.env.DB_URL || process.env.DATABASE_URL;
  return line.split('=')[1].replace(/"/g, '').trim();
}

(async () => {
  try {
    const dbUrl = loadEnvDbUrl();
    if (!dbUrl) {
      console.error('DB URL not found in .env or environment variables');
      process.exit(1);
    }

    const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();

    const jsonProps = JSON.parse(fs.readFileSync('packages/frontend/src/data/properties.json', 'utf8'));
    const jsonImgs = JSON.parse(fs.readFileSync('packages/frontend/src/data/property-images.json', 'utf8'));

    const resCount = await client.query('SELECT COUNT(*)::int AS count FROM properties');
    const dbCount = resCount.rows[0].count;

    const resIds = await client.query('SELECT id, name FROM properties');
    const dbIds = resIds.rows.map(r => r.id);

    const jsonIds = jsonProps.map(p => p.id).filter(Boolean);

    const missingInDb = jsonIds.filter(id => !dbIds.includes(id));
    const extraInDb = dbIds.filter(id => !jsonIds.includes(id));

    // sample mismatch checks for names
    const nameMismatches = [];
    for (const p of jsonProps) {
      if (!p.id) continue;
      const match = resIds.rows.find(r => r.id === p.id);
      if (match && match.name !== p.name) {
        nameMismatches.push({ id: p.id, jsonName: p.name, dbName: match.name });
      }
    }

    console.log(JSON.stringify({
      json_properties_count: jsonProps.length,
      json_property_images_count: jsonImgs.length,
      db_properties_count: dbCount,
      sample_db_rows: resIds.rows.slice(0, 10),
      missing_in_db: missingInDb.slice(0, 20),
      extra_in_db: extraInDb.slice(0, 20),
      name_mismatches: nameMismatches.slice(0, 20),
    }, null, 2));

    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error during check:', err);
    process.exit(1);
  }
})();
