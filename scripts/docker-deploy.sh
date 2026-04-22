#!/bin/bash

set -Eeuo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Configuration
DEFAULT_APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${APP_DIR:-${1:-$DEFAULT_APP_DIR}}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env}"

cd "$APP_DIR"

log "Starting Docker deployment process..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed"
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    log_error "Environment file $ENV_FILE not found"
    exit 1
fi

# Check if docker-compose.prod.yml exists
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Docker Compose file $COMPOSE_FILE not found"
    exit 1
fi

# Function to check if container is healthy
wait_for_healthy() {
    local container_name=$1
    local max_attempts=30
    local attempt=1
    
    log "Waiting for $container_name to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "none")
        if [ "$health" = "healthy" ]; then
            log "$container_name is healthy"
            return 0
        fi
        
        if [ "$health" = "unhealthy" ]; then
            log_error "$container_name is unhealthy"
            docker logs "$container_name" --tail 20
            return 1
        fi
        
        log "Attempt $attempt/$max_attempts: $container_name status is $health"
        sleep 10
        attempt=$((attempt + 1))
    done
    
    log_error "$container_name did not become healthy within $max_attempts attempts"
    docker logs "$container_name" --tail 20
    return 1
}

# Fetch latest code
log "Fetching latest code for ${DEPLOY_BRANCH}..."
git fetch origin "$DEPLOY_BRANCH"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]; then
    log "Switching to branch $DEPLOY_BRANCH..."
    git checkout "$DEPLOY_BRANCH"
fi

log "Pulling latest changes..."
git pull --ff-only origin "$DEPLOY_BRANCH"

# Create necessary directories
log "Creating necessary directories..."
mkdir -p nginx/conf.d nginx/sites-available ssl backups logs uploads

# Backup database before deployment (if containers are running)
if docker-compose -f "$COMPOSE_FILE" ps -q db | grep -q .; then
    log "Backing up database..."
    backup_file="backups/backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose -f "$COMPOSE_FILE" exec -T db pg_dump -U stephenasatsa_user stephenasatsa > "$backup_file"
    log "Database backup created: $backup_file"
fi

# Build and deploy
log "Building and deploying containers..."

# Stop existing containers
log "Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" down

# Pull latest images
log "Pulling latest images..."
docker-compose -f "$COMPOSE_FILE" pull

# Build new images
log "Building new images..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

# Start services
log "Starting services..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for database to be healthy
log "Waiting for database to be ready..."
if ! wait_for_healthy "devmain-postgres"; then
    log_error "Database failed to start properly"
    exit 1
fi

# Run database migrations
log "Running database migrations..."
docker-compose -f "$COMPOSE_FILE" exec app npx prisma migrate deploy

# Wait for application containers to be healthy
log "Waiting for applications to be ready..."
wait_for_healthy "devmain-frontend" || exit 1
wait_for_healthy "devmain-backend" || exit 1

# Verify services are responding
log "Verifying services are responding..."

# Check frontend health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    log "Frontend health check passed"
else
    log_warning "Frontend health check failed"
fi

# Check backend health
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    log "Backend health check passed"
else
    log_warning "Backend health check failed"
fi

# Show container status
log "Container status:"
docker-compose -f "$COMPOSE_FILE" ps

# Show recent logs
log "Recent application logs:"
docker-compose -f "$COMPOSE_FILE" logs --tail=20 app

# Cleanup old images
log "Cleaning up old Docker images..."
docker image prune -f

log "Docker deployment completed successfully!"
log "Application URLs:"
log "  Frontend: http://localhost:3000"
log "  Backend API: http://localhost:8000"
log "  Nginx: http://localhost"

# Display resource usage
log "Resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
