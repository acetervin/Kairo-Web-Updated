import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

if (!connectionString) {
  console.error('DATABASE_URL or DB_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function createAuditLogsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting audit_logs table migration...\n');
    
    // Read and apply the migration SQL file
    const migrationPath = join(__dirname, '../migrations/0107_create_audit_logs.sql');
    console.log('Reading migration file:', migrationPath);
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('Applying migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration applied successfully!\n');
    
    // Verify the table was created
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'audit_logs'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ audit_logs table exists');
    } else {
      console.error('❌ audit_logs table was not created');
      throw new Error('Table creation verification failed');
    }
    
    // Check indexes
    const indexCheck = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'audit_logs'
      ORDER BY indexname
    `);
    
    console.log(`✅ Created ${indexCheck.rows.length} indexes:`);
    indexCheck.rows.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });
    
    // Test insert to verify it works
    console.log('\n🧪 Testing insert...');
    const testInsert = await client.query(`
      INSERT INTO audit_logs (event_type, username, ip_address, success, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, event_type, created_at
    `, [
      'LOGIN_SUCCESS',
      'test_user',
      '127.0.0.1',
      true,
      JSON.stringify({ test: true })
    ]);
    
    console.log('✅ Test insert successful:', testInsert.rows[0]);
    
    // Clean up test record
    await client.query('DELETE FROM audit_logs WHERE id = $1', [testInsert.rows[0].id]);
    console.log('✅ Test record cleaned up');
    
    // Get table info
    const tableInfo = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'audit_logs'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Table structure:');
    console.table(tableInfo.rows);
    
    console.log('\n✅ Audit logs table migration completed successfully!');
    console.log('\n💡 The audit logger will now store all security events in the database.');
    console.log('   Check audit_logs table to view login attempts, user actions, etc.\n');
    
  } catch (error: any) {
    if (error.code === '42P07') {
      // Table already exists
      console.log('⚠️  audit_logs table already exists. Skipping migration.');
      console.log('   If you want to recreate it, drop the table first.\n');
    } else {
      console.error('\n❌ Migration failed:', error.message);
      if (error.detail) {
        console.error('   Detail:', error.detail);
      }
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

createAuditLogsTable().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

