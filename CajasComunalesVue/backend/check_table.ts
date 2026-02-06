import pool from './src/db';

(async () => {
  try {
    console.log('Verificando estructura de tabla registro_aportes...');
    
    // Verificar las columnas
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'registro_aportes' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nColumnas en tabla registro_aportes:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Verificar específicamente si existe deposito
    const depositoExists = result.rows.some(row => row.column_name === 'deposito');
    console.log(`\n✓ Columna 'deposito' ${depositoExists ? 'EXISTE' : 'NO EXISTE'}`);
    
    // Si no existe, intentar agregarla
    if (!depositoExists) {
      console.log('\nAgregando columna deposito...');
      await pool.query(`
        ALTER TABLE registro_aportes 
        ADD COLUMN deposito DECIMAL(10, 2) DEFAULT 0
      `);
      console.log('✓ Columna deposito agregada exitosamente');
    }
    
    process.exit(0);
  } catch(error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
