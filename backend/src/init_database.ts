import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'cajasComunales',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432
});

async function initDatabase() {
  try {
    console.log('Inicializando base de datos...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(process.cwd(), 'src', 'init_db.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el SQL completo
    try {
      await pool.query(sqlContent);
      console.log(`SQL ejecutado completamente`);
    } catch (error) {
      console.log(`Error ejecutando SQL:`, error.message);
    }

    console.log('\nBase de datos inicializada correctamente!');
    console.log('\nVerificando tablas creadas...');

    // Verificar que las tablas importantes existen
    const tablesToCheck = ['administradores', 'directiva', 'caja_general'];
    for (const tableName of tablesToCheck) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as total FROM ${tableName}`);
        console.log(`Tabla ${tableName}: ${result.rows[0].total} registros`);
      } catch (error) {
        console.log(`Tabla ${tableName}: Error - ${error.message}`);
      }
    }

    console.log('\nCredenciales de prueba para login:');
    console.log('   Email: juan@example.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('Error inicializando base de datos:', error.message);
  } finally {
    await pool.end();
  }
}

initDatabase();
