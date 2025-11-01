import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

if (!connectionString) {
  console.error('DATABASE_URL or DB_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration...');
    
    // Apply migration 0103 - Add map_url column
    console.log('Adding map_url column to properties table...');
    const migration1 = readFileSync(
      join(__dirname, '../migrations/0103_add_map_url.sql'),
      'utf-8'
    );
    await client.query(migration1);
    console.log('✓ map_url column added successfully');
    
    // Apply migration 0104 - Seed map URLs
    console.log('Seeding sample map URLs...');
    const migration2 = readFileSync(
      join(__dirname, '../migrations/0104_seed_map_urls.sql'),
      'utf-8'
    );
    await client.query(migration2);
    console.log('✓ Sample map URLs added successfully');
    
    // Verify the changes
    const result = await client.query(
      'SELECT id, name, map_url FROM properties ORDER BY id LIMIT 5'
    );
    
    console.log('\nVerification - Properties with map URLs:');
    result.rows.forEach(row => {
      const hasMap = row.map_url ? '✓' : '✗';
      console.log(`  ${hasMap} ID ${row.id}: ${row.name}`);
      if (row.map_url) {
        console.log(`    Map URL: ${row.map_url.substring(0, 60)}...`);
      }
    });
    
    console.log('\n✓ Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

