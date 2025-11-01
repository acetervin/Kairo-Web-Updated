import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

if (!connectionString) {
  console.error('DATABASE_URL or DB_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function initAdminUser() {
  try {
    console.log('Initializing admin user...');

    // Create the admin_users table if it doesn't exist
    await pool.query(`
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
    `);

    console.log('Table created/verified.');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
    `);

    // Hash the default password
    const defaultPassword = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // Insert or update the default admin user
    const result = await pool.query(
      `INSERT INTO admin_users (username, password_hash, name, email, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) 
       DO UPDATE SET 
         password_hash = EXCLUDED.password_hash,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, username, name, email, role`,
      ['admin', passwordHash, 'Administrator', 'admin@kairokenya.com', 'super_admin']
    );

    console.log('✅ Admin user initialized successfully:');
    console.log(result.rows[0]);
    console.log('\nDefault credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\n⚠️  Please change these credentials after first login!\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing admin user:', error);
    await pool.end();
    process.exit(1);
  }
}

initAdminUser();

