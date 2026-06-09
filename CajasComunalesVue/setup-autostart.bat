@echo off
REM ============================================
REM Setup Auto-Start para CajasComunales
REM Configura el despliegue automático al iniciar Windows
REM ============================================

setlocal enabledelayedexpansion

REM Obtener la ruta del script
set SCRIPT_DIR=%~dp0
set SCRIPT_PATH=%SCRIPT_DIR%auto-deploy.bat

REM Verificar permisos de administrador
net session >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Este script requiere permisos de administrador
    echo.
    echo Por favor, ejecuta este archivo como administrador:
    echo 1. Click derecho en setup-autostart.bat
    echo 2. Selecciona "Ejecutar como administrador"
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Configurando Auto-Start
echo ========================================
echo.

REM Crear carpeta de Startup si no existe
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

REM Crear acceso directo
powershell -Command ^
    "$WshShell = New-Object -ComObject WScript.Shell; " ^
    "$Shortcut = $WshShell.CreateShortcut('%STARTUP_FOLDER%\CajasComunales.lnk'); " ^
    "$Shortcut.TargetPath = '%SCRIPT_PATH%'; " ^
    "$Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; " ^
    "$Shortcut.Description = 'Inicia CajasComunales automáticamente'; " ^
    "$Shortcut.WindowStyle = 7; " ^
    "$Shortcut.Save()"

if errorlevel 1 (
    echo [ERROR] No se pudo crear el acceso directo
    pause
    exit /b 1
)

echo [OK] Acceso directo creado en:
echo     %STARTUP_FOLDER%\CajasComunales.lnk
echo.
echo [OK] CajasComunales se iniciará automáticamente al reiniciar Windows
echo.
echo Opciones:
echo   - Para desactivar: Elimina el acceso directo de Startup
echo   - Para iniciar ahora: Ejecuta auto-deploy.bat
echo.
pause
