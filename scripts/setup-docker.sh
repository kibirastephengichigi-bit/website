#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
NGINX_TEMPLATE="$PROJECT_ROOT/deploy/nginx/website-main.conf"
DOMAIN_NAME="${DOMAIN_NAME:-devmain.co.ke}"
NGINX_AVAILABLE="/etc/nginx/sites-available/website-main.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/website-main.conf"

log() {
  printf '[setup-docker] %s\n' "$1"
}

have_command() {
  command -v "$1" >/dev/null 2>&1
}

need_sudo() {
  if [ "$(id -u)" -eq 0 ]; then
    return 1
  fi
  return 0
}

run_root() {
  if need_sudo; then
    sudo "$@"
  else
    "$@"
  fi
}

install_docker() {
  log "Docker not found. Trying to install it with the system package manager."

  if have_command apt-get; then
    run_root apt-get update
    run_root apt-get install -y docker.io docker-compose-plugin
    return
  fi

  if have_command dnf; then
    run_root dnf install -y docker docker-compose-plugin
    return
  fi

  if have_command yum; then
    run_root yum install -y docker docker-compose-plugin
    return
  fi

  if have_command pacman; then
    run_root pacman -Sy --noconfirm docker docker-compose
    return
  fi

  if have_command zypper; then
    run_root zypper install -y docker docker-compose
    return
  fi

  log "No supported package manager was found. Install Docker manually, then rerun this script."
  exit 1
}

install_nginx() {
  log "Nginx not found. Trying to install it with the system package manager."

  if have_command apt-get; then
    run_root apt-get update
    run_root apt-get install -y nginx
    return
  fi

  if have_command dnf; then
    run_root dnf install -y nginx
    return
  fi

  if have_command yum; then
    run_root yum install -y nginx
    return
  fi

  if have_command pacman; then
    run_root pacman -Sy --noconfirm nginx
    return
  fi

  if have_command zypper; then
    run_root zypper install -y nginx
    return
  fi

  log "No supported package manager was found for Nginx. Install it manually, then rerun this script."
  exit 1
}

start_docker_service() {
  if have_command systemctl; then
    log "Starting Docker with systemd."
    run_root systemctl enable --now docker
    return
  fi

  if have_command service; then
    log "Starting Docker with the service command."
    run_root service docker start
    return
  fi

  log "No supported service manager found. Start the Docker daemon manually."
  exit 1
}

ensure_docker() {
  if ! have_command docker; then
    install_docker
  fi

  if ! docker info >/dev/null 2>&1; then
    log "Docker is installed but the daemon is not available."
    start_docker_service
  fi

  if ! docker info >/dev/null 2>&1; then
    log "Docker is still unavailable after trying to start the daemon."
    exit 1
  fi
}

ensure_compose() {
  if docker compose version >/dev/null 2>&1; then
    return
  fi

  log "Docker Compose plugin is missing. Trying to install it."

  if have_command apt-get; then
    run_root apt-get update
    run_root apt-get install -y docker-compose-plugin
    return
  fi

  if have_command dnf; then
    run_root dnf install -y docker-compose-plugin
    return
  fi

  if have_command yum; then
    run_root yum install -y docker-compose-plugin
    return
  fi

  if have_command pacman; then
    run_root pacman -Sy --noconfirm docker-compose
    return
  fi

  if have_command zypper; then
    run_root zypper install -y docker-compose
    return
  fi

  log "Docker Compose is not available. Install it manually, then rerun this script."
  exit 1
}

ensure_nginx() {
  if ! have_command nginx; then
    install_nginx
  fi
}

setup_nginx_config() {
  if [ ! -f "$NGINX_TEMPLATE" ]; then
    log "Could not find $NGINX_TEMPLATE"
    exit 1
  fi

  local rendered_config
  rendered_config="$(mktemp)"
  sed "s/server_name devmain.co.ke www.devmain.co.ke;/server_name $DOMAIN_NAME www.$DOMAIN_NAME;/" "$NGINX_TEMPLATE" > "$rendered_config"

  if [ -d /etc/nginx/sites-available ] && [ -d /etc/nginx/sites-enabled ]; then
    log "Installing Nginx site config."
    run_root cp "$rendered_config" "$NGINX_AVAILABLE"
    run_root ln -sfn "$NGINX_AVAILABLE" "$NGINX_ENABLED"
  elif [ -d /etc/nginx/conf.d ]; then
    log "Installing Nginx conf.d config."
    run_root cp "$rendered_config" /etc/nginx/conf.d/website-main.conf
  else
    rm -f "$rendered_config"
    log "Unsupported Nginx layout. Copy $NGINX_TEMPLATE into your Nginx config manually."
    exit 1
  fi

  rm -f "$rendered_config"

  if [ -f /etc/nginx/sites-enabled/default ]; then
    run_root rm -f /etc/nginx/sites-enabled/default
  fi
}

start_nginx_service() {
  if have_command systemctl; then
    log "Enabling and starting Nginx with systemd."
    run_root systemctl enable --now nginx
    run_root systemctl reload nginx
    return
  fi

  if have_command service; then
    log "Starting Nginx with the service command."
    run_root service nginx start
    return
  fi

  log "No supported service manager found for Nginx. Start it manually."
  exit 1
}

verify_nginx_config() {
  log "Validating Nginx configuration."
  run_root nginx -t
}

run_stack() {
  if [ ! -f "$COMPOSE_FILE" ]; then
    log "Could not find $COMPOSE_FILE"
    exit 1
  fi

  log "Starting the website stack from $PROJECT_ROOT"
  cd "$PROJECT_ROOT"
  docker compose up -d --build
  log "Website should be available at http://localhost:3001"
}

main() {
  ensure_docker
  ensure_compose
  run_stack
  ensure_nginx
  setup_nginx_config
  verify_nginx_config
  start_nginx_service
  log "Nginx reverse proxy is configured for http://$DOMAIN_NAME and forwards to http://localhost:3001"
}

main "$@"
