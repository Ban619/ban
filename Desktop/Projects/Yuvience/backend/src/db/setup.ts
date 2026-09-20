import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  // Connect to default postgres database
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // Connect to default postgres DB
  });

  const client = await pool.connect();
  try {
    console.log('Dropping existing Yuvience database if exists...');
    await client.query('DROP DATABASE IF EXISTS "Yuvience"');
    console.log('✅ Database dropped');

    console.log('Creating Yuvience database...');
    await client.query('CREATE DATABASE "Yuvience"');
    console.log('✅ Yuvience database created successfully!');
  } catch (error) {
    console.error('Setup error:', error);
  } finally {
    await client.release();
    await pool.end();
  }
}

setupDatabase().then(() => process.exit(0));
