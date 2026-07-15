FROM node:20-alpine

RUN apk add --no-cache python3 make g++ postgresql-client curl

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install --legacy-peer-deps

COPY src/ ./src/

RUN npm run build

RUN mkdir -p /app/uploads /app/backups && \
    chown -R node:node /app && \
    chmod -R 755 /app/uploads /app/backups

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD ["sh", "-c", "curl -f http://localhost:${PORT:-3000}/health || exit 1"]

CMD ["node", "dist/server.js"]