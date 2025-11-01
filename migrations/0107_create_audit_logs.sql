-- Create audit_logs table for security event tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  username VARCHAR(255),
  ip_address VARCHAR(45), -- IPv6 can be up to 45 characters
  user_agent TEXT,
  details JSONB,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_username ON audit_logs(username);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- Add comment to table
COMMENT ON TABLE audit_logs IS 'Stores security and administrative events for audit trail';
COMMENT ON COLUMN audit_logs.event_type IS 'Type of event (LOGIN_SUCCESS, LOGIN_FAILURE, etc.)';
COMMENT ON COLUMN audit_logs.details IS 'Additional event details stored as JSON';
COMMENT ON COLUMN audit_logs.success IS 'Whether the event was successful';

