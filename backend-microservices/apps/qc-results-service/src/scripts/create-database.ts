import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
  });

  try {
    await dataSource.initialize();
    const databaseName = process.env.DATABASE_NAME || 'qc_results_db';
    
    // Check if database exists
    const result = await dataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [databaseName]
    );

    if (result.length === 0) {
      await dataSource.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`Database "${databaseName}" created successfully`);
    } else {
      console.log(`Database "${databaseName}" already exists`);
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
}

createDatabase();

