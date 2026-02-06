# 🏦 Cajas Comunales - Sistema de Gestión

Sistema web de gestión de cajas de ahorros comunales construido con Vue 3 y Vite en el frontend, y Express.js + PostgreSQL en el backend.

## 📋 Requisitos Previos

- **Node.js** v20.19.0 o superior
- **PostgreSQL** instalado y ejecutándose
- **npm** o similar

## 🚀 Inicio Rápido

### ✨ Opción A: Docker Compose (Recomendado)

#### Requisitos
- **Docker Desktop** instalado y ejecutándose
- Puertos 80 y 5432 disponibles
- **Windows**: PowerShell o Command Prompt
- **Linux/Mac**: Terminal con bash

#### Ejecutar (Windows)
```bash
# Navegar al directorio del proyecto
cd CajasComunalesVue

# Ejecutar el script (opción 1)
.\docker-start.bat

# O usar docker-compose directamente (opción 2)
docker-compose up -d
```

#### Ejecutar (Linux/Mac)
```bash
cd CajasComunalesVue
chmod +x docker-start.sh docker-start.sh
./docker-start.sh
```

#### Acceder a la aplicación
- **Frontend**: http://localhost
- **API**: http://localhost/api
- **Health Check**: http://localhost/api/health
- **DB Check**: http://localhost/api/db-check

#### Comandos útiles
```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Detener y limpiar volúmenes (eliminar datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Acceder a shell del backend
docker-compose exec backend sh

# Acceder a base de datos
docker-compose exec db psql -U postgres -d cajasComunales

# Validar configuración
./docker-validate.sh  # Linux/Mac
# o
make validate         # Si tienes Make
```

#### Scripts disponibles
- **Windows**: `docker-start.bat`, `docker-stop.bat`
- **Linux/Mac**: `docker-start.sh`, `docker-stop.sh`, `docker-validate.sh`
- **Makefile**: `make help` para ver todos los comandos

#### ⚠️ Cambios para Producción
Editar `.env`:
```env
DB_PASSWORD=contraseña-segura
JWT_SECRET=secreto-muy-seguro-para-jwt
NODE_ENV=production
```

📖 **Guía completa**: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)

### 🛠️ Opción B: Desarrollo Local

#### 1. Configurar la Base de Datos

**Con Docker:**
```bash
# Iniciar solo PostgreSQL
docker run -d --name postgres-cajas -e POSTGRES_DB=cajasComunales -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=root -p 5432:5432 postgres:15-alpine

# Ejecutar script de inicialización
docker exec -i postgres-cajas psql -U postgres -d cajasComunales < database/init.sql
```

**Con PostgreSQL nativo:**
```bash
# Crear la base de datos
createdb cajasComunales

# Ejecutar el script de inicialización
psql -U postgres -d cajasComunales -f backend/src/init_db.sql
```

#### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y edita las variables:
```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tus credenciales:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cajasComunales
DB_USER=postgres
DB_PASSWORD=root
```

#### 3. Instalar Dependencias

```bash
# Instalar todas las dependencias
npm run install:all

# O instalar individualmente:
npm install                    # Dependencias raíz
cd backend && npm install      # Backend
cd ../frontend && npm install  # Frontend
```

#### 4. Ejecutar en Desarrollo

**Opción 1: Servidor individual**
```bash
# Ejecutar solo el servidor backend
npm run server
# o
node backend/server.js
```

**Opción 2: Desarrollo completo**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Luego abre: http://localhost:5173

### Credenciales de Prueba (después de ejecutar init_db.sql)

- Email: `juan@example.com` - Contraseña: `password123`
- Email: `maria@example.com` - Contraseña: `password456`
- Email: `carlos@example.com` - Contraseña: `password789`

## 🛠 Build para Producción

```bash
npm run build
npm run preview
```

## 📂 Estructura del Proyecto

```
CajasComunales/
├── src/
│   ├── views/
│   │   ├── Home.vue          # Página de inicio
│   │   ├── Login.vue         # Página de login
│   │   └── Dashboard.vue     # Panel principal
│   ├── App.vue               # Componente raíz
│   └── main.js               # Punto de entrada
├── backend/
│   ├── server.js             # Servidor Express
│   ├── db.js                 # Configuración de BD
│   ├── init_db.sql           # Script de base de datos
│   └── .env                  # Variables de entorno
├── index.html
├── package.json
└── vite.config.js
```

## ✨ Características

- ✅ Autenticación de usuarios
- ✅ Gestión de directiva
- ✅ Control de caja general
- ✅ Administración de caja chica
- ✅ Sistema de préstamos
- ✅ Reportes y estadísticas
- ✅ Interfaz responsive

## 🐛 Solución de Problemas

### "Error de conexión en http://localhost:3000"
1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `backend/.env`
3. Asegúrate de que la tabla `administradores` tenga datos
4. Ejecuta `npm run dev` en la carpeta `backend`

### Puerto 3000 en uso
Cambia el puerto en `backend/.env`:
```env
PORT=3001
```

Y actualiza la URL en `src/views/Login.vue`

## 🐳 Despliegue con Docker

### Servicios Incluidos

La configuración Docker incluye tres servicios principales:

1. **Base de Datos (PostgreSQL 15)**
   - Puerto: `5432`
   - Base de datos: `cajasComunales`
   - Usuario: `postgres`
   - Volúmenes persistentes para datos

2. **Backend API (Node.js)**
   - Puerto: `3000`
   - Health checks automáticos
   - Reinicio automático
   - Volúmenes para uploads

3. **Frontend Web (Nginx)**
   - Puerto: `80`
   - Servidor web optimizado
   - Proxy a la API backend
   - Compresión Gzip

### Archivos de Configuración

```
├── docker-compose.yml          # Orquestación de servicios
├── backend/Dockerfile          # Imagen backend
├── frontend/Dockerfile         # Imagen frontend
├── frontend/nginx.conf         # Configuración Nginx
├── .dockerignore              # Exclusiones Docker
├── start-docker.bat           # Script Windows fácil
├── start-docker-services.ps1  # Gestión avanzada
├── setup-autostart.ps1        # Auto-inicio Windows
└── setup-autostart.xml        # Tarea programada
```

### Auto-inicio en Windows

Para configurar el auto-inicio automático al iniciar Windows:

1. **Ejecutar como administrador:**
   ```bash
   .\setup-autostart.ps1
   ```

2. **Verificar la tarea programada:**
   - Abrir Programador de Tareas
   - Buscar "CajasComunalesDocker"

3. **Eliminar auto-inicio:**
   ```bash
   .\setup-autostart.ps1 -Remove
   ```

### Comandos de Gestión

```bash
# Iniciar servicios
.\start-docker.bat

# Ver estado
.\start-docker.bat -Status

# Detener servicios
.\start-docker.bat -Stop

# Reiniciar servicios
.\start-docker.bat -Restart
```

### Volúmenes Persistentes

- `postgres_data`: Datos de PostgreSQL
- `uploads_data`: Archivos subidos por usuarios

### Health Checks

Todos los servicios incluyen health checks automáticos:
- PostgreSQL: Verifica conectividad
- Backend: Verifica endpoint `/api/login`
- Frontend: Verifica respuesta HTTP

### Logs y Monitoreo

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend

# Seguir logs en tiempo real
docker-compose logs -f
```

## 📄 Licencia

MIT
