import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

console.log('\n╔════════════════════════════════════════╗');
console.log('║  DIAGNÓSTICO DE CONEXIÓN POSTGRESQL   ║');
console.log('╚════════════════════════════════════════╝\n');

// Mostrar configuración
console.log('Configuración cargada:');
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   Puerto: ${process.env.DB_PORT}`);
console.log(`   BD: ${process.env.DB_NAME}`);
console.log(`   Usuario: ${process.env.DB_USER}`);
console.log(`   Contraseña: ${process.env.DB_PASSWORD ? '***' : '(vacía)'}\n`);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test 1: Conexión básica
console.log('Test 1: Conectando a PostgreSQL...');
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log(`   ERROR: ${err.message}\n`);
  } else {
    console.log(`   Conexión exitosa a PostgreSQL\n`);
  }
  
  // Test 2: Verificar tabla administradores
  console.log('Test 2: Verificando tabla administradores...');
  pool.query(
    `SELECT COUNT(*) as total FROM administradores`,
    (err, res) => {
      if (err) {
        console.log(`   ERROR: ${err.message}`);
        console.log(`   Solución: Ejecuta: psql -U postgres -d cajasComunales -f backend/init_db.sql\n`);
      } else {
        const count = res.rows[0].total;
        console.log(`   Tabla encontrada con ${count} registros\n`);
        
        if (count === 0) {
          console.log('   ADVERTENCIA: La tabla está vacía');
          console.log('   Solución: Ejecuta el script init_db.sql\n');
        } else {
          // Test 3: Mostrar usuarios
          console.log('Test 3: Listando usuarios registrados...');
          pool.query(
            `SELECT id, nombre, email FROM administradores`,
            (err, res) => {
              if (!err) {
                console.log('   Usuarios encontrados:');
                res.rows.forEach(user => {
                  console.log(`      • ${user.nombre} (${user.email})`);
                });
              }
              console.log('\nTODOS LOS TESTS PASARON\n');
              console.log('Para usar la aplicación:');
              console.log('   1. Abre: http://localhost:5173');
              console.log('   2. Email: juan@example.com');
              console.log('   3. Contraseña: password123\n');
              process.exit(0);
            }
          );
        }
      }
    }
  );
});

// Timeout de seguridad
setTimeout(() => {
  console.log('TIMEOUT: No se pudo conectar a PostgreSQL\n');
  console.log('Verifica que:');
  console.log('1. PostgreSQL esté corriendo');
  console.log('2. Los valores en backend/.env sean correctos');
  console.log('3. La base de datos "cajasComunales" exista\n');
  process.exit(1);
}, 5000);
