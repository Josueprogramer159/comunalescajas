-- ============================================================
-- SCRIPT COMPLETO DE INICIALIZACIÓN - CajasComunales
-- Base de datos: cajascomunales
-- Generado: 2026-06-20
-- ============================================================

-- ============================================================
-- 1. ADMINISTRADORES
-- ============================================================
CREATE TABLE IF NOT EXISTS administradores (
  id           SERIAL PRIMARY KEY,
  nombre       VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  contrasena   VARCHAR(255) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. REFRESH_TOKENS (sesiones JWT)
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          SERIAL PRIMARY KEY,
  admin_id    INTEGER      NOT NULL REFERENCES administradores(id) ON DELETE CASCADE,
  token_hash  VARCHAR(500) NOT NULL UNIQUE,
  expires_at  TIMESTAMP    NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  revoked_at  TIMESTAMP    DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_admin_id  ON refresh_tokens(admin_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ============================================================
-- 3. DIRECTIVA
-- ============================================================
CREATE TABLE IF NOT EXISTS directiva (
  id         SERIAL PRIMARY KEY,
  cargo      VARCHAR(100) NOT NULL,
  nombre     VARCHAR(255) NOT NULL,
  telefono   VARCHAR(20),
  imagen_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. SOCIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS socios (
  id                  SERIAL PRIMARY KEY,
  numero_socio        INTEGER      NOT NULL,
  nombre_completo     VARCHAR(100) NOT NULL,
  cedula              VARCHAR(20)  NOT NULL UNIQUE,
  telefono            VARCHAR(20),
  mes_ingreso         VARCHAR(20),
  ahorro_mensual      DECIMAL(10,2) NOT NULL,
  fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. APORTES
--    Columnas reales usadas por el servidor:
--    id, socio_id, monto, fecha, tipo, descripcion,
--    fecha_creacion, fecha_actualizacion
-- ============================================================
CREATE TABLE IF NOT EXISTS aportes (
  id                  SERIAL PRIMARY KEY,
  socio_id            INTEGER REFERENCES socios(id) ON DELETE CASCADE,
  monto               DECIMAL(10,2) NOT NULL,
  mes                 VARCHAR(20)   NOT NULL,
  anio                INTEGER       NOT NULL,
  tipo                VARCHAR(50)   DEFAULT 'aporte',
  descripcion         TEXT,
  estado              VARCHAR(20)   DEFAULT 'Pendiente',
  fecha               DATE          DEFAULT CURRENT_DATE,
  fecha_registro      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  fecha_creacion      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_aportes_socio_id ON aportes(socio_id);

-- ============================================================
-- 6. PRÉSTAMOS
--    Columnas reales usadas por el servidor:
--    id, socio_id, monto, interes, plazo, fecha, estado,
--    descripcion, fecha_creacion, fecha_actualizacion
-- ============================================================
CREATE TABLE IF NOT EXISTS prestamos (
  id                  SERIAL PRIMARY KEY,
  socio_id            INTEGER       REFERENCES socios(id) ON DELETE SET NULL,
  prestatario         VARCHAR(255),
  monto               DECIMAL(10,2) NOT NULL,
  plazo               INTEGER       NOT NULL,
  interes             DECIMAL(5,2)  DEFAULT 5.0,
  descripcion         TEXT,
  estado              VARCHAR(20)   DEFAULT 'activo',
  pagado              BOOLEAN       DEFAULT FALSE,
  fecha               DATE          DEFAULT CURRENT_DATE,
  fecha_creacion      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prestamos_socio_id ON prestamos(socio_id);

-- ============================================================
-- 7. CAJA GENERAL
--    Columnas reales usadas por el servidor:
--    id, concepto, monto, tipo, fecha, responsable,
--    descripcion, fecha_creacion, fecha_actualizacion
-- ============================================================
CREATE TABLE IF NOT EXISTS caja_general (
  id                  SERIAL PRIMARY KEY,
  concepto            VARCHAR(255),
  tipo                VARCHAR(20)   NOT NULL,          -- 'ingreso' | 'egreso'
  monto               DECIMAL(10,2) NOT NULL,
  responsable         VARCHAR(255),
  descripcion         TEXT,
  fecha               DATE          DEFAULT CURRENT_DATE,
  fecha_creacion      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. CAJA CHICA
-- ============================================================
CREATE TABLE IF NOT EXISTS caja_chica (
  id                  SERIAL PRIMARY KEY,
  reunion             INTEGER       DEFAULT 1,
  fecha               DATE          NOT NULL,
  descripcion         TEXT          NOT NULL,
  ingresos            DECIMAL(10,2) DEFAULT 0,
  egresos             DECIMAL(10,2) DEFAULT 0,
  saldo               DECIMAL(10,2) DEFAULT 0,
  fecha_creacion      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 9. REGISTRO_APORTES (reporte mensual de ahorros por socio)
-- ============================================================
CREATE TABLE IF NOT EXISTS registro_aportes (
  id             SERIAL PRIMARY KEY,
  socio_id       INTEGER       REFERENCES socios(id) ON DELETE SET NULL,
  reporte_mes    INTEGER       NOT NULL,
  reporte_anio   INTEGER       NOT NULL,
  socio_nombre   VARCHAR(255),
  saldo_actual   DECIMAL(10,2) DEFAULT 0,
  deposito       DECIMAL(10,2) DEFAULT 0,
  aporte_inicial DECIMAL(10,2) DEFAULT 0,
  retiro         DECIMAL(10,2) DEFAULT 0,
  saldo_ahorros  DECIMAL(10,2) DEFAULT 0,
  fecha_creacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_registro_aportes_socio_id    ON registro_aportes(socio_id);
CREATE INDEX IF NOT EXISTS idx_registro_aportes_mes_anio    ON registro_aportes(reporte_mes, reporte_anio);

-- ============================================================
-- 10. REGISTRO_PRESTAMOS (reporte mensual de préstamos)
-- ============================================================
CREATE TABLE IF NOT EXISTS registro_prestamos (
  id                  SERIAL PRIMARY KEY,
  mes                 VARCHAR(20)   DEFAULT 'SIN MES',
  anio                VARCHAR(4)    DEFAULT '2026',
  socio               VARCHAR(255)  NOT NULL,
  concedido           DECIMAL(10,2) DEFAULT 0,
  interes             DECIMAL(10,2) DEFAULT 0,
  total_adeudado      DECIMAL(10,2) DEFAULT 0,
  pago_prestamo       DECIMAL(10,2) DEFAULT 0,
  mora                DECIMAL(10,2) DEFAULT 0,
  saldo               DECIMAL(10,2) DEFAULT 0,
  fecha_creacion      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 11. LIBRETAS_PRESTAMOS
-- ============================================================
CREATE TABLE IF NOT EXISTS libretas_prestamos (
  id             SERIAL PRIMARY KEY,
  socio_id       INTEGER      REFERENCES socios(id) ON DELETE CASCADE,
  socio_nombre   VARCHAR(255) NOT NULL,
  fecha_inicio   DATE         DEFAULT CURRENT_DATE,
  fecha_creacion TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_libretas_prestamos_socio_id ON libretas_prestamos(socio_id);

-- ============================================================
-- 12. BALANCE GENERAL
--    Columnas reales usadas por el servidor:
--    id, socio_id, aporte_inicial, saldo_ahorros, retiro,
--    interes_generado, fecha_creacion, fecha_actualizacion
-- ============================================================
CREATE TABLE IF NOT EXISTS balance_general (
  id                  SERIAL PRIMARY KEY,
  socio_id            INTEGER       REFERENCES socios(id) ON DELETE SET NULL,
  fecha               DATE          DEFAULT CURRENT_DATE,
  -- Campos del reporte de ahorros
  aporte_inicial      DECIMAL(15,2) DEFAULT 0,
  saldo_ahorros       DECIMAL(15,2) DEFAULT 0,
  retiro              DECIMAL(15,2) DEFAULT 0,
  interes_generado    DECIMAL(15,2) DEFAULT 0,
  -- Campos contables (activos/pasivos)
  activo_circulante   DECIMAL(15,2) DEFAULT 0,
  activo_fijo         DECIMAL(15,2) DEFAULT 0,
  pasivo_corto_plazo  DECIMAL(15,2) DEFAULT 0,
  pasivo_largo_plazo  DECIMAL(15,2) DEFAULT 0,
  patrimonio_neto     DECIMAL(15,2) DEFAULT 0,
  total_activo        DECIMAL(15,2) DEFAULT 0,
  total_pasivo        DECIMAL(15,2) DEFAULT 0,
  total_patrimonio    DECIMAL(15,2) DEFAULT 0,
  fecha_creacion      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_balance_general_socio_id ON balance_general(socio_id);

-- ============================================================
-- 13. CUERPO_NORMATIVO
-- ============================================================
CREATE TABLE IF NOT EXISTS cuerpo_normativo (
  id                  SERIAL PRIMARY KEY,
  titulo              VARCHAR(255) NOT NULL,
  descripcion         TEXT,
  contenido           TEXT,
  tipo_documento      VARCHAR(100) NOT NULL,   -- 'estatuto', 'reglamento', 'norma', etc.
  version             VARCHAR(50),
  fecha_vigencia      DATE,
  archivo_url         VARCHAR(500),
  fecha_creacion      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 14. NORMATIVA (documentos con archivos adjuntos)
-- ============================================================
CREATE TABLE IF NOT EXISTS normativa (
  id               SERIAL PRIMARY KEY,
  titulo           VARCHAR(255) NOT NULL,
  descripcion      TEXT,
  tipo_documento   VARCHAR(100) NOT NULL,
  archivo_url      VARCHAR(500),
  archivo_original VARCHAR(255),          -- nombre original del archivo
  archivo_hash     VARCHAR(128),          -- hash para verificar integridad
  tamano_archivo   INTEGER,               -- tamaño en bytes
  usuario_creador  VARCHAR(100),
  fecha_creacion   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo           BOOLEAN      DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_normativa_tipo_documento ON normativa(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_normativa_activo         ON normativa(activo);
CREATE INDEX IF NOT EXISTS idx_normativa_fecha_creacion ON normativa(fecha_creacion);
