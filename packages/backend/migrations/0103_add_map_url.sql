-- Add map_url column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS map_url TEXT;

