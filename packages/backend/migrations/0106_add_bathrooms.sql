-- Add bathrooms column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms INTEGER;

