-- Migration: Backup and drop properties.images column
-- Creates a small backup table (if not present), copies any non-null images arrays
-- then drops the images column from properties.

BEGIN;

-- Create a backup table to preserve the original array data (idempotent)
CREATE TABLE IF NOT EXISTS properties_images_backup (
  property_id integer PRIMARY KEY,
  images text[]
);

-- Insert any images that aren't already backed up
INSERT INTO properties_images_backup (property_id, images)
SELECT p.id, p.images
FROM properties p
WHERE p.images IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM properties_images_backup b WHERE b.property_id = p.id);

-- Drop the legacy images column
ALTER TABLE properties DROP COLUMN IF EXISTS images;

COMMIT;
