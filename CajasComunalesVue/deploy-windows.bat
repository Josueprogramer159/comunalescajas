@echo off
REM ============================================
REM Script de despliegue para CajasComunales
REM Windows
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Despliegue de CajasComunales
echo ========================================
echo.

REM Verificar que Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no está instalado
    pause
    exit /b 1
)
echo [OK] Docker encontrado

REM Verificar que Docker Compose está instalado
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose no está instalado
    pause
    exit /b 1
)
echo [OK] Docker Compose encontrado

REM Detener contenedores existentes
echo.
echo [INFO] Deteniendo contenedores existentes...
docker-compose down --remove-orphans 2>nul

REM Construir imágenes
echo.
echo [INFO] Construyendo imágenes Docker...
docker-compose build --no-cache
if errorlevel 1 (
    echo [ERROR] Error al construir imágenes
    pause
    exit /b 1
)

REM Iniciar servicios
echo.
echo [INFO] Iniciando servicios...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Error al iniciar servicios
    pause
    exit /b 1
)

REM Esperar a que los servicios estén listos
echo.
echo [INFO] Esperando a que los servicios estén listos...
timeout /t 15 /nobreak

REM Mostrar logs
echo.
echo [INFO] Mostrando logs de los servicios...
docker-compose logs --tail=20

echo.
echo ========================================
echo   Despliegue completado exitosamente
echo ========================================
echo.
echo Servicios disponibles:
echo   - Frontend: http://localhost
echo   - Backend API: http://localhost/api
echo   - Base de datos: db:5432
echo.
echo Para ver los logs en tiempo real:
echo   docker-compose logs -f
echo.
echo Para detener los servicios:
echo   docker-compose down
echo.
pause
