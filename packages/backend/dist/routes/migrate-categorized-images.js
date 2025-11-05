const { Router } = require('express');
const { pool } = require('../db');
const router = Router();
// POST /api/migrate-categorized-images/run
router.post('/run', async (_req, res) => {
    try {
        // Add column if it doesn't exist
        await pool.query(`
      ALTER TABLE properties
      ADD COLUMN IF NOT EXISTS categorized_images JSONB NOT NULL DEFAULT '[]'::jsonb;
    `);
        // Ensure amenities is JSONB (optional hardening)
        await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'properties' AND column_name = 'amenities'
        ) THEN
          ALTER TABLE properties ADD COLUMN amenities JSONB DEFAULT '[]'::jsonb;
        END IF;
      END$$;
    `);
        res.json({ success: true, message: 'Migration applied: categorized_images ensured on properties table.' });
    }
    catch (error) {
        console.error('Migration error (categorized_images):', error);
        res.status(500).json({ success: false, message: 'Migration failed', error: error.message });
    }
});
module.exports = router;
