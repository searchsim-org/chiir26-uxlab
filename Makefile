.PHONY: help install dev run backend frontend up down build logs clean frontend-install backend-install generate-api test setup env check-poetry check-pnpm check-prereqs status ps restart rebuild logs-backend logs-frontend clean-frontend clean-backend clean-docker format format-backend format-frontend lint lint-backend lint-frontend ollama-pull build-prod prod backend-prod frontend-prod db-migrate db-rollback db-reset

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "$(BLUE)UXLab - Available Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Local Development (Recommended):$(NC)"
	@echo "  $(GREEN)make run$(NC)            - Run backend and frontend locally (dev mode)"
	@echo "  $(GREEN)make backend$(NC)        - Run backend only (dev mode)"
	@echo "  $(GREEN)make frontend$(NC)       - Run frontend only (dev mode)"
	@echo ""
	@echo "$(YELLOW)Production Deployment (Local):$(NC)"
	@echo "  $(GREEN)make prod$(NC)           - Build and run in production mode (backend: 8100, frontend: 3001)"
	@echo "  $(GREEN)make backend-prod$(NC)   - Run backend in production mode (port 8100)"
	@echo "  $(GREEN)make frontend-prod$(NC)  - Run frontend in production mode (port 3001)"
	@echo ""
	@echo "$(YELLOW)All Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Setup & Installation
setup: check-prereqs env install ## Complete project setup (environment + dependencies)
	@echo ""
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo ""
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Add your BING_API_KEY to the .env file"
	@echo "  2. Start the app: $(YELLOW)make run$(NC)"
	@echo ""
	@echo "$(BLUE)Optional - For local LLM support:$(NC)"
	@echo "  • Install Ollama from https://ollama.com/download"
	@echo "  • Start Ollama: $(YELLOW)ollama serve$(NC)"
	@echo "  • Pull models: $(YELLOW)make ollama-pull$(NC)"
	@echo ""

check-prereqs: ## Check if all prerequisites are installed
	@echo "$(BLUE)Checking prerequisites...$(NC)"
	@command -v poetry >/dev/null 2>&1 && echo "$(GREEN)✓ Poetry installed$(NC)" || echo "$(RED)✗ Poetry not found - Install from https://python-poetry.org/$(NC)"
	@command -v pnpm >/dev/null 2>&1 && echo "$(GREEN)✓ pnpm installed$(NC)" || echo "$(RED)✗ pnpm not found - Run: npm install -g pnpm$(NC)"
	@command -v python3 >/dev/null 2>&1 && echo "$(GREEN)✓ Python installed$(NC)" || echo "$(RED)✗ Python not found$(NC)"
	@command -v node >/dev/null 2>&1 && echo "$(GREEN)✓ Node.js installed$(NC)" || echo "$(RED)✗ Node.js not found$(NC)"
	@echo ""
	@echo "$(BLUE)Optional (for local LLM support):$(NC)"
	@command -v ollama >/dev/null 2>&1 && echo "$(GREEN)✓ Ollama installed$(NC)" || echo "$(YELLOW)○ Ollama not installed (optional - only needed for local models)$(NC)"

env: ## Create .env file from template
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file...$(NC)"; \
		touch .env; \
		echo "# Required" >> .env; \
		echo "BING_API_KEY=" >> .env; \
		echo "" >> .env; \
		echo "# Optional - API Configuration" >> .env; \
		echo "NEXT_PUBLIC_API_URL=http://localhost:8001" >> .env; \
		echo "NEXT_PUBLIC_LOCAL_MODE_ENABLED=true" >> .env; \
		echo "ENABLE_LOCAL_MODELS=True" >> .env; \
		echo "" >> .env; \
		echo "# Optional - Ollama Configuration" >> .env; \
		echo "OLLAMA_HOST=http://localhost:11434" >> .env; \
		echo "$(GREEN)✓ .env file created. Please add your BING_API_KEY.$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists$(NC)"; \
	fi

install: backend-install frontend-install ## Install all dependencies (backend + frontend)
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

backend-install: check-poetry ## Install backend dependencies
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	@poetry install
	@echo "$(GREEN)✓ Backend dependencies installed$(NC)"

frontend-install: check-pnpm ## Install frontend dependencies
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	@cd src/frontend && pnpm install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

check-poetry: ## Check if Poetry is installed
	@command -v poetry >/dev/null 2>&1 || { echo "$(RED)Error: Poetry is not installed. Install it from https://python-poetry.org/$(NC)"; exit 1; }

check-pnpm: ## Check if pnpm is installed
	@command -v pnpm >/dev/null 2>&1 || { echo "$(RED)Error: pnpm is not installed. Run: npm install -g pnpm$(NC)"; exit 1; }

# Docker Operations
up: ## Start all services with docker compose
	@echo "$(BLUE)Starting services...$(NC)"
	@docker compose -f docker-compose.dev.yaml up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "Frontend: http://localhost:3001"
	@echo "Backend:  http://localhost:8001"

down: ## Stop all services
	@echo "$(BLUE)Stopping services...$(NC)"
	@docker compose -f docker-compose.dev.yaml down
	@echo "$(GREEN)✓ Services stopped$(NC)"

build: ## Build docker images
	@echo "$(BLUE)Building docker images...$(NC)"
	@docker compose -f docker-compose.dev.yaml build
	@echo "$(GREEN)✓ Build complete$(NC)"

rebuild: down build up ## Rebuild and restart all services

logs: ## Show logs from all services
	@docker compose -f docker-compose.dev.yaml logs -f

logs-backend: ## Show backend logs
	@docker compose -f docker-compose.dev.yaml logs -f backend

logs-frontend: ## Show frontend logs
	@docker compose -f docker-compose.dev.yaml logs -f frontend

restart: ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	@docker compose -f docker-compose.dev.yaml restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

# Local Development (Recommended)
run: ## Run both backend and frontend locally (use Ctrl+C to stop)
	@echo "$(BLUE)Starting local development servers...$(NC)"
	@echo "$(YELLOW)Backend will run on http://localhost:8001$(NC)"
	@echo "$(YELLOW)Frontend will run on http://localhost:3001$(NC)"
	@echo ""
	@echo "$(YELLOW)Press Ctrl+C to stop both servers$(NC)"
	@echo ""
	@trap 'kill 0' EXIT; \
	$(MAKE) backend & \
	$(MAKE) frontend & \
	wait

backend: check-poetry ## Run backend locally
	@echo "$(BLUE)Starting backend server on http://localhost:8001$(NC)"
	@cd src/backend && poetry run python run.py

frontend: check-pnpm ## Run frontend locally
	@echo "$(BLUE)Starting frontend server on http://localhost:3001$(NC)"
	@cd src/frontend && pnpm dev -p 3001

dev: run ## Alias for 'run' command

# Production Deployment (Local, No Containers)
prod: build-prod ## Build and run in production mode locally (use Ctrl+C to stop)
	@echo "$(BLUE)Starting production servers locally...$(NC)"
	@echo "$(YELLOW)Backend will run on http://localhost:8100$(NC)"
	@echo "$(YELLOW)Frontend will run on http://localhost:3001$(NC)"
	@echo ""
	@echo "$(YELLOW)Press Ctrl+C to stop both servers$(NC)"
	@echo ""
	@trap 'kill 0' EXIT; \
	$(MAKE) backend-prod & \
	$(MAKE) frontend-prod & \
	wait

backend-prod: check-poetry ## Run backend in production mode
	@echo "$(BLUE)Starting backend in production mode on http://localhost:8100$(NC)"
	@cd src/backend && PORT=8100 poetry run python run.py

frontend-prod: check-pnpm ## Run frontend in production mode (requires build first)
	@echo "$(BLUE)Starting frontend in production mode on http://localhost:3001$(NC)"
	@if [ ! -d "src/frontend/.next" ]; then \
		echo "$(RED)Error: Production build not found. Run 'make build-prod' first.$(NC)"; \
		exit 1; \
	fi
	@cd src/frontend && pnpm start -p 3001

# API Generation
generate-api: ## Generate OpenAPI client for frontend
	@echo "$(BLUE)Generating API client...$(NC)"
	@cd src/frontend && pnpm run generate
	@echo "$(GREEN)✓ API client generated$(NC)"

# Testing
test: ## Run tests
	@echo "$(YELLOW)No tests configured yet$(NC)"

# Database Operations
db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	@cd src/backend && poetry run alembic upgrade head

db-rollback: ## Rollback database migration
	@echo "$(BLUE)Rolling back database migration...$(NC)"
	@cd src/backend && poetry run alembic downgrade -1

db-reset: ## Reset database
	@echo "$(YELLOW)Resetting database...$(NC)"
	@cd src/backend && poetry run alembic downgrade base && poetry run alembic upgrade head

# Cleaning
clean: clean-frontend clean-backend clean-docker ## Clean all build artifacts and caches

clean-frontend: ## Clean frontend build artifacts
	@echo "$(BLUE)Cleaning frontend...$(NC)"
	@cd src/frontend && rm -rf .next node_modules
	@echo "$(GREEN)✓ Frontend cleaned$(NC)"

clean-backend: ## Clean backend artifacts
	@echo "$(BLUE)Cleaning backend...$(NC)"
	@find src/backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find src/backend -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "$(GREEN)✓ Backend cleaned$(NC)"

clean-docker: ## Remove all docker containers and volumes
	@echo "$(YELLOW)Cleaning docker resources...$(NC)"
	@docker compose -f docker-compose.dev.yaml down -v
	@echo "$(GREEN)✓ Docker resources cleaned$(NC)"

# Code Quality
format: format-backend format-frontend ## Format all code

format-backend: ## Format backend code
	@echo "$(BLUE)Formatting backend code...$(NC)"
	@cd src/backend && poetry run black . || echo "$(YELLOW)black not installed, skipping$(NC)"
	@cd src/backend && poetry run isort . || echo "$(YELLOW)isort not installed, skipping$(NC)"

format-frontend: ## Format frontend code
	@echo "$(BLUE)Formatting frontend code...$(NC)"
	@cd src/frontend && pnpm exec prettier --write "src/**/*.{ts,tsx,js,jsx,json,css}" || echo "$(YELLOW)prettier not configured$(NC)"

lint: lint-backend lint-frontend ## Lint all code

lint-backend: ## Lint backend code
	@echo "$(BLUE)Linting backend code...$(NC)"
	@cd src/backend && poetry run flake8 . || echo "$(YELLOW)flake8 not installed, skipping$(NC)"
	@cd src/backend && poetry run mypy . || echo "$(YELLOW)mypy not installed, skipping$(NC)"

lint-frontend: ## Lint frontend code
	@echo "$(BLUE)Linting frontend code...$(NC)"
	@cd src/frontend && pnpm run lint

# Status
status: ## Show status of services
	@echo "$(BLUE)Docker Services Status:$(NC)"
	@docker compose -f docker-compose.dev.yaml ps

ps: status ## Alias for status

# Ollama (Optional - for local LLM support)
ollama-pull: ## Pull recommended Ollama models (optional - for local LLM support)
	@echo "$(BLUE)Pulling Ollama models...$(NC)"
	@command -v ollama >/dev/null 2>&1 || { echo "$(RED)Error: Ollama is not installed. Install it from https://ollama.com/download$(NC)"; exit 1; }
	@ollama pull llama3
	@ollama pull mistral
	@ollama pull gemma
	@echo "$(GREEN)✓ Models downloaded$(NC)"

# Production Build
build-prod: ## Build for production
	@echo "$(BLUE)Building for production...$(NC)"
	@cd src/frontend && pnpm run build
	@echo "$(GREEN)✓ Production build complete$(NC)"

