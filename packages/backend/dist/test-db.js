"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverless_1 = require("@neondatabase/serverless");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function testDbConnection() {
    console.log('Attempting to connect to the database...');
    console.log('DB_URL:', process.env.DB_URL);
    const pool = new serverless_1.Pool({
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
