import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || 'cajasComunales',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
});

async function migrate() {
  try {
    console.log('🔄 Iniciando migración...');
    
    // Verificar si la columna tiene el nombre antiguo
    const checkOldColumn = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'administradores' 
      AND column_name IN ('contraseña', 'contraseÃ±a', 'contrasena')
    `);
    
    console.log('Columnas encontradas:', checkOldColumn.rows);
    
    if (checkOldColumn.rows.length > 0) {
      const oldName = checkOldColumn.rows[0].column_name;
      console.log(`📝 Renombrando columna ${oldName} a contrasena...`);
      
      await pool.query(`
        ALTER TABLE administradores 
        RENAME COLUMN "${oldName}" TO contrasena
      `);
      
      console.log('✅ Columna renombrada exitosamente');
    } else {
      console.log('✅ La columna contrasena ya existe');
    }
    
    // Verificar estructura final
    const finalCheck = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'administradores'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estructura final de administradores:');
    finalCheck.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    await pool.end();
    console.log('\n✨ Migración completada!');
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
}

migrate();
