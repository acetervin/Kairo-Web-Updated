import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function readJson(relPath) {
  const full = path.join(process.cwd(), relPath);
  if (!fs.existsSync(full)) throw new Error(`Missing file: ${full}`);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function buildPropertyIdToImages(images) {
  const map = new Map();
  for (const img of images) {
    if (!map.has(img.property_id)) map.set(img.property_id, []);
    map.get(img.property_id).push(img.image_url);
  }
  return map;
}

function buildPropertyIdToCategorized(images) {
  const map = new Map();
  for (const img of images) {
    const pid = img.property_id;
    if (!map.has(pid)) map.set(pid, new Map());
    const catMap = map.get(pid);
    const cat = img.category || 'Gallery';
    if (!catMap.has(cat)) catMap.set(cat, []);
    catMap.get(cat).push(img.image_url);
  }
  // convert to array form
  const result = new Map();
  for (const [pid, catMap] of map.entries()) {
    const arr = [];
    for (const [cat, urls] of catMap.entries()) {
      arr.push({ category: cat, images: urls });
    }
    result.set(pid, arr);
  }
  return result;
}

async function seed() {
  const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
  if (!dbUrl) throw new Error('Set DATABASE_URL or DB_URL');
  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();
  try {
    const props = readJson(path.join('packages', 'frontend', 'src', 'data', 'properties.json'));
    const imgs = readJson(path.join('packages', 'frontend', 'src', 'data', 'property-images.json'));
    const idToImages = buildPropertyIdToImages(imgs);
    const idToCategorized = buildPropertyIdToCategorized(imgs);

    for (const p of props) {
      const images = (p.images && p.images.length > 0) ? p.images : (idToImages.get(p.id) || []);
      const mainImage = p.main_image_url || images[0] || p.image_url || null;
      const categorized = idToCategorized.get(p.id) || [];
      const params = [
        p.id,
        p.name,
        p.description,
        p.location,
        Number(p.price_per_night),
        Number(p.max_guests),
        Number(p.bedrooms),
        mainImage,
        images,
        p.amenities || [],
        p.category || 'uncategorized',
        p.is_active !== false,
        JSON.stringify(categorized),
      ];
      const sql = `
        INSERT INTO properties
          (id, name, description, location, price_per_night, max_guests, bedrooms, main_image_url, images, amenities, category, is_active, categorized_images)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          location = EXCLUDED.location,
          price_per_night = EXCLUDED.price_per_night,
          max_guests = EXCLUDED.max_guests,
          bedrooms = EXCLUDED.bedrooms,
          main_image_url = EXCLUDED.main_image_url,
          images = EXCLUDED.images,
          amenities = EXCLUDED.amenities,
          category = EXCLUDED.category,
          is_active = EXCLUDED.is_active,
          categorized_images = EXCLUDED.categorized_images
      `;
      await client.query(sql, params);
    }
    console.log(`Seeded ${props.length} properties.`);

    // Insert property images in relational table
    const insertImgSql = `INSERT INTO property_images (property_id, category, image_url) VALUES ($1,$2,$3)`;
    let inserted = 0;
    for (const img of imgs) {
      if (!img || !img.property_id || !img.image_url) continue;
      await client.query(insertImgSql, [img.property_id, img.category || null, img.image_url]);
      inserted++;
    }
    console.log(`Seeded ${inserted} property images.`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => { console.error(e); process.exit(1); });


