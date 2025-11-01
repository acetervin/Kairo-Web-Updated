import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

async function applyMapUrlMigration() {
  console.log('Starting map_url migration...');
  
  const pool = new Pool({
    connectionString: process.env.DB_URL,
  });

  const client = await pool.connect();
  
  try {
    // Step 1: Add map_url column
    console.log('Adding map_url column...');
    await client.query(`
      ALTER TABLE properties ADD COLUMN IF NOT EXISTS map_url TEXT;
    `);
    console.log('✓ map_url column added');

    // Step 2: Seed sample map URLs
    console.log('Seeding sample map URLs...');
    
    await client.query(`
      UPDATE properties
      SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8214748627883!2d36.37298061431382!3d-0.7893148993150658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa2d52cffb471%3A0x7b7fa0da403babc2!2sLake%20Naivasha!5e0!3m2!1sen!2ske!4v1685435408351!5m2!1sen!2ske'
      WHERE id = 247;
    `);

    await client.query(`
      UPDATE properties
      SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816896338629!2d36.780859314313205!3d-1.2921000990438953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10f5d6931cdd%3A0xc8c5be3c01403b07!2sGeorge%20Padmore%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1730288000000!5m2!1sen!2ske'
      WHERE id = 239;
    `);

    await client.query(`
      UPDATE properties
      SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816896338629!2d36.780859314313205!3d-1.2921000990438953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10f5d6931cdd%3A0xc8c5be3c01403b07!2sGeorge%20Padmore%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1730288000000!5m2!1sen!2ske'
      WHERE id = 240;
    `);

    await client.query(`
      UPDATE properties
      SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63752.56080982412!2d39.56035407910155!3d-4.287446200000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x184013b265fd0b1f%3A0xbdbbbf4f32f9578d!2sDiani%20Beach!5e0!3m2!1sen!2ske!4v1730288100000!5m2!1sen!2ske'
      WHERE id = 241;
    `);

    console.log('✓ Sample map URLs seeded');

    // Step 3: Verify
    const result = await client.query(`
      SELECT id, name, map_url FROM properties ORDER BY id LIMIT 5
    `);

    console.log('\nVerification - Properties with map URLs:');
    result.rows.forEach((row: any) => {
      const hasMap = row.map_url ? '✓' : '✗';
      console.log(`  ${hasMap} ID ${row.id}: ${row.name}`);
      if (row.map_url) {
        console.log(`    Map URL: ${row.map_url.substring(0, 60)}...`);
      }
    });

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.release();
  }
}

applyMapUrlMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

