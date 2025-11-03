-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Insert default admin user with bcrypt hashed password 'admin123'
-- Password hash for 'admin123' with bcrypt (will be replaced with actual hash in code)
INSERT INTO admin_users (username, password_hash, name, email, role)
VALUES ('admin', '$2b$10$placeholder', 'Administrator', 'admin@kairokenya.com', 'super_admin')
ON CONFLICT (username) DO NOTHING;

