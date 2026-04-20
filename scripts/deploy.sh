#!/usr/bin/env bash

set -Eeuo pipefail

DEFAULT_APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${APP_DIR:-${1:-$DEFAULT_APP_DIR}}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
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

if ! systemctl list-unit-files "$FRONTEND_SERVICE" >/dev/null 2>&1 || ! systemctl list-unit-files "$BACKEND_SERVICE" >/dev/null 2>&1; then
  echo "Systemd service files are not installed yet."
  echo "Run: APP_DIR=$APP_DIR ./scripts/install-systemd.sh"
  exit 1
fi

echo "Fetching latest code for ${DEPLOY_BRANCH}..."
git fetch origin "$DEPLOY_BRANCH"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]; then
  git checkout "$DEPLOY_BRANCH"
fi

git pull --ff-only origin "$DEPLOY_BRANCH"

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
