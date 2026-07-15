import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';

// Try to load .env file if it exists (for local development), but don't fail if it doesn't
try {
  dotenv.config({ path: path.join(process.cwd(), '.env') });
} catch (error) {
  // Ignore errors if .env file doesn't exist (production uses Docker env vars)
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  database: process.env.DB_NAME || 'cajasComunales',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
});

export default pool;
