#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:?APP_DIR is required}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker-compose)
else
  echo "Docker Compose is not installed on the server."
  exit 1
fi

cd "$APP_DIR"

if [ ! -d .git ]; then
  echo "Expected a git checkout in $APP_DIR."
  exit 1
fi

echo "Fetching latest code for ${DEPLOY_BRANCH}..."
git fetch origin "$DEPLOY_BRANCH"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]; then
  git checkout "$DEPLOY_BRANCH"
fi

git pull --ff-only origin "$DEPLOY_BRANCH"

echo "Building containers..."
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" build app

echo "Starting database..."
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" up -d db

echo "Running database migrations..."
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" run --rm app npx prisma migrate deploy

echo "Starting application..."
"${DOCKER_COMPOSE[@]}" -f "$COMPOSE_FILE" up -d --remove-orphans app

echo "Deployment finished successfully."
