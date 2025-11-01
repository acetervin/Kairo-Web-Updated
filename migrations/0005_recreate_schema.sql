-- Drop existing tables if they exist
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS calendar_sync CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- Create properties table
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  main_image_url TEXT,
  gallery_image_url TEXT,
  images TEXT[],
  categorized_images JSONB NOT NULL DEFAULT '[]',
  amenities TEXT[] NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  removed_at TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in TIMESTAMP NOT NULL,
  check_out TIMESTAMP NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',
  source TEXT DEFAULT 'direct',
  external_booking_id TEXT,
  notes TEXT,
  guest_count INTEGER NOT NULL,
  adults INTEGER NOT NULL,
  children INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  removed_at TIMESTAMP
);

-- Create calendar_sync table
CREATE TABLE calendar_sync (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) NOT NULL,
  platform TEXT NOT NULL,
  external_calendar_url TEXT,
  last_sync_at TIMESTAMP,
  sync_status TEXT DEFAULT 'pending',
  sync_errors TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blocked_dates table
CREATE TABLE blocked_dates (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  reason TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  external_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create contact_messages table
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_interest TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  removed_at TIMESTAMP
);