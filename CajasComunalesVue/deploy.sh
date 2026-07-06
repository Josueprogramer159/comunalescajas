#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=============================================="
echo " Iniciando despliegue Docker Compose"
echo "=============================================="

echo "1. Deteniendo cualquier stack anterior..."
docker compose down --remove-orphans

echo "2. Construyendo imágenes..."
docker compose build --no-cache

echo "3. Iniciando servicios en segundo plano..."
docker compose up -d

echo "4. Esperando brevemente para que los servicios se inicien..."
sleep 15

echo "=============================================="
echo " Servicios levantados"
echo " Frontend: http://localhost"
echo " API backend: http://localhost/api"
echo " Base de datos en el contenedor: db:5432"
echo "=============================================="

docker compose ps

echo "=============================================="
echo " Últimos logs de los servicios"
docker compose logs --tail=20

echo "=============================================="
echo "Despliegue completado."
