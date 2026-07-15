
-- Crear tabla de administradores
CREATE TABLE IF NOT EXISTS administradores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de directiva
CREATE TABLE IF NOT EXISTS directiva (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de caja general
CREATE TABLE IF NOT EXISTS caja_general (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  descripcion TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de caja chica
CREATE TABLE IF NOT EXISTS caja_chica (
  id SERIAL PRIMARY KEY,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  responsable VARCHAR(255) NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de socios
CREATE TABLE IF NOT EXISTS socios (
  id SERIAL PRIMARY KEY,
  numero_socio INTEGER NOT NULL,
  nombre_completo VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  mes_ingreso VARCHAR(20),
  ahorro_mensual DECIMAL(10, 2) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de aportes
CREATE TABLE IF NOT EXISTS aportes (
  id SERIAL PRIMARY KEY,
  socio_id INTEGER REFERENCES socios(id),
  monto DECIMAL(10, 2) NOT NULL,
  mes VARCHAR(20) NOT NULL,
  anio INTEGER NOT NULL,
  estado VARCHAR(20) DEFAULT 'Pendiente',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de préstamos
CREATE TABLE IF NOT EXISTS prestamos (
  id SERIAL PRIMARY KEY,
  socio_id INTEGER REFERENCES socios(id),
  prestatario VARCHAR(255) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  plazo INTEGER NOT NULL,
  interes DECIMAL(5, 2) DEFAULT 5.0,
  descripcion TEXT,
  pagado BOOLEAN DEFAULT FALSE,
  fecha DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Actualizar tabla caja_chica con nueva estructura
DROP TABLE IF EXISTS caja_chica;
CREATE TABLE IF NOT EXISTS caja_chica (
  id SERIAL PRIMARY KEY,
  reunion INTEGER DEFAULT 1,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  ingresos DECIMAL(10, 2) DEFAULT 0,
  egresos DECIMAL(10, 2) DEFAULT 0,
  saldo DECIMAL(10, 2) DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de registro_aportes
CREATE TABLE IF NOT EXISTS registro_aportes (
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

-- Crear tabla de registro_prestamos
CREATE TABLE IF NOT EXISTS registro_prestamos (
  id SERIAL PRIMARY KEY,
  mes VARCHAR(20) DEFAULT 'SIN MES',
  socio VARCHAR(255) NOT NULL,
  concedido DECIMAL(10, 2) DEFAULT 0,
  interes DECIMAL(10, 2) DEFAULT 0,
  total_adeudado DECIMAL(10, 2) DEFAULT 0,
  pago_prestamo DECIMAL(10, 2) DEFAULT 0,
  mora DECIMAL(10, 2) DEFAULT 0,
  saldo DECIMAL(10, 2) DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de libretas_prestamos
CREATE TABLE IF NOT EXISTS libretas_prestamos (
  id SERIAL PRIMARY KEY,
  socio_id INTEGER REFERENCES socios(id),
  socio_nombre VARCHAR(255) NOT NULL,
  fecha_inicio DATE DEFAULT CURRENT_DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- La tabla administradores se mantiene vacía. El primer registro se realiza a través de Registrarse.vue

-- Insertar datos de ejemplo de directiva
INSERT INTO directiva (nombre, cargo, telefono) VALUES
('Juan García', 'Presidente', '555-0101'),
('María López', 'Tesorera', '555-0102'),
('Carlos Rodríguez', 'Secretario', '555-0103')
ON CONFLICT DO NOTHING;

-- Crear tabla de balance_general
CREATE TABLE IF NOT EXISTS balance_general (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  activo_circulante DECIMAL(15, 2) DEFAULT 0,
  activo_fijo DECIMAL(15, 2) DEFAULT 0,
  pasivo_corto_plazo DECIMAL(15, 2) DEFAULT 0,
  pasivo_largo_plazo DECIMAL(15, 2) DEFAULT 0,
  patrimonio_neto DECIMAL(15, 2) DEFAULT 0,
  total_activo DECIMAL(15, 2) DEFAULT 0,
  total_pasivo DECIMAL(15, 2) DEFAULT 0,
  total_patrimonio DECIMAL(15, 2) DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de cuerpo_normativo
CREATE TABLE IF NOT EXISTS cuerpo_normativo (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  contenido TEXT,
  tipo_documento VARCHAR(100) NOT NULL,
  version VARCHAR(50),
  fecha_vigencia DATE,
  archivo_url VARCHAR(500),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
