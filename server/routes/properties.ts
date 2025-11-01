import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const rows = await pool.query('SELECT * FROM properties WHERE is_active = true ORDER BY id');
    const properties = rows.rows;

    // If there are properties, fetch their images from property_images in one query
    if (properties.length > 0) {
      const ids = properties.map((p: any) => p.id);
      const imgRows = await pool.query(
        'SELECT property_id, category, image_url FROM property_images WHERE property_id = ANY($1) AND (is_active IS NULL OR is_active = true) ORDER BY property_id, sort_order, id',
        [ids]
      );

      // Build a map from property_id -> categorized images array
      const byProperty: Record<number, Record<string, string[]>> = {};
      for (const r of imgRows.rows) {
        const pid = Number(r.property_id);
        if (!byProperty[pid]) byProperty[pid] = {};
        const cat = r.category || 'Gallery';
        if (!byProperty[pid][cat]) byProperty[pid][cat] = [];
        byProperty[pid][cat].push(r.image_url);
      }

      // Attach categorized_images to each property in the expected format
      for (const p of properties) {
        const map = byProperty[p.id] || {};
        const categorized = Object.entries(map).map(([category, images]) => ({ category, images }));
        p.categorized_images = categorized;

        // Also provide a flattened `images` array for backwards compatibility
        // (many frontend components expect `property.images` as a flat list)
        const flatImages: string[] = [];
        for (const entry of categorized) {
          if (Array.isArray(entry.images)) flatImages.push(...entry.images);
        }
        p.images = flatImages;
      }
    }

    res.json({ properties });
  } catch (e) {
    res.status(500).json({ error: 'failed to load properties' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const rows = await pool.query('SELECT * FROM properties WHERE id = $1 LIMIT 1', [id]);
    if (rows.rows.length === 0) return res.status(404).json({ error: 'not found' });
    
    const property = rows.rows[0];
    
    // Build categorized_images from property_images table if needed
    let categorizedImages = property.categorized_images;
    
    // Check if categorized_images is empty, null, or needs to be built from property_images
    if (!categorizedImages || 
        (Array.isArray(categorizedImages) && categorizedImages.length === 0) ||
        (typeof categorizedImages === 'object' && Object.keys(categorizedImages).length === 0)) {
      
      // Fetch images from property_images table
      const imageRows = await pool.query(
        'SELECT category, image_url FROM property_images WHERE property_id = $1 AND (is_active IS NULL OR is_active = true) ORDER BY sort_order, id',
        [id]
      );
      
      // Build categorized structure
      const categorized: Record<string, string[]> = {};
      for (const img of imageRows.rows) {
        const category = img.category || 'Gallery';
        if (!categorized[category]) {
          categorized[category] = [];
        }
        categorized[category].push(img.image_url);
      }
      
      // Convert to array format expected by CompactGallery
      categorizedImages = Object.entries(categorized).map(([category, images]) => ({
        category,
        images
      }));
    } else if (typeof categorizedImages === 'object' && !Array.isArray(categorizedImages)) {
      // Convert object format to array format
      categorizedImages = Object.entries(categorizedImages).map(([category, images]) => ({
        category,
        images: Array.isArray(images) ? images : []
      }));
    } else if (Array.isArray(categorizedImages)) {
      // Ensure each item has the correct structure
      categorizedImages = categorizedImages.map((item: any) => {
        if (typeof item === 'object' && item !== null) {
          if (item.category && Array.isArray(item.images)) {
            return item;
          } else if (typeof item === 'object') {
            // Handle case where item might be an object with category as key
            const entries = Object.entries(item);
            if (entries.length > 0) {
              const [category, images] = entries[0];
              return {
                category,
                images: Array.isArray(images) ? images : []
              };
            }
          }
        }
        return null;
      }).filter((item: any) => item !== null);
    }
    
    // Update property with processed categorized_images
    property.categorized_images = categorizedImages;
    
    res.json(property);
  } catch (e) {
    console.error('Error fetching property:', e);
    res.status(500).json({ error: 'failed to load property' });
  }
});

router.get('/:id/images', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const rows = await pool.query('SELECT id, category, image_url FROM property_images WHERE property_id = $1 ORDER BY id', [id]);
    res.json({ images: rows.rows });
  } catch (e) {
    res.status(500).json({ error: 'failed to load images' });
  }
});

export default router;


