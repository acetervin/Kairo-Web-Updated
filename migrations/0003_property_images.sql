-- Migration: Create property_images table for categorized images
CREATE TABLE property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  category TEXT NOT NULL,
  image_url TEXT NOT NULL
);
