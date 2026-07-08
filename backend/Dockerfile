FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++ postgresql-client curl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas las dependencias
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript a dist/
RUN npm run build

# Crear directorio para uploads y backups con permisos correctos
RUN mkdir -p /app/uploads /app/backups && \
    chmod 777 /app/uploads /app/backups

# Cambiar a usuario no root
USER node

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:3000/health 2>/dev/null || exit 1

CMD ["node", "dist/server.js"]
