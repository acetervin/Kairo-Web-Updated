"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const { pool } = require('../db');
const router = Router();
// One-time migration endpoint to add map_url and seed sample data
router.post('/run', async (_req, res) => {
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
        const properties = result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            hasMap: !!row.map_url,
            mapUrlPreview: row.map_url ? row.map_url.substring(0, 60) + '...' : null
        }));
        res.json({
            success: true,
            message: 'Migration completed successfully!',
            properties
        });
    }
    catch (error) {
        console.error('Migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
    finally {
        client.release();
    }
});
module.exports = router;
