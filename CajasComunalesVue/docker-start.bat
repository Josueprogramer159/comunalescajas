@echo off
echo ============================================
echo   Cajas Comunales - Docker Compose Setup
echo ============================================
echo.

REM Verificar si Docker Desktop está corriendo
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no esta instalado o no esta en el PATH
    echo Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose no esta instalado
    echo Por favor instala Docker Compose
    pause
    exit /b 1
)

echo [INFO] Verificando si hay contenedores corriendo...
docker-compose ps

echo.
echo [INFO] Limpiando contenedores existentes...
docker-compose down -v

echo.
echo [INFO] Construyendo imagenes...
docker-compose build --no-cache

echo.
echo [INFO] Iniciando servicios...
docker-compose up -d

echo.
echo [INFO] Esperando a que los servicios esten listos...
timeout /t 30

echo.
echo [INFO] Verificando estado de los servicios...
docker-compose ps

echo.
echo ============================================
echo   SERVICIOS DISPONIBLES
echo ============================================
echo   Frontend: http://localhost
echo   API:      http://localhost/api
echo   Health:   http://localhost/api/health
echo ============================================
echo.

echo [SUCCESS] Sistema listo para usar!
echo Presiona cualquier tecla para ver logs en tiempo real...
pause

docker-compose logs -f
