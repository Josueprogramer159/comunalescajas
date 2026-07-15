FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++ postgresql-client curl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Crear directorios y dar acceso al usuario node
RUN mkdir -p /app/uploads /app/backups && \
    chown -R node:node /app && \
    chmod -R 755 /app/uploads /app/backups

USER node

EXPOSE 3000

# Usar el puerto asignado por Render
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD-SHELL curl -f "http://localhost:${PORT:-3000}/health" || exit 1

CMD ["node", "dist/server.js"]