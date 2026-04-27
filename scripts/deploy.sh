#!/usr/bin/env bash

set -Eeuo pipefail

DEFAULT_APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${APP_DIR:-${1:-$DEFAULT_APP_DIR}}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
DEPLOY_MODE="${DEPLOY_MODE:-auto}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-devmain-frontend.service}"
BACKEND_SERVICE="${BACKEND_SERVICE:-devmain-backend.service}"
NODE_ENV="${NODE_ENV:-production}"
NPM_BIN="${NPM_BIN:-/usr/bin/npm}"
PYTHON_BIN="${PYTHON_BIN:-/usr/bin/python3}"

cd "$APP_DIR"

if [ ! -d .git ]; then
  echo "Expected a git checkout in $APP_DIR."
  exit 1
fi

git_sync() {
  echo "Fetching latest code for ${DEPLOY_BRANCH}..."
  git fetch origin "$DEPLOY_BRANCH"

  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  if [ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]; then
    git checkout "$DEPLOY_BRANCH"
  fi

  git pull --ff-only origin "$DEPLOY_BRANCH"
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
  if [ ! -f docker-compose.yml ]; then
    echo "docker-compose.yml not found in $APP_DIR."
    exit 1
  fi

  local compose_cmd
  compose_cmd="$(docker_compose_cmd)" || {
    echo "Docker Compose is not installed on the target server."
    exit 1
  }

  git_sync

  echo "Building and starting Docker stack..."
  $compose_cmd -f docker-compose.yml up -d --build

  if [ -n "${DATABASE_URL:-}" ]; then
    echo "Running Prisma migrations inside Docker..."
    $compose_cmd -f docker-compose.yml exec -T app npx prisma migrate deploy
  else
    echo "DATABASE_URL is not set in the deploy shell. Skipping prisma migrate deploy."
  fi

  echo "Deployment finished successfully."
}

deploy_with_systemd() {
  if ! systemctl list-unit-files "$FRONTEND_SERVICE" >/dev/null 2>&1 || ! systemctl list-unit-files "$BACKEND_SERVICE" >/dev/null 2>&1; then
    echo "Systemd service files are not installed yet."
    echo "Run: APP_DIR=$APP_DIR ./scripts/install-systemd.sh"
    exit 1
  fi

  git_sync

  echo "Installing Node dependencies..."
  "$NPM_BIN" ci

  echo "Generating Prisma client..."
  npx prisma generate

  echo "Building Next.js frontend..."
  NODE_ENV="$NODE_ENV" "$NPM_BIN" run build

  if [ -n "${DATABASE_URL:-}" ]; then
    echo "Running database migrations..."
    npx prisma migrate deploy
  else
    echo "DATABASE_URL is not set in the deploy shell. Skipping prisma migrate deploy."
  fi

  echo "Checking backend entry point..."
  "$PYTHON_BIN" -m backend --help >/dev/null 2>&1 || true

  echo "Restarting systemd services..."
  sudo systemctl restart "$BACKEND_SERVICE"
  sudo systemctl restart "$FRONTEND_SERVICE"

  echo "Waiting for services to become active..."
  sudo systemctl is-active --quiet "$BACKEND_SERVICE"
  sudo systemctl is-active --quiet "$FRONTEND_SERVICE"

  echo "Deployment finished successfully."
}

if [ "$DEPLOY_MODE" = "auto" ]; then
  if docker_compose_cmd >/dev/null 2>&1 && [ -f docker-compose.yml ]; then
    DEPLOY_MODE="docker"
  else
    DEPLOY_MODE="systemd"
  fi
fi

case "$DEPLOY_MODE" in
  docker)
    deploy_with_docker
    ;;
  systemd)
    deploy_with_systemd
    ;;
  *)
    echo "Unknown DEPLOY_MODE: $DEPLOY_MODE"
    exit 1
    ;;
esac
