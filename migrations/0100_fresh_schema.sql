-- FRESH SCHEMA (Stripe-only). Destroys existing data. Run against a NEW database.
-- Drop in dependency-safe order
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- Properties table
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  max_guests INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  main_image_url TEXT,
  images TEXT[],
  amenities TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bookings table (Stripe-only)
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in TIMESTAMP NOT NULL,
  check_out TIMESTAMP NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_method TEXT NOT NULL DEFAULT 'stripe',
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending|completed|failed
  payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|confirmed|cancelled
  guest_count INTEGER NOT NULL DEFAULT 1,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Blocked dates (idempotent on booking_id)
CREATE TABLE blocked_dates (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  reason TEXT NOT NULL, -- direct_booking|maintenance|external
  source TEXT NOT NULL DEFAULT 'direct_booking',
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  external_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Ensure one blocked_dates row per booking
ALTER TABLE blocked_dates
  ADD CONSTRAINT blocked_dates_booking_id_unique UNIQUE (booking_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_property_range ON blocked_dates(property_id, start_date, end_date) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);


