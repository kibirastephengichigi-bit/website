#!/usr/bin/env bash

# Exit on error but handle failures gracefully
set -eo pipefail

# Configuration with fallbacks
DEFAULT_APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${APP_DIR:-${1:-$DEFAULT_APP_DIR}}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
DEPLOY_MODE="${DEPLOY_MODE:-auto}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-devmain-frontend.service}"
BACKEND_SERVICE="${BACKEND_SERVICE:-devmain-backend.service}"
NODE_ENV="${NODE_ENV:-production}"
NPM_BIN="${NPM_BIN:-npm}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

# Logging function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
}

# Environment validation
validate_environment() {
  log "Validating deployment environment..."
  
  # Check if we're in the right directory
  if [ ! -d "$APP_DIR" ]; then
    error "Application directory $APP_DIR does not exist"
    exit 1
  fi
  
  cd "$APP_DIR"
  
  if [ ! -d .git ]; then
    error "Expected a git checkout in $APP_DIR"
    exit 1
  fi
  
  # Check for required commands
  local missing_commands=()
  
  if ! command -v git >/dev/null 2>&1; then
    missing_commands+=("git")
  fi
  
  if [ "$DEPLOY_MODE" = "docker" ] || [ "$DEPLOY_MODE" = "auto" ]; then
    if ! command -v docker >/dev/null 2>&1; then
      missing_commands+=("docker")
    fi
  fi
  
  if [ "$DEPLOY_MODE" = "systemd" ] || [ "$DEPLOY_MODE" = "auto" ]; then
    if ! command -v npm >/dev/null 2>&1; then
      missing_commands+=("npm")
    fi
    if ! command -v node >/dev/null 2>&1; then
      missing_commands+=("node")
    fi
  fi
  
  if [ ${#missing_commands[@]} -gt 0 ]; then
    error "Missing required commands: ${missing_commands[*]}"
    error "Please install missing dependencies before deploying"
    exit 1
  fi
  
  log "Environment validation passed"
}

git_sync() {
  log "Fetching latest code for ${DEPLOY_BRANCH}..."
  
  if ! git fetch origin "$DEPLOY_BRANCH"; then
    error "Failed to fetch from origin for branch $DEPLOY_BRANCH"
    exit 1
  fi

  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  if [ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]; then
    log "Switching from $CURRENT_BRANCH to $DEPLOY_BRANCH"
    if ! git checkout "$DEPLOY_BRANCH"; then
      error "Failed to checkout branch $DEPLOY_BRANCH"
      exit 1
    fi
  fi

  log "Pulling latest changes..."
  if ! git pull --ff-only origin "$DEPLOY_BRANCH"; then
    error "Failed to pull latest changes (possible non-fast-forward)"
    exit 1
  fi
  
  log "Git sync completed successfully"
}

docker_compose_cmd() {
  if command -v docker >/dev/null 2>&1; then
    if docker compose version >/dev/null 2>&1; then
      printf 'docker compose'
      return 0
    fi
  fi
  if command -v docker-compose >/dev/null 2>&1; then
    printf 'docker-compose'
    return 0
  fi
  return 1
}

deploy_with_docker() {
  log "Starting Docker deployment..."
  
  if [ ! -f docker-compose.yml ]; then
    error "docker-compose.yml not found in $APP_DIR"
    exit 1
  fi

  local compose_cmd
  if ! compose_cmd="$(docker_compose_cmd)"; then
    error "Docker Compose is not installed on the target server"
    exit 1
  fi

  git_sync

  log "Installing Node dependencies for build..."
  # Set npm configuration for faster installs
  export npm_config_cache=/tmp/npm-cache
  export npm_config_prefer_offline=true
  export npm_config_audit=false
  export npm_config_fund=false
  
  # Clean npm cache first
  log "Cleaning npm cache..."
  npm cache clean --force || true
  
  # Try npm ci with retry logic
  local max_retries=3
  local retry_count=0
  local install_success=false
  
  while [ $retry_count -lt $max_retries ] && [ "$install_success" = false ]; do
    log "Attempting npm ci (attempt $((retry_count + 1))/$max_retries)..."
    
    if timeout 300 npm ci --prefer-offline --no-audit --no-fund; then
      log "Dependencies installed successfully with npm ci"
      install_success=true
    else
      retry_count=$((retry_count + 1))
      if [ $retry_count -lt $max_retries ]; then
        log "npm ci failed, retrying in 10 seconds..."
        sleep 10
      fi
    fi
  done
  
  # Fallback to npm install if npm ci failed
  if [ "$install_success" = false ]; then
    log "npm ci failed, trying npm install as fallback..."
    if timeout 300 npm install --prefer-offline --no-audit --no-fund; then
      log "Dependencies installed successfully with npm install"
      install_success=true
    else
      error "Failed to install Node dependencies with both npm ci and npm install"
      exit 1
    fi
  fi

  log "Generating Prisma client..."
  if ! npx prisma generate; then
    error "Failed to generate Prisma client"
    exit 1
  fi

  log "Building Next.js application..."
  if ! NODE_ENV="$NODE_ENV" npm run build; then
    error "Failed to build Next.js application"
    exit 1
  fi

  log "Building and starting Docker stack..."
  if ! $compose_cmd -f docker-compose.yml up -d --build; then
    error "Docker build/start failed"
    exit 1
  fi

  # Wait for containers to be ready
  log "Waiting for containers to initialize..."
  sleep 10

  if [ -n "${DATABASE_URL:-}" ]; then
    log "Running Prisma migrations inside Docker..."
    if ! $compose_cmd -f docker-compose.yml exec -T app npx prisma migrate deploy; then
      error "Prisma migration failed"
      exit 1
    fi
  else
    log "DATABASE_URL is not set. Skipping prisma migrate deploy."
  fi

  # Health check
  log "Performing health check..."
  if $compose_cmd -f docker-compose.yml ps | grep -q "Up"; then
    log "✅ Docker containers are running"
    
    # Try to check if the app responds
    log "Checking application health..."
    if $compose_cmd -f docker-compose.yml exec -T app curl -f http://localhost:3000 >/dev/null 2>&1; then
      log "✅ Application health check passed"
    else
      log "⚠️ Application health check failed, but containers are running"
    fi
  else
    error "❌ Docker containers failed to start"
    exit 1
  fi

  log "🚀 Docker deployment completed successfully"
}

deploy_with_systemd() {
  log "Starting systemd deployment..."
  
  if ! systemctl list-unit-files "$FRONTEND_SERVICE" >/dev/null 2>&1 || ! systemctl list-unit-files "$BACKEND_SERVICE" >/dev/null 2>&1; then
    error "Systemd service files are not installed yet"
    error "Run: APP_DIR=$APP_DIR ./scripts/install-systemd.sh"
    exit 1
  fi

  git_sync

  log "Installing Node dependencies..."
  if ! "$NPM_BIN" ci; then
    error "Failed to install Node dependencies"
    exit 1
  fi

  log "Generating Prisma client..."
  if ! npx prisma generate; then
    error "Failed to generate Prisma client"
    exit 1
  fi

  log "Building Next.js frontend..."
  if ! NODE_ENV="$NODE_ENV" "$NPM_BIN" run build; then
    error "Failed to build Next.js frontend"
    exit 1
  fi

  if [ -n "${DATABASE_URL:-}" ]; then
    log "Running database migrations..."
    if ! npx prisma migrate deploy; then
      error "Database migrations failed"
      exit 1
    fi
  else
    log "DATABASE_URL is not set. Skipping prisma migrate deploy."
  fi

  # Check backend if it exists
  if [ -d "backend" ]; then
    log "Checking backend entry point..."
    "$PYTHON_BIN" -m backend --help >/dev/null 2>&1 || log "Backend check failed, but continuing..."
  fi

  log "Restarting systemd services..."
  if ! sudo systemctl restart "$BACKEND_SERVICE"; then
    error "Failed to restart backend service"
    exit 1
  fi
  
  if ! sudo systemctl restart "$FRONTEND_SERVICE"; then
    error "Failed to restart frontend service"
    exit 1
  fi

  log "Waiting for services to become active..."
  local retry_count=0
  local max_retries=10
  
  while [ $retry_count -lt $max_retries ]; do
    if sudo systemctl is-active --quiet "$BACKEND_SERVICE" && sudo systemctl is-active --quiet "$FRONTEND_SERVICE"; then
      log "✅ Both services are active"
      break
    fi
    
    retry_count=$((retry_count + 1))
    log "Waiting for services... (attempt $retry_count/$max_retries)"
    sleep 3
  done
  
  if [ $retry_count -eq $max_retries ]; then
    error "❌ Services failed to become active within expected time"
    exit 1
  fi

  log "🚀 Systemd deployment completed successfully"
}

# Main execution
main() {
  log "🚀 Starting deployment process..."
  log "Configuration:"
  log "  - APP_DIR: $APP_DIR"
  log "  - DEPLOY_BRANCH: $DEPLOY_BRANCH"
  log "  - DEPLOY_MODE: $DEPLOY_MODE"
  log "  - NODE_ENV: $NODE_ENV"
  
  # Validate environment first
  validate_environment
  
  # Determine deployment mode if auto
  if [ "$DEPLOY_MODE" = "auto" ]; then
    log "Auto-detecting deployment mode..."
    if docker_compose_cmd >/dev/null 2>&1 && [ -f docker-compose.yml ]; then
      DEPLOY_MODE="docker"
      log "✅ Detected Docker deployment mode"
    else
      DEPLOY_MODE="systemd"
      log "✅ Detected Systemd deployment mode"
    fi
  fi
  
  log "🎯 Using deployment mode: $DEPLOY_MODE"
  
  case "$DEPLOY_MODE" in
    docker)
      deploy_with_docker
      ;;
    systemd)
      deploy_with_systemd
      ;;
    *)
      error "Unknown DEPLOY_MODE: $DEPLOY_MODE"
      error "Supported modes: docker, systemd, auto"
      exit 1
      ;;
  esac
  
  log "🎉 Deployment completed successfully!"
}

# Run main function
main
