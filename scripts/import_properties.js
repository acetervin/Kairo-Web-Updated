import fs from 'fs';
import path from 'path';
import { Pool } from '@neondatabase/serverless';

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');

async function upsertProperties(client, items) {
  for (const p of items) {
    // Map JSON fields to DB columns
    const params = [p.id, p.name, p.description, p.location, p.price_per_night, p.max_guests, p.bedrooms, p.image_url, p.main_image_url, p.images || [], p.amenities || [], p.featured || false, p.category || 'uncategorized', p.is_active !== false, p.categorized_images || []];
    if (DRY) {
      console.log('[dry] upsert property', p.id, p.name);
      continue;
    }
    const res = await client.query(
      `INSERT INTO properties (id, name, description, location, price_per_night, max_guests, bedrooms, image_url, main_image_url, images, amenities, featured, category, is_active, categorized_images)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name RETURNING *`,
      params
    );
    console.log('Upserted property', res.rows[0].id);
  }
}

async function upsertPropertyImages(client, items) {
  for (const img of items) {
    if (DRY) {
      console.log('[dry] upsert property_image', img.id, img.property_id, img.category);
      continue;
    }
    await client.query(`INSERT INTO property_images (id, property_id, category, image_url) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url`, [img.id, img.property_id, img.category, img.image_url]);
  }
  console.log('Imported', items.length, 'property images');
}

async function main() {
  const file = path.join(process.cwd(), 'client', 'src', 'data', 'properties.json');
  if (!fs.existsSync(file)) {
    console.error('properties.json not found at', file);
    process.exit(1);
  }
  const raw = fs.readFileSync(file, 'utf8');
  const items = JSON.parse(raw);

  const imagesFile = path.join(process.cwd(), 'client', 'src', 'data', 'property-images.json');
  const images = fs.existsSync(imagesFile) ? JSON.parse(fs.readFileSync(imagesFile, 'utf8')) : [];

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await upsertProperties(client, items);
    if (images.length > 0) await upsertPropertyImages(client, images);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
