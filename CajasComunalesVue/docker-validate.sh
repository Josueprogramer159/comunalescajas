#!/bin/bash

echo "============================================"
echo "  Validando configuración de Docker"
echo "============================================"

# Verificar archivos necesarios
required_files=(
    "docker-compose.yml"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "frontend/nginx.conf"
    "backend/.dockerignore"
    "frontend/.dockerignore"
    ".env"
    "database/init.sql"
    "backend/src/init_db.sql"
)

echo "[INFO] Verificando archivos necesarios..."
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (FALTANTE)"
        exit 1
    fi
done

echo
echo "[INFO] Verificando configuración de docker-compose..."
if docker-compose config > /dev/null 2>&1; then
    echo "  ✓ docker-compose.yml es válido"
else
    echo "  ✗ docker-compose.yml tiene errores"
    docker-compose config
    exit 1
fi

echo
echo "[INFO] Verificando variables de entorno..."
if [ -f ".env" ]; then
    echo "  ✓ .env existe"
    
    # Verificar variables requeridas
    required_vars=("DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME" "PORT" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            echo "  ✓ $var está configurado"
        else
            echo "  ✗ $var no está configurado"
        fi
    done
else
    echo "  ✗ .env no existe"
fi

echo
echo "[INFO] Verificando archivos SQL..."
if [ -f "database/init.sql" ] && [ -s "database/init.sql" ]; then
    echo "  ✓ database/init.sql existe y tiene contenido"
else
    echo "  ✗ database/init.sql está vacío o no existe"
fi

if [ -f "backend/src/init_db.sql" ] && [ -s "backend/src/init_db.sql" ]; then
    echo "  ✓ backend/src/init_db.sql existe y tiene contenido"
else
    echo "  ✗ backend/src/init_db.sql está vacío o no existe"
fi

echo
echo "[SUCCESS] Validación completada"
echo "============================================"
