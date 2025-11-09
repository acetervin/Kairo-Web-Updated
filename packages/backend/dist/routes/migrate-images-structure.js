"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const { pool } = require('../db');
const router = Router();
// POST /api/migrate-images-structure/run
router.post('/run', async (_req, res) => {
    try {
        // Ensure property_images table exists
        await pool.query(`
      CREATE TABLE IF NOT EXISTS property_images (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        category TEXT,
        image_url TEXT NOT NULL
      );
    `);
        // Add new columns if missing
        await pool.query(`
      ALTER TABLE property_images
      ADD COLUMN IF NOT EXISTS alt_text TEXT,
      ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    `);
        // Helpful indexes
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_property_images_property ON property_images(property_id);
      CREATE INDEX IF NOT EXISTS idx_property_images_property_category ON property_images(property_id, category);
      CREATE INDEX IF NOT EXISTS idx_property_images_primary ON property_images(property_id, is_primary);
    `);
        // Drop deprecated JSONB column if present
        await pool.query(`
      ALTER TABLE properties
      DROP COLUMN IF EXISTS categorized_images;
    `);
        res.json({ success: true, message: 'property_images structured; properties.categorized_images dropped if existed.' });
    }
    catch (error) {
        console.error('Migration error (images structure):', error);
        res.status(500).json({ success: false, message: 'Migration failed', error: error.message });
    }
});
module.exports = router;
