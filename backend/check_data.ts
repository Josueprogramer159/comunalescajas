import pool from './src/db';

(async () => {
  try {
    console.log('📊 Último registro guardado:');
    const result = await pool.query('SELECT * FROM registro_aportes ORDER BY fecha_creacion DESC LIMIT 1');
    if (result.rows.length > 0) {
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('No hay registros');
    }
    process.exit(0);
  } catch(error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
