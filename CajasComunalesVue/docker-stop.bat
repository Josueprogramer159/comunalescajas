@echo off
echo ============================================
echo   Cajas Comunales - Deteniendo Servicios
echo ============================================
echo.

echo [INFO] Deteniendo todos los servicios...
docker-compose down

echo.
echo [INFO] Limpiando volúmenes (opcional)...
set /p clean="¿Desea limpiar también los volúmenes de datos? (y/N): "
if /i "%clean%"=="y" (
    echo [INFO] Eliminando volúmenes...
    docker-compose down -v
    echo [WARNING] Todos los datos han sido eliminados
)

echo.
echo [INFO] Verificando que no haya contenedores corriendo...
docker-compose ps

echo.
echo [SUCCESS] Servicios detenidos correctamente
echo ============================================
pause
