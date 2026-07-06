# Etapa de construcción
FROM node:20-alpine as build-stage

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY public/ ./public/
COPY src/ ./src/
COPY index.html ./

# Construir aplicación para producción
RUN npm run build

# Verificar que dist fue creado
RUN if [ ! -d "dist" ]; then echo "Error: dist directory not found after build"; exit 1; fi

# Etapa de producción
FROM nginx:stable-alpine as production-stage

# Instalar curl para health checks
RUN apk add --no-cache curl

# Crear directorios necesarios
RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run/nginx /usr/share/nginx/html/uploads && \
    chown -R nginx:nginx /var/log/nginx /var/cache/nginx /var/run/nginx /usr/share/nginx/html

# Copiar archivos construidos al directorio de nginx
COPY --from=build-stage --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Cambiar a usuario root para que nginx pueda escribir el pid
USER root

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]


