-- ============================================
-- Add Google Maps to Properties - Full SQL
-- ============================================

-- Step 1: Add map_url column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS map_url TEXT;

-- Step 2: Add Google Maps embed URLs for each property

-- Property ID 247: Naivasha Lakeside Retreat
UPDATE properties
SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8214748627883!2d36.37298061431382!3d-0.7893148993150658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa2d52cffb471%3A0x7b7fa0da403babc2!2sLake%20Naivasha!5e0!3m2!1sen!2ske!4v1685435408351!5m2!1sen!2ske'
WHERE id = 247;

-- Property ID 239: Padmore Residence Apartment One (Kilimani, Nairobi)
UPDATE properties
SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816896338629!2d36.780859314313205!3d-1.2921000990438953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10f5d6931cdd%3A0xc8c5be3c01403b07!2sGeorge%20Padmore%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1730288000000!5m2!1sen!2ske'
WHERE id = 239;

-- Property ID 240: Padmore Residence Apartment Two (Kilimani, Nairobi)
UPDATE properties
SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816896338629!2d36.780859314313205!3d-1.2921000990438953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10f5d6931cdd%3A0xc8c5be3c01403b07!2sGeorge%20Padmore%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1730288000000!5m2!1sen!2ske'
WHERE id = 240;

-- Property ID 241: Ocean Paradise Villa (Diani Beach)
UPDATE properties
SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63752.56080982412!2d39.56035407910155!3d-4.287446200000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x184013b265fd0b1f%3A0xbdbbbf4f32f9578d!2sDiani%20Beach!5e0!3m2!1sen!2ske!4v1730288100000!5m2!1sen!2ske'
WHERE id = 241;

-- Step 3: Verify the changes
SELECT id, name, 
  CASE 
    WHEN map_url IS NOT NULL THEN 'Map Added ✓'
    ELSE 'No Map'
  END as map_status,
  LEFT(map_url, 50) as map_url_preview
FROM properties
WHERE id IN (247, 239, 240, 241)
ORDER BY id;

