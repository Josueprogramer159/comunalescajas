#!/bin/bash

echo "============================================"
echo "  Cajas Comunales - Docker Compose Setup"
echo "============================================"
echo

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker no está instalado"
    echo "Por favor instala Docker desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "[ERROR] Docker Compose no está instalado"
    echo "Por favor instala Docker Compose"
    exit 1
fi

echo "[INFO] Verificando si hay contenedores corriendo..."
docker-compose ps

echo
echo "[INFO] Limpiando contenedores existentes..."
docker-compose down -v

echo
echo "[INFO] Construyendo imágenes..."
docker-compose build --no-cache

echo
echo "[INFO] Iniciando servicios..."
docker-compose up -d

echo
echo "[INFO] Esperando a que los servicios estén listos..."
sleep 30

echo
echo "[INFO] Verificando estado de los servicios..."
docker-compose ps

echo
echo "============================================"
echo "          SERVICIOS DISPONIBLES"
echo "============================================"
echo "  Frontend: http://localhost"
echo "  API:      http://localhost/api"
echo "  Health:   http://localhost/api/health"
echo "============================================"
echo

echo "[SUCCESS] Sistema listo para usar!"
echo "Presiona Ctrl+C para detener los logs..."
sleep 2

docker-compose logs -f
