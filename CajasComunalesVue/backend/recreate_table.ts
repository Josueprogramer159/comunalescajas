import pool from './src/db';

(async () => {
  try {
    console.log('🗑️  Eliminando tabla registro_aportes si existe...');
    await pool.query('DROP TABLE IF EXISTS registro_aportes CASCADE');
    console.log('✓ Tabla eliminada');

    console.log('\n📝 Recreando tabla registro_aportes con estructura correcta...');
    await pool.query(`
      CREATE TABLE registro_aportes (
        id SERIAL PRIMARY KEY,
        socio_id INTEGER REFERENCES socios(id),
        reporte_mes INTEGER NOT NULL,
        reporte_anio INTEGER NOT NULL,
        socio_nombre VARCHAR(255),
        saldo_actual DECIMAL(10, 2) DEFAULT 0,
        deposito DECIMAL(10, 2) DEFAULT 0,
        aporte_inicial DECIMAL(10, 2) DEFAULT 0,
        retiro DECIMAL(10, 2) DEFAULT 0,
        saldo_ahorros DECIMAL(10, 2) DEFAULT 0,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla recreada correctamente');

    console.log('\n📋 Verificando estructura de la tabla...');
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registro_aportes' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nColumnas en tabla registro_aportes:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name}: ${row.data_type}`);
    });

    process.exit(0);
  } catch(error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
