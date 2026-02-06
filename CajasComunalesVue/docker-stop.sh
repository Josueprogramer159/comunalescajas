#!/bin/bash

echo "============================================"
echo "  Cajas Comunales - Deteniendo Servicios"
echo "============================================"
echo

echo "[INFO] Deteniendo todos los servicios..."
docker-compose down

echo
read -p "¿Desea limpiar también los volúmenes de datos? (y/N): " clean
if [[ $clean =~ ^[Yy]$ ]]; then
    echo "[INFO] Eliminando volúmenes..."
    docker-compose down -v
    echo "[WARNING] Todos los datos han sido eliminados"
fi

echo
echo "[INFO] Verificando que no haya contenedores corriendo..."
docker-compose ps

echo
echo "[SUCCESS] Servicios detenidos correctamente"
echo "============================================"
