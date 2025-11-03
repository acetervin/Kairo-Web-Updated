-- Dev migration: create properties, bookings, blocked_dates, calendar_sync, contact_messages
-- Run this only in development or with caution in production.

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  price_per_night NUMERIC(10,2) NOT NULL,
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  main_image_url TEXT,
  gallery_image_url TEXT,
  images TEXT[],
  categorized_images JSONB NOT NULL DEFAULT '[]',
  amenities TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  removed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in TIMESTAMP NOT NULL,
  check_out TIMESTAMP NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  removed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendar_sync (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id),
  platform TEXT NOT NULL,
  external_calendar_url TEXT,
  last_sync_at TIMESTAMP,
  sync_status TEXT DEFAULT 'pending',
  sync_errors TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  reason TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  external_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_interest TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  removed_at TIMESTAMP
);
