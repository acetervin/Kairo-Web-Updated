-- Add updated_at column to blocked_dates table to match application schema
ALTER TABLE blocked_dates
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


