import 'dotenv/config';
import { Client } from 'pg';

async function run() {
  const connectionString = process.env.DB_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL or DB_URL environment variable is required');
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('Running images structure migration...');

    // Ensure property_images table exists (base shape)
    await client.query(`
      CREATE TABLE IF NOT EXISTS property_images (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        category TEXT,
        image_url TEXT NOT NULL
      );
    `);

    // Add/ensure new columns for scalability
    await client.query(`
      ALTER TABLE property_images
      ADD COLUMN IF NOT EXISTS alt_text TEXT,
      ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    `);

    // Helpful indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_property_images_property ON property_images(property_id);
      CREATE INDEX IF NOT EXISTS idx_property_images_property_category ON property_images(property_id, category);
      CREATE INDEX IF NOT EXISTS idx_property_images_primary ON property_images(property_id, is_primary);
    `);

    // Drop deprecated JSONB column if present
    await client.query(`
      ALTER TABLE properties
      DROP COLUMN IF EXISTS categorized_images;
    `);

    console.log('Images structure migration complete.');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});






