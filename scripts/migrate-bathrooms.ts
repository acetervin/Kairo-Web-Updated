import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
  if (!connectionString) {
    console.error('DATABASE_URL or DB_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    console.log('🚀 Running bathrooms + main_image_url backfill migration...');

    // 1) Add bathrooms column if missing
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'properties' AND column_name = 'bathrooms'
        ) THEN
          ALTER TABLE properties
          ADD COLUMN bathrooms INTEGER;
        END IF;
      END$$;
    `);

    // 2) Ensure bathrooms has a non-null default and values
    await pool.query(`
      UPDATE properties SET bathrooms = 1 WHERE bathrooms IS NULL;
      ALTER TABLE properties ALTER COLUMN bathrooms SET NOT NULL;
      ALTER TABLE properties ALTER COLUMN bathrooms SET DEFAULT 1;
    `);

    // 3) Optional: backfill main_image_url from image_url if empty
    await pool.query(`
      UPDATE properties
      SET main_image_url = image_url
      WHERE (main_image_url IS NULL OR main_image_url = '') AND image_url IS NOT NULL;
    `);

    console.log('✅ Migration completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();





