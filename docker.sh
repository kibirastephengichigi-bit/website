#!/bin/bash

# Docker helper script for Stephen Asatsa Website
# Usage: ./docker.sh [command]

set -e

PROJECT_NAME="stephenasatsa"
COMPOSE_FILE="docker-compose.yml"

case "${1:-help}" in
    "build")
        echo "Building Docker images..."
        docker-compose -f $COMPOSE_FILE build
        ;;
    "up")
        echo "Starting services..."
        docker-compose -f $COMPOSE_FILE up -d
        ;;
    "up-admin")
        echo "Starting services with admin backend..."
        docker-compose -f $COMPOSE_FILE --profile admin up -d
        ;;
    "down")
        echo "Stopping services..."
        docker-compose -f $COMPOSE_FILE down
        ;;
    "logs")
        service="${2:-app}"
        echo "Showing logs for $service..."
        docker-compose -f $COMPOSE_FILE logs -f $service
        ;;
    "restart")
        echo "Restarting services..."
        docker-compose -f $COMPOSE_FILE restart
        ;;
    "clean")
        echo "Cleaning up containers and volumes..."
        docker-compose -f $COMPOSE_FILE down -v
        docker system prune -f
        ;;
    "db-migrate")
        echo "Running database migrations..."
        docker-compose -f $COMPOSE_FILE exec app npx prisma migrate deploy
        ;;
    "db-seed")
        echo "Seeding database..."
        docker-compose -f $COMPOSE_FILE exec app npx prisma db seed
        ;;
    "shell")
        service="${2:-app}"
        echo "Opening shell in $service container..."
        docker-compose -f $COMPOSE_FILE exec $service sh
        ;;
    "status")
        echo "Service status:"
        docker-compose -f $COMPOSE_FILE ps
        ;;
    "help"|*)
        echo "Docker helper script for Stephen Asatsa Website"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  build      - Build Docker images"
        echo "  up         - Start services (Next.js + PostgreSQL)"
        echo "  up-admin   - Start services with admin backend"
        echo "  down       - Stop services"
        echo "  logs       - Show logs (use 'logs app' or 'logs db')"
        echo "  restart    - Restart services"
        echo "  clean      - Clean up containers and volumes"
        echo "  db-migrate - Run database migrations"
        echo "  db-seed    - Seed database with initial data"
        echo "  shell      - Open shell in container (use 'shell app' or 'shell db')"
        echo "  status     - Show service status"
        echo "  help       - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 build && $0 up"
        echo "  $0 logs app"
        echo "  $0 shell db"
        ;;
esac