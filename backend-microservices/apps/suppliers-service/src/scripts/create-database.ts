import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env file
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function createDatabase() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    const dbName = process.env.DATABASE_NAME || 'pharma_suppliersdb';

    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully`);
    } else {
      console.log(`ℹ️  Database "${dbName}" already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();

