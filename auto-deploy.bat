@echo off
REM ============================================
REM Auto-Deploy CajasComunales
REM Despliegue automático
REM ============================================

setlocal enabledelayedexpansion

REM Obtener la ruta del script
set SCRIPT_DIR=%~dp0

REM Cambiar a la carpeta del proyecto
cd /d "%SCRIPT_DIR%"

REM Iniciar servicios
docker compose up -d

REM Esperar a que los servicios estén listos
timeout /t 10 /nobreak

REM Mostrar estado
docker compose ps

echo.
echo ========================================
echo   CajasComunales iniciado correctamente
echo ========================================
echo.
echo Accede a: http://localhost
echo.
