import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();
async function testDbConnection() {
    console.log('Attempting to connect to the database...');
    console.log('DB_URL:', process.env.DB_URL);
    const pool = new Pool({
        connectionString: process.env.DB_URL,
    });
    try {
        const client = await pool.connect();
        console.log('Successfully connected to the database!');
        await client.release();
    }
    catch (error) {
        console.error('Failed to connect to the database:', error);
    }
}
testDbConnection();
