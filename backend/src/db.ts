import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

const { Pool } = pkg;

try {
  dotenv.config({
    path: path.join(process.cwd(), '.env')
  });
} catch {
  // En producción, Render usa variables de entorno
}

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DB;

if (!connectionString) {
  throw new Error(
    'No está configurada la variable DATABASE_URL ni DB'
  );
}

console.log(
  'Conexión PostgreSQL configurada:',
  connectionString ? 'Sí' : 'No'
);

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false
});

pool.on('connect', () => {
  console.log('✓ Conectado a PostgreSQL');
});

pool.on('error', (error) => {
  console.error('Error inesperado en PostgreSQL:', error);
});

export default pool;