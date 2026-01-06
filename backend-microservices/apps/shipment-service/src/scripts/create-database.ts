import * as dotenv from 'dotenv';
import { Client, ClientConfig } from 'pg';

dotenv.config();

// Get database configuration from environment
const host = process.env.DATABASE_HOST;
const port = parseInt(process.env.DATABASE_PORT ?? '5432', 10);
const username = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;

async function createDatabase(): Promise<void> {
  // Connect to PostgreSQL's default 'postgres' database
  const clientConfig: ClientConfig = {
    host,
    port,
    user: username,
    password,
    database: 'postgres', // Connect to default database
  };

  const client = new Client(clientConfig);

  try {
    await client.connect();
    console.log(`🔌 Connected to PostgreSQL server at ${host}:${port}`);
    
    // Check if database exists
    const result = await client.query<{ exists: number }>(
      `SELECT 1 as exists FROM pg_database WHERE datname = $1`,
      [database]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      await client.query(`CREATE DATABASE "${database}"`);
      console.log(`✅ Database "${database}" created successfully`);
    } else {
      console.log(`ℹ️  Database "${database}" already exists`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error creating database:`, errorMessage);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
createDatabase()
  .then(() => {
    console.log('✨ Database setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create database:', error);
    process.exit(1);
  });
