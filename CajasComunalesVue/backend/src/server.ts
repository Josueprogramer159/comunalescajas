import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import pool from './db';
import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  validateRefreshTokenInDB,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  cleanupExpiredTokens,
  TokenPayload
} from './auth';

// Función para verificar que las tablas existen
async function initializeDatabase(): Promise<void> {
  try {
    console.log('Verificando base de datos...');

    // Verificar si las tablas existen
    const tables = [
      'administradores', 'directiva', 'caja_general', 'caja_chica', 'socios',
      'aportes', 'prestamos', 'registro_aportes',
      'registro_prestamos', 'libretas_prestamos', 'balance_general',
      'cuerpo_normativo'
    ];

    let missingTables = [];
    for (const table of tables) {
      try {
        await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`Tabla ${table} existe`);
      } catch (error) {
        console.log(`Tabla ${table} no existe`);
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      console.log(`Tablas faltantes: ${missingTables.join(', ')}`);
      console.log('Ejecutando inicializacion de base de datos...');
      const initPath = path.join(process.cwd(), 'src', 'init_db.sql');
      const sqlContent = fs.readFileSync(initPath, 'utf8');
      await pool.query(sqlContent);
      console.log('Base de datos inicializada completamente');
    } else {
      console.log('Todas las tablas existen. Base de datos lista.');
      
      // Verificar y agregar la columna deposito a registro_aportes si no existe
      try {
        // Primero verificar si la columna existe
        const columnCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'registro_aportes' AND column_name = 'deposito'
          );
        `);
        
        if (!columnCheck.rows[0].exists) {
          console.log('Agregando columna deposito a tabla registro_aportes...');
          await pool.query(`
            ALTER TABLE registro_aportes 
            ADD COLUMN deposito DECIMAL(10, 2) DEFAULT 0;
          `);
          console.log('✓ Columna deposito agregada exitosamente');
        } else {
          console.log('✓ Columna deposito ya existe en tabla registro_aportes');
        }
      } catch (error) {
        console.error('Error verificando/agregando columna deposito:', error.message);
      }
    }
  } catch (error) {
    console.error('Error verificando base de datos:', error.message);
  }
}

// Configuración de multer para subir archivos
// Usar ruta relativa para desarrollo, /app para producción Docker
const uploadsPath = process.env.NODE_ENV === 'production' 
  ? path.resolve('/app', 'uploads')
  : path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `directiva_${timestamp}${extension}`);
  }
});

// Configuración específica para imagen de directiva (siempre sobrescribe)
const directivaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `directiva-image${extension}`);
  }
});

const upload = multer({ storage: storage });
const uploadDirectiva = multer({ storage: directivaStorage });

// Crear directorio de uploads si no existe
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✓ Directorio de uploads creado en:', uploadsPath);
  } else {
    console.log('✓ Directorio de uploads ya existe:', uploadsPath);
  }
  // Verificar permisos
  fs.accessSync(uploadsPath, fs.constants.W_OK);
  console.log('✓ Permisos de escritura verificados:', uploadsPath);
} catch (error) {
  console.error('❌ Error con directorio de uploads:', error.message);
}

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Allow non-browser requests (curl, Postman) or same-origin
    if (!origin) return callback(null, true);
    // If no ALLOWED_ORIGINS configured, allow all (useful for local dev)
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true
};

app.use(cors(corsOptions));
// Aumentar límite de tamaño para JSON (50MB) y formularios con archivos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Servir archivos estáticos desde la carpeta uploads con CORS
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Database connection check endpoint
app.get('/db-check', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as version')
    res.status(200).json({
      status: 'connected',
      database: process.env.DB_NAME,
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version
    })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    })
  }
})

// Endpoint para asegurar que la columna deposito existe
app.post('/api/setup/deposito-column', async (req: Request, res: Response) => {
  try {
    console.log('🔧 Intentando agregar columna deposito...')
    
    // Primero verificar si la columna ya existe
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'registro_aportes' AND column_name = 'deposito'
    `)
    
    if (checkResult.rows.length > 0) {
      console.log('✅ La columna deposito ya existe')
      return res.json({
        success: true,
        message: 'La columna deposito ya existe en registro_aportes',
        alreadyExists: true
      })
    }
    
    // Si no existe, agregarla
    await pool.query(`
      ALTER TABLE registro_aportes 
      ADD COLUMN deposito DECIMAL(10, 2) DEFAULT 0
    `)
    
    console.log('✅ Columna deposito agregada exitosamente')
    
    // Verificar que se agregó correctamente
    const verifyResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'registro_aportes' AND column_name = 'deposito'
    `)
    
    res.json({
      success: true,
      message: 'Columna deposito agregada correctamente a registro_aportes',
      verified: verifyResult.rows.length > 0
    })
  } catch (error) {
    console.error('❌ Error al agregar columna deposito:', error.message)
    console.error('❌ Stack trace:', error.stack)
    res.status(500).json({
      success: false,
      message: `Error al agregar columna deposito: ${error.message}`
    })
  }
})

// Endpoint para verificar estructura de la tabla
app.get('/api/setup/check-table', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'registro_aportes' 
      ORDER BY ordinal_position
    `)
    
    res.json({
      success: true,
      columns: result.rows
    })
  } catch (error) {
    console.error('Error verificando tabla:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error verificando tabla'
    })
  }
})

// ========== MIDDLEWARE DE AUTENTICACIÓN ==========

/**
 * Interfaz extendida de Request con usuario
 */
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware para validar JWT en el header Authorization
 */
function verifyToken(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
      return;
    }

    const token = authHeader.substring(7);
    const user = verifyAccessToken(token);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando token'
    });
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ========== RATE LIMITER ==========

/**
 * Rate limiter para login: 5 intentos por 15 minutos
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos
  message: {
    success: false,
    message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true, // Devuelve info del rate limit en `RateLimit-*` headers
  legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
  skip: (req) => {
    // Opcional: saltar rate limit para ciertos IPs (ej: localhost en desarrollo)
    return process.env.NODE_ENV !== 'production' && req.ip === '::1';
  },
  keyGenerator: (req) => {
    // Usar IP del cliente o email si está disponible
    return (req.body?.email || req.ip || 'unknown') as string;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
      retryAfter: req.rateLimit?.resetTime
    });
  }
});

// POST /api/register - Registro de nuevos administradores (solo uno permitido)
app.post('/api/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre }: { email: string; password: string; nombre: string } = req.body

    console.log('📝 Intento de registro:', { email, nombre });

    if (!email || !password || !nombre) {
      console.log('❌ Campos faltantes');
      res.status(400).json({
        success: false,
        message: 'Email, contrasena y nombre son requeridos'
      })
      return
    }

    // Verificar si ya existe algún administrador registrado
    const existingAdmins = await pool.query(
      'SELECT COUNT(*) as count FROM administradores'
    )

    console.log('👤 Administradores existentes:', existingAdmins.rows[0].count);

    if (parseInt(existingAdmins.rows[0].count) > 0) {
      console.log('❌ Ya existe administrador registrado');
      res.status(400).json({
        success: false,
        message: 'Ya existe un administrador registrado. No se permiten más registros.'
      })
      return
    }

    // Verificar si el email ya existe
    const existingUser = await pool.query(
      'SELECT id FROM administradores WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      console.log('❌ Email ya existe');
      res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      })
      return
    }

    // Insertar nuevo administrador
    console.log('💾 Insertando nuevo administrador...');
    const result = await pool.query(
      'INSERT INTO administradores (nombre, email, contrasena) VALUES ($1, $2, $3) RETURNING id, nombre, email',
      [nombre, email, password]
    )

    const newUser = result.rows[0]

    console.log('✅ Administrador registrado:', { id: newUser.id, nombre: newUser.nombre, email: newUser.email });

    res.status(201).json({
      success: true,
      message: 'Registro exitoso',
      user: {
        id: newUser.id,
        name: newUser.nombre,
        email: newUser.email
      }
    })
  } catch (error) {
    console.error('❌ Error en registro:', error.message)
    console.error('❌ Stack:', error.stack)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    })
  }
})

// POST /api/login - Autenticación de administradores
app.post('/api/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contrasena son requeridos'
      })
    }

    const result = await pool.query(
      'SELECT id, nombre, email FROM administradores WHERE email = $1 AND contrasena = $2',
      [email, password]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      })
    }

    const user = result.rows[0]

    // Generar tokens
    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      name: user.nombre,
      email: user.email
    })

    // Guardar refresh token en cookie HttpOnly (segura)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    })

    res.json({
      success: true,
      message: 'Login exitoso',
      accessToken,
      user: {
        id: user.id,
        name: user.nombre,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error en login:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/refresh - Renovar access token usando refresh token
app.post('/api/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token no encontrado'
      })
    }

    // Validar el refresh token
    const decoded = verifyRefreshToken(refreshToken)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido o expirado'
      })
    }

    // Validar que el token esté en BD y no esté revocado
    const isValid = await validateRefreshTokenInDB(refreshToken, decoded.id)

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token revocado o expirado'
      })
    }

    // Obtener datos del usuario
    const userResult = await pool.query(
      'SELECT id, nombre, email FROM administradores WHERE id = $1',
      [decoded.id]
    )

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    const user = userResult.rows[0]

    // Generar nuevo access token
    const { accessToken: newAccessToken } = await generateTokens({
      id: user.id,
      name: user.nombre,
      email: user.email
    })

    res.json({
      success: true,
      message: 'Token renovado',
      accessToken: newAccessToken
    })
  } catch (error) {
    console.error('Error en refresh:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/logout - Logout y revocación de refresh token
app.post('/api/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken
    const authHeader = req.headers.authorization

    let userId: number | null = null

    // Intentar obtener el user ID del token si está presente
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const user = verifyAccessToken(token)
      if (user) {
        userId = user.id
      }
    }

    // Si no hay token válido, intentar revocar por refresh token
    if (!userId && refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken)
        if (decoded) {
          userId = decoded.id
        }
      } catch (error) {
        // Token expirado, continuar sin userId
      }
    }

    // Revocar el refresh token en BD si tenemos userId
    if (refreshToken && userId) {
      await revokeRefreshToken(refreshToken, userId)
    }

    // Limpiar la cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    res.json({
      success: true,
      message: 'Logout exitoso'
    })
  } catch (error) {
    console.error('Error en logout:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/logout-all - Logout de todos los dispositivos
app.post('/api/logout-all', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      })
    }

    // Revocar TODOS los refresh tokens del usuario
    await revokeAllRefreshTokens(req.user.id)

    // Limpiar la cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    res.json({
      success: true,
      message: 'Logout de todos los dispositivos exitoso'
    })
  } catch (error) {
    console.error('Error en logout-all:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/verify-credentials - Verificar credenciales para recuperación de contrasena
app.post('/api/verify-credentials', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contrasena son requeridos'
      })
    }

    const result = await pool.query(
      'SELECT id, nombre, email FROM administradores WHERE email = $1 AND contrasena = $2',
      [email, password]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      })
    }

    res.json({
      success: true,
      message: 'Credenciales verificadas correctamente'
    })
  } catch (error) {
    console.error('Error en verificación de credenciales:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/change-password - Cambiar contrasena
app.post('/api/change-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, currentPassword, newPassword }: { email: string; currentPassword: string; newPassword: string } = req.body

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, contrasena actual y nueva contrasena son requeridos'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contrasena debe tener al menos 6 caracteres'
      })
    }

    // Verificar que las credenciales actuales sean correctas
    const verifyResult = await pool.query(
      'SELECT id FROM administradores WHERE email = $1 AND contrasena = $2',
      [email, currentPassword]
    )

    if (verifyResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales actuales inválidas'
      })
    }

    // Actualizar la contrasena
    const updateResult = await pool.query(
      'UPDATE administradores SET contrasena = $1 WHERE email = $2',
      [newPassword, email]
    )

    if (updateResult.rowCount === 0) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la contrasena'
      })
    }

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    })
  } catch (error) {
    console.error('Error en cambio de contrasena:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/actualizar-correo - Actualizar correo del administrador
app.post('/api/actualizar-correo', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      })
    }

    const { correoActual, nuevoCorreo }: { correoActual: string; nuevoCorreo: string } = req.body

    if (!correoActual || !nuevoCorreo) {
      return res.status(400).json({
        success: false,
        message: 'Correo actual y nuevo correo son requeridos'
      })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(nuevoCorreo)) {
      return res.status(400).json({
        success: false,
        message: 'El nuevo correo no tiene un formato válido'
      })
    }

    // Verificar que el correo actual coincida con el del usuario autenticado
    const verifyResult = await pool.query(
      'SELECT id FROM administradores WHERE id = $1 AND email = $2',
      [req.user.id, correoActual]
    )

    if (verifyResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'El correo actual no coincide con el de la sesión'
      })
    }

    // Verificar que el nuevo correo no esté en uso por otro usuario
    const existingEmailResult = await pool.query(
      'SELECT id FROM administradores WHERE email = $1 AND id != $2',
      [nuevoCorreo, req.user.id]
    )

    if (existingEmailResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El nuevo correo ya está en uso por otro usuario'
      })
    }

    // Actualizar el correo
    const updateResult = await pool.query(
      'UPDATE administradores SET email = $1 WHERE id = $2',
      [nuevoCorreo, req.user.id]
    )

    if (updateResult.rowCount === 0) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el correo'
      })
    }

    res.json({
      success: true,
      message: 'Correo actualizado exitosamente'
    })
  } catch (error) {
    console.error('Error en actualización de correo:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/importar/:tabla - Importar datos a una tabla específica
app.post('/api/importar/:tabla', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      })
    }

    const tabla = req.params.tabla
    const { datos, sobrescribir = false } = req.body

    if (!Array.isArray(datos) || datos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Los datos deben ser un array no vacío'
      })
    }

    // Validar que la tabla sea válida
    const tablasValidas = [
      'socios', 'directiva', 'caja-general', 'caja-chica',
      'aportes', 'prestamos', 'registro-aportes', 'registro-prestamos',
      'libretas-prestamos', 'balance-general', 'cuerpo-normativo'
    ]

    if (!tablasValidas.includes(tabla)) {
      return res.status(400).json({
        success: false,
        message: 'Tabla no válida'
      })
    }

    // Mapeo de tablas a nombres de tablas en la base de datos
    const tablaMapping: { [key: string]: string } = {
      'socios': 'socios',
      'directiva': 'directiva',
      'caja-general': 'caja_general',
      'caja-chica': 'caja_chica',
      'aportes': 'aportes',
      'prestamos': 'prestamos',
      'registro-aportes': 'registro_aportes',
      'registro-prestamos': 'registro_prestamos',
      'libretas-prestamos': 'libretas_prestamos',
      'balance-general': 'balance_general',
      'cuerpo-normativo': 'cuerpo_normativo'
    }

    const nombreTabla = tablaMapping[tabla]

    // Si se solicita sobrescribir, eliminar datos existentes
    if (sobrescribir) {
      await pool.query(`DELETE FROM ${nombreTabla}`)
    }

    // Insertar los nuevos datos
    let importados = 0
    let errores = 0

    console.log(`🔄 Iniciando importación para tabla ${tabla}:`, {
      totalRegistros: datos.length,
      nombreTabla,
      sobrescribir
    })

    for (const item of datos) {
      try {
        // Obtener columnas y valores del objeto
        const columnas = Object.keys(item)
        const valores = Object.values(item)
        
        // Construir la consulta SQL
        const placeholders = valores.map((_, index) => `$${index + 1}`).join(', ')
        const query = `
          INSERT INTO ${nombreTabla} (${columnas.join(', ')})
          VALUES (${placeholders})
        `
        
        console.log(`💾 Insertando en tabla ${nombreTabla}:`, {
          columnas,
          valoresCount: valores.length,
          query: query.substring(0, 200) + '...',
          valores: valores.map(v => typeof v === 'string' ? `"${v}"` : v)
        })
        
        await pool.query(query, valores)
        importados++
        console.log(`✅ Registro insertado correctamente en ${nombreTabla}`)
      } catch (error) {
        console.error(`❌ Error insertando registro en ${tabla}:`, {
          error: error.message,
          errorCode: error.code,
          errorDetail: error.detail,
          item: JSON.stringify(item, null, 2),
          columnas: Object.keys(item),
          valores: Object.values(item)
        })
        errores++
      }
    }

    console.log(`📊 Resumen importación ${tabla}:`, {
      importados,
      errores,
      total: datos.length
    })

    res.json({
      success: true,
      message: `Se importaron ${importados} registros correctamente${errores > 0 ? ` y ${errores} registros tuvieron errores` : ''}`,
      importados,
      errores,
      total: datos.length
    })

  } catch (error) {
    console.error('Error en importación:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/directiva - Obtener todos los miembros de la directiva
app.get('/api/directiva', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT id, cargo, nombre, telefono, created_at
      FROM directiva
      ORDER BY id
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo directiva:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/caja-general - Obtener todos los registros de caja general
app.get('/api/caja-general', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT id, concepto, monto, tipo, fecha, responsable, descripcion, fecha_creacion, fecha_actualizacion
      FROM caja_general
      ORDER BY fecha_creacion DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo caja general:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/aportes - Obtener todos los aportes
app.get('/api/aportes', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT id, socio_id, monto, fecha, tipo, descripcion, fecha_creacion, fecha_actualizacion
      FROM aportes
      ORDER BY fecha_creacion DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo aportes:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/prestamos - Obtener todos los préstamos
app.get('/api/prestamos', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT id, socio_id, monto, interes, plazo, fecha, estado, descripcion, fecha_creacion, fecha_actualizacion
      FROM prestamos
      ORDER BY fecha_creacion DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo préstamos:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/balance-general - Obtener todos los registros del balance general
app.get('/api/balance-general', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT id, socio_id, aporte_inicial, saldo_ahorros, retiro, interes_generado, fecha_creacion, fecha_actualizacion
      FROM balance_general
      ORDER BY fecha_creacion DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo balance general:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/socios - Obtener todos los socios
app.get('/api/socios', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT id, numero_socio, nombre_completo, cedula, telefono, mes_ingreso,
             ahorro_mensual, fecha_creacion, fecha_actualizacion
      FROM socios
      ORDER BY numero_socio
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo socios:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/socios - Crear un nuevo socio
app.post('/api/socios', async (req, res) => {
  try {
    const { nombre_completo, cedula, telefono, mes_ingreso, ahorro_mensual } = req.body

    if (!nombre_completo || !cedula || !ahorro_mensual) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos: nombre_completo, cedula y ahorro_mensual son obligatorios'
      })
    }

    // Obtener el siguiente número de socio (máximo actual + 1)
    const maxNumeroResult = await pool.query('SELECT COALESCE(MAX(numero_socio), 0) as max_numero FROM socios')
    const numeroSocio = maxNumeroResult.rows[0].max_numero + 1

    const result = await pool.query(`
      INSERT INTO socios (numero_socio, nombre_completo, cedula, telefono, mes_ingreso, ahorro_mensual)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, numero_socio, nombre_completo, cedula, telefono, mes_ingreso, ahorro_mensual, fecha_creacion, fecha_actualizacion
    `, [numeroSocio, nombre_completo, cedula, telefono, mes_ingreso, ahorro_mensual])

    res.status(201).json({
      success: true,
      message: 'Socio creado correctamente',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error creando socio:', error.message)
    if (error.code === '23505') { // unique constraint violation
      res.status(400).json({
        success: false,
        message: 'La cédula ya existe en el sistema'
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
})

// PUT /api/socios/:id - Actualizar un socio
app.put('/api/socios/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nombre_completo, cedula, telefono, mes_ingreso, ahorro_mensual } = req.body

    if (!nombre_completo || !cedula || !ahorro_mensual) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos: nombre_completo, cedula y ahorro_mensual son obligatorios'
      })
    }

    const result = await pool.query(`
      UPDATE socios
      SET nombre_completo = $1, cedula = $2, telefono = $3,
          mes_ingreso = $4, ahorro_mensual = $5, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, numero_socio, nombre_completo, cedula, telefono, mes_ingreso, ahorro_mensual, fecha_creacion, fecha_actualizacion
    `, [nombre_completo, cedula, telefono, mes_ingreso, ahorro_mensual, id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Socio no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Socio actualizado correctamente',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error actualizando socio:', error.message)
    if (error.code === '23505') {
      res.status(400).json({
        success: false,
        message: 'La cédula ya existe en el sistema'
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
})

// DELETE /api/socios/:id - Eliminar un socio
app.delete('/api/socios/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Primero eliminar registros relacionados en orden de dependencias
    // Eliminar registros de aportes
    await pool.query('DELETE FROM registro_aportes WHERE socio_id = $1', [id])
    
    // Eliminar aportes
    await pool.query('DELETE FROM aportes WHERE socio_id = $1', [id])
    
    // Eliminar libretas de préstamos
    await pool.query('DELETE FROM libretas_prestamos WHERE socio_id = $1', [id])
    
    // Finalmente eliminar el socio
    const result = await pool.query('DELETE FROM socios WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Socio no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Socio eliminado correctamente'
    })
  } catch (error) {
    console.error('Error eliminando socio:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})



// GET /api/caja-chica - Obtener todos los registros de caja chica
app.get('/api/caja-chica', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, reunion, fecha, descripcion, ingresos, egresos, saldo, fecha_creacion, fecha_actualizacion
      FROM caja_chica
      ORDER BY fecha DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo registros de caja chica:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/caja-chica - Guardar registros de caja chica
app.post('/api/caja-chica', async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { filas } = req.body

    // Validación básica
    if (!filas || !Array.isArray(filas)) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos: filas es obligatorio'
      })
    }

    // Insertar todas las filas
    const resultados = []
    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i]

      // Validación de fila individual
      if (!fila.fecha || !fila.descripcion.trim()) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          success: false,
          message: `Fila ${i + 1}: Los campos fecha y descripción son obligatorios`
        })
      }

      const result = await client.query(`
        INSERT INTO caja_chica (reunion, fecha, descripcion, ingresos, egresos, saldo)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, reunion, fecha, descripcion, ingresos, egresos, saldo, fecha_creacion, fecha_actualizacion
      `, [fila.reunion || 1, fila.fecha, fila.descripcion.trim(), fila.ingresos || 0, fila.egresos || 0, fila.saldo || 0])

      resultados.push(result.rows[0])
    }

    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      message: 'Registros de caja chica guardados correctamente',
      data: resultados,
      filasGuardadas: resultados.length
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error guardando registros de caja chica:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  } finally {
    client.release()
  }
})

// DELETE /api/caja-chica/:id - Eliminar un registro de caja chica
app.delete('/api/caja-chica/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query('DELETE FROM caja_chica WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Registro eliminado correctamente'
    })
  } catch (error) {
    console.error('Error eliminando registro:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/libretas-prestamos - Obtener todas las libretas de préstamos
app.get('/api/libretas-prestamos', async (req, res) => {
  try {
    // La tabla actual tiene una estructura diferente, devolver datos adaptados
    const result = await pool.query(`
      SELECT id, socio_id, socio_nombre as prestatario, fecha_inicio as fecha, fecha_creacion as created_at
      FROM libretas_prestamos
      ORDER BY fecha_inicio DESC
    `)

    // Adaptar el formato para que sea compatible con el frontend
    const adaptedData = result.rows.map(row => ({
      id: row.id,
      prestatario: row.prestatario,
      socio_nombre: row.prestatario,
      fecha: row.fecha,
      created_at: row.created_at,
      // Campos que no existen en la tabla actual, se ponen valores por defecto
      monto: 0,
      plazo: 0,
      interes: 0,
      descripcion: '',
      pagado: false,
      detalles: [] // Para cálculo de intereses
    }))

    res.json({
      success: true,
      data: adaptedData
    })
  } catch (error) {
    console.error('Error obteniendo libretas de préstamos:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/registro-aportes - Obtener todos los registros de aportes
app.get('/api/registro-aportes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ra.id, ra.socio_id, ra.reporte_mes as reporte_mes, ra.reporte_anio as reporte_anio,
             ra.saldo_actual, ra.deposito, ra.aporte_inicial, ra.retiro, ra.saldo_ahorros,
             ra.fecha_creacion as fecha_registro, ra.socio_nombre,
             s.nombre_completo, s.numero_socio
      FROM registro_aportes ra
      LEFT JOIN socios s ON ra.socio_id = s.id
      ORDER BY ra.fecha_creacion DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo registros de aportes:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/registro-aportes - Crear un nuevo registro de aporte
app.post('/api/registro-aportes', async (req, res) => {
  try {
    // Log completo del body
    console.log('📥 BODY COMPLETO:', JSON.stringify(req.body, null, 2))
    
    const { socio_id, reporte_mes, reporte_anio, socio_nombre, saldo_actual, deposito, aporte_inicial, retiro, saldo_ahorros } = req.body

    console.log('📥 Datos recibidos en POST /api/registro-aportes:', {
      socio_id,
      reporte_mes,
      reporte_anio,
      socio_nombre,
      saldo_actual,
      deposito,
      aporte_inicial,
      retiro,
      saldo_ahorros
    })

    if (!socio_id || reporte_mes === undefined || reporte_anio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos: socio_id, reporte_mes y reporte_anio son obligatorios'
      })
    }

    // Convertir valores decimales correctamente
    const parseDecimal = (value) => {
      if (value === null || value === undefined || value === '') return 0
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }

    // Debug: mostrar valores que se van a insertar
    const depositoParsed = parseDecimal(deposito)
    console.log('🔍 DEBUG - Valores a insertar:')
    console.log('  socio_id:', parseInt(socio_id))
    console.log('  reporte_mes:', parseInt(reporte_mes))
    console.log('  reporte_anio:', parseInt(reporte_anio))
    console.log('  socio_nombre:', socio_nombre || '')
    console.log('  saldo_actual:', parseDecimal(saldo_actual))
    console.log('  deposito (original):', deposito)
    console.log('  deposito (parseado):', depositoParsed)
    console.log('  aporte_inicial:', parseDecimal(aporte_inicial))
    console.log('  retiro:', parseDecimal(retiro))
    console.log('  saldo_ahorros:', parseDecimal(saldo_ahorros))

    const result = await pool.query(`
      INSERT INTO registro_aportes (socio_id, reporte_mes, reporte_anio, socio_nombre, saldo_actual, deposito, aporte_inicial, retiro, saldo_ahorros)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      parseInt(socio_id),
      parseInt(reporte_mes),
      parseInt(reporte_anio),
      socio_nombre || '',
      parseDecimal(saldo_actual),
      depositoParsed,
      parseDecimal(aporte_inicial),
      parseDecimal(retiro),
      parseDecimal(saldo_ahorros)
    ])

    const insertedId = result.rows[0].id
    
    // Obtener el registro completo con SELECT para asegurar todos los campos
    const completeResult = await pool.query(`
      SELECT id, socio_id, reporte_mes, reporte_anio, socio_nombre, 
             saldo_actual, deposito, aporte_inicial, retiro, saldo_ahorros, 
             fecha_creacion
      FROM registro_aportes 
      WHERE id = $1
    `, [insertedId])

    console.log('🔍 DEBUG - Resultado de la base de datos:')
    console.log('  Filas afectadas:', result.rowCount)
    console.log('  ID insertado:', insertedId)
    console.log('  Datos completos devueltos:', completeResult.rows[0])
    console.log('  Valor deposito devuelto:', completeResult.rows[0]?.deposito)

    res.status(201).json({
      success: true,
      message: 'Registro de aporte creado correctamente',
      data: completeResult.rows[0]
    })
  } catch (error) {
    console.error('Error creando registro de aporte:', error.message)
    console.error('Error details:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// PUT /api/registro-aportes/:id - Actualizar un registro de aporte
app.put('/api/registro-aportes/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { socio_id, reporte_mes, reporte_anio, socio_nombre, saldo_actual, deposito, aporte_inicial, retiro, saldo_ahorros } = req.body

    if (!socio_id || reporte_mes === undefined || reporte_anio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos: socio_id, reporte_mes y reporte_anio son obligatorios'
      })
    }

    // Convertir valores decimales correctamente
    const parseDecimal = (value) => {
      if (value === null || value === undefined || value === '') return 0
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }

    const result = await pool.query(`
      UPDATE registro_aportes
      SET socio_id = $1, reporte_mes = $2, reporte_anio = $3, socio_nombre = $4, 
          saldo_actual = $5, deposito = $6, aporte_inicial = $7, retiro = $8, saldo_ahorros = $9
      WHERE id = $10
      RETURNING id, socio_id, reporte_mes, reporte_anio, socio_nombre, saldo_actual, deposito, aporte_inicial, retiro, saldo_ahorros, fecha_creacion
    `, [
      parseInt(socio_id),
      parseInt(reporte_mes),
      parseInt(reporte_anio),
      socio_nombre || '',
      parseDecimal(saldo_actual),
      parseDecimal(deposito),
      parseDecimal(aporte_inicial),
      parseDecimal(retiro),
      parseDecimal(saldo_ahorros),
      parseInt(id)
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Registro de aporte actualizado correctamente',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error actualizando registro de aporte:', error.message)
    console.error('Error details:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// DELETE /api/registro-aportes/:id - Eliminar un registro de aporte
app.delete('/api/registro-aportes/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query('DELETE FROM registro_aportes WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Registro eliminado correctamente'
    })
  } catch (error) {
    console.error('Error eliminando registro:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/registro-prestamos - Obtener todos los registros de préstamos
app.get('/api/registro-prestamos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, mes, anio, socio, concedido, interes, total_adeudado, pago_prestamo, mora, saldo,
             fecha_creacion, fecha_actualizacion
      FROM registro_prestamos
      ORDER BY fecha_creacion DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo registros de préstamos:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/registro-prestamos - Guardar registros de préstamos
app.post('/api/registro-prestamos', async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { filas, mes, anio } = req.body

    // Validación básica
    if (!filas || !Array.isArray(filas)) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos: filas es obligatorio'
      })
    }

    // Insertar todas las filas
    const resultados = []
    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i]

      // Validación de fila individual
      if (!fila.socio || !fila.socio.trim()) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          success: false,
          message: `Fila ${i + 1}: El socio es obligatorio`
        })
      }

      const result = await client.query(`
        INSERT INTO registro_prestamos (mes, anio, socio, concedido, interes, total_adeudado, pago_prestamo, mora, saldo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, mes, anio, socio, concedido, interes, total_adeudado, pago_prestamo, mora, saldo, fecha_creacion, fecha_actualizacion
      `, [
        mes || 'SIN MES',
        anio || new Date().getFullYear().toString(),
        fila.socio.trim(),
        fila.concedido || 0,
        fila.interes || 0,
        fila.totalAdeudado || 0,
        fila.pagoPrestamo || 0,
        fila.mora || 0,
        fila.saldo || 0
      ])

      resultados.push(result.rows[0])
    }

    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      message: 'Registros de préstamos guardados correctamente',
      data: resultados,
      filasGuardadas: resultados.length
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error guardando registros de préstamos:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  } finally {
    client.release()
  }
})

// DELETE /api/registro-prestamos/:id - Eliminar un registro de préstamo
app.delete('/api/registro-prestamos/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query('DELETE FROM registro_prestamos WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Registro eliminado correctamente'
    })
  } catch (error) {
    console.error('Error eliminando registro:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/cuerpo-normativo - Obtener todas las secciones del cuerpo normativo
app.get('/api/cuerpo-normativo', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, titulo, descripcion, archivo_url, fecha_creacion, fecha_actualizacion
      FROM cuerpo_normativo
      ORDER BY fecha_creacion DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo secciones del cuerpo normativo:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/normativa - Obtener todas las secciones de normativa
app.get('/api/normativa', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, titulo, descripcion, tipo_documento, archivo_url, archivo_original,
             tamano_archivo, usuario_creador, fecha_creacion, fecha_actualizacion
      FROM normativa
      WHERE activo = TRUE
      ORDER BY fecha_creacion DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error obteniendo secciones de normativa:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/normativa - Crear nueva sección de normativa
app.post('/api/normativa', upload.single('pdf'), async (req, res) => {
  try {
    const { titulo, descripcion, tipo_documento, usuario_creador } = req.body

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El título es obligatorio'
      })
    }

    if (!tipo_documento || !tipo_documento.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de documento es obligatorio'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Debe subir un archivo PDF'
      })
    }

    // Calcular hash del archivo (simple para este ejemplo)
    const fileBuffer = fs.readFileSync(req.file.path)
    const archivo_hash = crypto.createHash('md5').update(fileBuffer).digest('hex')

    // Guardar información en la base de datos
    const result = await pool.query(`
      INSERT INTO normativa (titulo, descripcion, tipo_documento, archivo_url,
                            archivo_original, archivo_hash, tamano_archivo, usuario_creador)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, titulo, descripcion, tipo_documento, archivo_url, archivo_original,
                tamano_archivo, usuario_creador, fecha_creacion, fecha_actualizacion
    `, [
      titulo.trim(),
      descripcion ? descripcion.trim() : null,
      tipo_documento.trim(),
      `/uploads/${req.file.filename}`,
      req.file.originalname,
      archivo_hash,
      req.file.size,
      usuario_creador || 'Sistema'
    ])

    res.status(201).json({
      success: true,
      message: 'Sección de normativa creada correctamente',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error creando sección de normativa:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// DELETE /api/normativa/:id - Eliminar una sección de normativa
app.delete('/api/normativa/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Obtener información del archivo antes de eliminar
    const selectResult = await pool.query('SELECT archivo_url FROM normativa WHERE id = $1', [id])

    if (selectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      })
    }

    // Marcar como inactivo en lugar de eliminar físicamente
    const result = await pool.query(
      'UPDATE normativa SET activo = FALSE, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Sección de normativa eliminada correctamente'
    })
  } catch (error) {
    console.error('Error eliminando sección de normativa:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/cuerpo-normativo - Crear nueva sección del cuerpo normativo
app.post('/api/cuerpo-normativo', upload.single('pdf'), async (req, res) => {
  try {
    const { titulo, descripcion, tipo_documento } = req.body

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El título es obligatorio'
      })
    }

    if (!tipo_documento || !tipo_documento.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de documento es obligatorio'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Debe subir un archivo PDF'
      })
    }

    // Guardar información en la base de datos
    const result = await pool.query(`
      INSERT INTO cuerpo_normativo (titulo, descripcion, tipo_documento, archivo_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, titulo, descripcion, tipo_documento, archivo_url, fecha_creacion, fecha_actualizacion
    `, [titulo.trim(), descripcion ? descripcion.trim() : null, tipo_documento.trim(), `/uploads/${req.file.filename}`])

    res.status(201).json({
      success: true,
      message: 'Sección del cuerpo normativo creada correctamente',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error creando sección del cuerpo normativo:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// DELETE /api/normativa/:id - Eliminar una sección de normativa
app.delete('/api/normativa/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Obtener información del archivo antes de eliminar
    const selectResult = await pool.query('SELECT archivo_url FROM normativa WHERE id = $1', [id])

    if (selectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      })
    }

    // Eliminar archivo físico si existe
    const archivoUrl = selectResult.rows[0].archivo_url
    if (archivoUrl) {
      try {
        // Remove leading slash and join with uploads directory
        const relativePath = archivoUrl.startsWith('/') ? archivoUrl.substring(1) : archivoUrl
        const filePath = path.join(uploadsPath, path.basename(relativePath))
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch (fileError) {
        console.error('Error eliminando archivo:', fileError.message)
        // No fallar la operación si no se puede eliminar el archivo
      }
    }

    // Marcar como inactivo en lugar de eliminar físicamente
    const result = await pool.query(
      'UPDATE normativa SET activo = FALSE, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sección no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Sección de normativa eliminada correctamente'
    })
  } catch (error) {
    console.error('Error eliminando sección de normativa:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/directiva-image - Obtener la imagen principal del cuerpo directivo
app.get('/api/directiva-image', async (req, res) => {
  try {
    const uploadsDir = uploadsPath;

    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        url: null
      });
    }

    // Buscar primero archivos que empiecen con 'directiva-image.'
    const directivaImageFiles = fs.readdirSync(uploadsDir)
      .filter(file => file.startsWith('directiva-image.'))
      .map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()); // Ordenar por fecha de modificación descendente

    if (directivaImageFiles.length > 0) {
      return res.json({
        success: true,
        url: `/uploads/${directivaImageFiles[0].filename}`
      });
    }

    // Si no existe ningún archivo directiva-image.*, buscar el más reciente que empiece con 'directiva_'
    const fallbackFiles = fs.readdirSync(uploadsDir)
      .filter(file => file.startsWith('directiva_'))
      .map(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()); // Ordenar por fecha de modificación descendente

    if (fallbackFiles.length > 0) {
      res.json({
        success: true,
        url: `/uploads/${fallbackFiles[0].filename}`
      });
    } else {
      res.json({
        success: true,
        url: null
      });
    }
  } catch (error) {
    console.error('Error obteniendo imagen de directiva:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/upload-directiva-image - Subir imagen de directiva
app.post('/api/upload-directiva-image', uploadDirectiva.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo'
      });
    }

    res.json({
      success: true,
      message: 'Imagen subida correctamente',
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/download/:filename - Descargar archivo con CORS
app.get('/api/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    console.log('📥 Petición de descarga:', filename)
    console.log('📁 Uploads path:', uploadsPath)
    
    // Sanitizar el nombre del archivo para evitar path traversal
    if (filename.includes('..') || filename.includes('/')) {
      console.log('❌ Nombre de archivo inválido (path traversal):', filename)
      return res.status(400).json({
        success: false,
        message: 'Nombre de archivo inválido'
      });
    }
    
    const filePath = path.join(uploadsPath, filename);
    console.log('📂 Ruta completa del archivo:', filePath)
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log('❌ Archivo no encontrado:', filePath)
      // Listar archivos disponibles para debug
      try {
        const files = fs.readdirSync(uploadsPath)
        console.log('📋 Archivos disponibles en uploads:', files)
      } catch (dirError) {
        console.log('❌ No se pudo leer el directorio uploads:', dirError.message)
      }
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }
    
    // Verificar tamaño y tipo de archivo
    const stats = fs.statSync(filePath)
    console.log('📊 Estadísticas del archivo:', {
      size: stats.size,
      isFile: stats.isFile(),
      created: stats.birthtime,
      modified: stats.mtime
    })
    
    // Configurar headers para descarga
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    console.log('✅ Enviando archivo:', filename)
    
    // Enviar el archivo
    res.sendFile(filePath);
  } catch (error) {
    console.error('❌ Error descargando archivo:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ========== BACKUPS ==========

const execAsync = promisify(exec);

// Usar ruta relativa para desarrollo, /app para producción Docker
const backupsPath = process.env.NODE_ENV === 'production'
  ? path.resolve('/app', 'backups')
  : path.resolve(process.cwd(), 'backups');

// Crear directorio de backups si no existe
try {
  if (!fs.existsSync(backupsPath)) {
    fs.mkdirSync(backupsPath, { recursive: true });
    console.log('✓ Directorio de backups creado en:', backupsPath);
  }
} catch (error) {
  console.error('❌ Error creando directorio de backups:', error.message);
}

// Configuración de backup automático (en memoria, persiste mientras el servidor corra)
let autoBackupInterval: NodeJS.Timeout | null = null;
let autoBackupConfig = {
  enabled: false,
  intervalHours: 24
};

function formatBackupSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function runPgDump(filename: string): Promise<void> {
  const { DB_HOST, DB_PORT, DB_USER, DB_NAME, DB_PASSWORD } = process.env;
  const filePath = path.join(backupsPath, filename);
  const cmd = `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST || 'db'} -p ${DB_PORT || 5432} -U ${DB_USER || 'postgres'} -d ${DB_NAME || 'cajasComunales'} -F p -f "${filePath}"`;
  await execAsync(cmd);
}

function getBackupList() {
  if (!fs.existsSync(backupsPath)) return [];
  return fs.readdirSync(backupsPath)
    .filter(f => f.endsWith('.sql'))
    .map(f => {
      const filePath = path.join(backupsPath, f);
      const stats = fs.statSync(filePath);
      // Formato: backup_YYYY-MM-DD_HH-MM-SS.sql
      const match = f.match(/backup_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/);
      const fecha = match ? match[1].replace('_', 'T').replace(/-(\d{2})-(\d{2})$/, ':$1:$2') : stats.birthtime.toISOString();
      return {
        id: f,
        nombre: f,
        fecha,
        tamano: stats.size,
        tamano_legible: formatBackupSize(stats.size),
        estado: 'completado'
      };
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

function startAutoBackup(intervalHours: number) {
  if (autoBackupInterval) clearInterval(autoBackupInterval);
  autoBackupConfig = { enabled: true, intervalHours };
  autoBackupInterval = setInterval(async () => {
    try {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
      const filename = `backup_${timestamp}.sql`;
      await runPgDump(filename);
      console.log(`✅ Backup automático creado: ${filename}`);
    } catch (error) {
      console.error('❌ Error en backup automático:', error.message);
    }
  }, intervalHours * 60 * 60 * 1000);
  console.log(`⏰ Backup automático configurado cada ${intervalHours} horas`);
}

function stopAutoBackup() {
  if (autoBackupInterval) {
    clearInterval(autoBackupInterval);
    autoBackupInterval = null;
  }
  autoBackupConfig = { enabled: false, intervalHours: autoBackupConfig.intervalHours };
}

// GET /api/backups - Listar backups disponibles
app.get('/api/backups', verifyToken, (req: Request, res: Response) => {
  try {
    const backups = getBackupList();
    res.json({
      success: true,
      data: backups,
      autoBackup: autoBackupConfig
    });
  } catch (error) {
    console.error('Error listando backups:', error.message);
    res.status(500).json({ success: false, message: 'Error al listar backups' });
  }
});

// POST /api/backups - Crear un nuevo backup manual
app.post('/api/backups', verifyToken, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    const filename = `backup_${timestamp}.sql`;

    await runPgDump(filename);

    const filePath = path.join(backupsPath, filename);
    const stats = fs.statSync(filePath);

    res.status(201).json({
      success: true,
      message: 'Backup creado correctamente',
      data: {
        id: filename,
        nombre: filename,
        fecha: now.toISOString(),
        tamano: stats.size,
        tamano_legible: formatBackupSize(stats.size),
        estado: 'completado'
      }
    });
  } catch (error) {
    console.error('Error creando backup:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al crear backup. Verifica que pg_dump esté disponible en el contenedor.'
    });
  }
});

// GET /api/backups/:filename/download - Descargar un backup
app.get('/api/backups/:filename/download', verifyToken, (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    // Sanitizar nombre de archivo
    if (filename.includes('..') || filename.includes('/') || !filename.endsWith('.sql')) {
      return res.status(400).json({ success: false, message: 'Nombre de archivo inválido' });
    }

    const filePath = path.join(backupsPath, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup no encontrado' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/sql');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error descargando backup:', error.message);
    res.status(500).json({ success: false, message: 'Error al descargar backup' });
  }
});

// DELETE /api/backups/:filename - Eliminar un backup
app.delete('/api/backups/:filename', verifyToken, (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    if (filename.includes('..') || filename.includes('/') || !filename.endsWith('.sql')) {
      return res.status(400).json({ success: false, message: 'Nombre de archivo inválido' });
    }

    const filePath = path.join(backupsPath, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup no encontrado' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Backup eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando backup:', error.message);
    res.status(500).json({ success: false, message: 'Error al eliminar backup' });
  }
});

// POST /api/backups/auto-config - Configurar backup automático
app.post('/api/backups/auto-config', verifyToken, (req: Request, res: Response) => {
  try {
    const { enabled, intervalHours } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ success: false, message: 'El campo enabled es requerido (boolean)' });
    }

    if (enabled) {
      const hours = parseInt(intervalHours) || 24;
      if (hours < 1 || hours > 168) {
        return res.status(400).json({ success: false, message: 'El intervalo debe estar entre 1 y 168 horas' });
      }
      startAutoBackup(hours);
      res.json({ success: true, message: `Backup automático activado cada ${hours} horas`, autoBackup: autoBackupConfig });
    } else {
      stopAutoBackup();
      res.json({ success: true, message: 'Backup automático desactivado', autoBackup: autoBackupConfig });
    }
  } catch (error) {
    console.error('Error configurando backup automático:', error.message);
    res.status(500).json({ success: false, message: 'Error al configurar backup automático' });
  }
});

// Inicializar base de datos al iniciar el servidor
initializeDatabase().then(() => {
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Database initialized with all 13 tables`);
    console.log(`Authentication system enabled with JWT tokens`);

    // Limpiar tokens expirados cada hora
    setInterval(() => {
      cleanupExpiredTokens();
    }, 60 * 60 * 1000);
  });
}).catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
