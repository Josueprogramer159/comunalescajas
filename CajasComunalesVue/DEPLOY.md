# Despliegue con Docker Compose

Este proyecto está preparado para desplegarse con Docker Compose usando los contenedores:
- `db`: PostgreSQL
- `backend`: API Node/Express
- `frontend`: aplicación Vue servida por Nginx

## Archivos clave
- `docker-compose.yml`
- `frontend/Dockerfile`
- `backend/Dockerfile`
- `frontend/nginx.conf`

## Comandos de despliegue
Desde la carpeta `CajasComunalesVue`:

```bash
./deploy.sh
```

O de forma manual:

```bash
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d
```

## Acceso
- Frontend: `http://localhost`
- Backend API: `http://localhost/api`

## Notas
- La base de datos se inicializa con `database/init.sql` y `backend/src/init_db.sql`.
- El frontend y el backend comparten el volumen `uploads_data` para archivos subidos.
- Si necesitas cambiar variables de entorno, puedes definirlas antes de ejecutar `docker compose`.
