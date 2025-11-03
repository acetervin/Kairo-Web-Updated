-- Add booking_id column to blocked_dates to match application schema
ALTER TABLE blocked_dates
  ADD COLUMN booking_id INTEGER REFERENCES bookings(id);

-- NOTE: Creating an index CONCURRENTLY avoids long locks on large tables but
-- cannot run inside a transaction block. Many migration runners execute files
-- inside a transaction, so run the CONCURRENTLY index creation as a separate
-- step after the ALTER TABLE has completed.

-- Safe index creation (run this separately, outside any transaction):
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocked_dates_booking_id ON blocked_dates(booking_id);

-- Example (psql) to run in two steps from PowerShell:
-- 1) Apply the ALTER TABLE (this file) normally with your migration runner or:
--    psql "<connection-string>" -f .\migrations\0006_add_booking_id_to_blocked_dates.sql
-- 2) Then run the CONCURRENTLY index creation separately:
--    psql "<connection-string>" -c "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocked_dates_booking_id ON blocked_dates(booking_id);"

-- If you are in a small/dev environment and cannot run CONCURRENTLY, you can
-- create the index normally (may lock the table briefly):
-- CREATE INDEX IF NOT EXISTS idx_blocked_dates_booking_id ON blocked_dates(booking_id);
