import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { Pool } from "pg";
// JSON imports removed - this project now relies on Neon database fully
// If you need to seed data, use the database directly or create seed scripts that query the database
// import propertiesData from "../frontend/src/data/properties.json";
// import propertyImagesData from "../frontend/src/data/property-images.json";

dotenv.config();

const connectionString = process.env.DB_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Please set DB_URL or DATABASE_URL environment variable before running this script.");
  process.exit(1);
}

const pool = new Pool({ connectionString, max: 5 });

type PropertyInput = {
  id?: number;
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  image_url: string;
  main_image_url?: string | null;
  gallery_image_url?: string | null;
  images?: string[];
  categorized_images?: Record<string, string[]>;
  amenities?: string[];
  featured?: boolean;
  category?: string;
  is_active?: boolean;
};

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding properties...");
    console.warn("WARNING: This seed script is deprecated. The project now relies on Neon database fully.");
    console.warn("Please use the database directly to manage properties, or create new seed scripts that don't depend on JSON files.");
    
    // This script is no longer functional without JSON files
    // If you need to seed data, create a new script or use database migrations
    console.log("Seeding skipped - no JSON data available.");
    console.log("To seed data, please use database migrations or create data directly in Neon database.");
    
    // Uncomment below if you have properties data from another source
    /*
    // Clear existing data (developer/dev environment expectation)
    await client.query("BEGIN");
    await client.query("DELETE FROM properties");
    await client.query("COMMIT");

    for (const p of (propertiesData as PropertyInput[])) {
      const imagesForProperty = (propertyImagesData as any[])
        .filter((i) => i.property_id === p.id)
        .map((i) => i.image_url);

      const categorized: Record<string, string[]> = {};
      for (const img of (propertyImagesData as any[]).filter((i) => i.property_id === p.id)) {
        if (!categorized[img.category]) categorized[img.category] = [];
        categorized[img.category].push(img.image_url);
      }

      const insertSql = `
        INSERT INTO properties
          (id, name, description, location, price_per_night, max_guests, bedrooms, image_url, main_image_url, gallery_image_url, images, categorized_images, amenities, featured, category, is_active)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING id
      `;

      const values = [
        p.id || null,
        p.name,
        p.description,
        p.location,
        p.price_per_night,
        p.max_guests,
        p.bedrooms,
        p.image_url,
        p.main_image_url || null,
        p.gallery_image_url || null,
        imagesForProperty.length ? imagesForProperty : (p.images || []),
        Object.keys(categorized).length ? JSON.stringify(categorized) : JSON.stringify(p.categorized_images || {}),
        p.amenities || [],
        p.featured || false,
        p.category || "",
        p.is_active === undefined ? true : p.is_active,
      ];

      const res = await client.query(insertSql, values);
      console.log(`Inserted property id=${res.rows[0].id} name=${p.name}`);
    }

    // Fix sequence for properties.id
    await client.query(`SELECT setval(pg_get_serial_sequence('properties','id'), (SELECT COALESCE(MAX(id), 1) FROM properties))`);
    */

    console.log("Seeding completed.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});