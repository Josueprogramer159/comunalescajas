@echo off
REM ============================================
REM Despliegue Automático - Cajas Comunales
REM ============================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     Iniciando Cajas Comunales con Docker...               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Cambiar al directorio del proyecto
cd /d "%~dp0"

REM Levantar los contenedores
echo [1/3] Levantando contenedores Docker...
docker-compose up -d

REM Esperar a que los servicios estén listos
echo [2/3] Esperando a que los servicios se inicien...
timeout /t 5 /nobreak

REM Abrir el navegador
echo [3/3] Abriendo la aplicación en el navegador...
timeout /t 2 /nobreak
start http://localhost

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           ✓ Aplicación desplegada exitosamente!          ║
echo ║                                                            ║
echo ║  URL: http://localhost                                    ║
echo ║  Backend: http://localhost:3000                           ║
echo ║                                                            ║
echo ║  Para ver los logs: docker-compose logs -f               ║
echo ║  Para detener: docker-compose down                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause
