.PHONY: help up down restart logs build clean validate

# Variables
COMPOSE = docker-compose
COMPOSE_FILE = docker-compose.yml

# Colors
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m

help:
	@echo "$(GREEN)CajasComunales Docker Makefile$(NC)"
	@echo ""
	@echo "Comandos disponibles:"
	@echo "  $(YELLOW)make up$(NC)           - Inicia todos los servicios"
	@echo "  $(YELLOW)make down$(NC)         - Detiene todos los servicios"
	@echo "  $(YELLOW)make restart$(NC)      - Reinicia todos los servicios"
	@echo "  $(YELLOW)make logs$(NC)         - Muestra logs de todos los servicios"
	@echo "  $(YELLOW)make logs-backend$(NC) - Muestra logs del backend"
	@echo "  $(YELLOW)make logs-frontend$(NC)- Muestra logs del frontend"
	@echo "  $(YELLOW)make logs-db$(NC)      - Muestra logs de la BD"
	@echo "  $(YELLOW)make build$(NC)        - Construye las imágenes"
	@echo "  $(YELLOW)make clean$(NC)        - Limpia contenedores y volúmenes"
	@echo "  $(YELLOW)make validate$(NC)     - Valida la configuración"
	@echo "  $(YELLOW)make ps$(NC)           - Muestra estado de los servicios"
	@echo "  $(YELLOW)make shell-backend$(NC)- Abre shell en el backend"
	@echo "  $(YELLOW)make shell-db$(NC)     - Abre psql en la BD"
	@echo ""

up:
	@echo "$(GREEN)Iniciando servicios...$(NC)"
	$(COMPOSE) -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✓ Servicios iniciados$(NC)"
	@echo "Frontend:  http://localhost"
	@echo "API:       http://localhost/api"

down:
	@echo "$(YELLOW)Deteniendo servicios...$(NC)"
	$(COMPOSE) -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✓ Servicios detenidos$(NC)"

restart:
	@echo "$(YELLOW)Reiniciando servicios...$(NC)"
	$(COMPOSE) -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✓ Servicios reiniciados$(NC)"

logs:
	@$(COMPOSE) -f $(COMPOSE_FILE) logs -f

logs-backend:
	@$(COMPOSE) -f $(COMPOSE_FILE) logs -f backend

logs-frontend:
	@$(COMPOSE) -f $(COMPOSE_FILE) logs -f frontend

logs-db:
	@$(COMPOSE) -f $(COMPOSE_FILE) logs -f db

build:
	@echo "$(GREEN)Construyendo imágenes...$(NC)"
	$(COMPOSE) -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✓ Imágenes construidas$(NC)"

clean:
	@echo "$(RED)Limpiando contenedores y volúmenes...$(NC)"
	$(COMPOSE) -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)✓ Limpieza completada$(NC)"

validate:
	@echo "$(GREEN)Validando configuración...$(NC)"
	@./docker-validate.sh

ps:
	@$(COMPOSE) -f $(COMPOSE_FILE) ps

shell-backend:
	@$(COMPOSE) -f $(COMPOSE_FILE) exec backend sh

shell-db:
	@$(COMPOSE) -f $(COMPOSE_FILE) exec db psql -U postgres -d cajasComunales

test-connectivity:
	@echo "$(GREEN)Probando conectividad...$(NC)"
	@echo ""
	@echo "Backend health:"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec backend curl -s http://localhost:3000/health || echo "Error"
	@echo ""
	@echo "Frontend:"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec frontend curl -s http://localhost/ | head -5
	@echo "..."
	@echo ""
	@echo "DB connection (desde backend):"
	@$(COMPOSE) -f $(COMPOSE_FILE) exec backend curl -s http://localhost:3000/db-check || echo "Error"
	@echo ""
	@echo "$(GREEN)✓ Test completado$(NC)"

# Información
info:
	@echo "$(GREEN)Información de CajasComunales$(NC)"
	@echo ""
	@echo "Servicios:"
	@$(COMPOSE) -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "URLs:"
	@echo "  Frontend: http://localhost"
	@echo "  API:      http://localhost/api"
	@echo ""
	@echo "Volúmenes:"
	@docker volume ls | grep cajas-comunales
