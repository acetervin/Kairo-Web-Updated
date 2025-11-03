ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS categorized_images JSONB NOT NULL DEFAULT '[]';


