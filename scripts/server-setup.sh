#!/usr/bin/env bash

# Comprehensive server setup script
# Installs all dependencies, clones repo, configures systemd, and starts services
# Usage: bash server-setup.sh [options]
# Options:
#   --repo-url <url>         Git repository URL (required)
#   --app-dir <path>         Installation directory (default: ~/website)
#   --domain <domain>        Domain name (default: devmain.co.ke)
#   --user <username>        Service user (default: current user)
#   --install-nginx          Install and configure Nginx
#   --install-docker         Install Docker (optional, for Docker Compose deployment)
#   --start-services         Start systemd services after installation

set -euo pipefail

# Configuration
REPO_URL="${REPO_URL:-}"
APP_DIR="${APP_DIR:-$HOME/website}"
DOMAIN_NAME="${DOMAIN_NAME:-devmain.co.ke}"
SERVICE_USER="${SERVICE_USER:-$(id -un)}"
INSTALL_NGINX="${INSTALL_NGINX:-0}"
INSTALL_DOCKER="${INSTALL_DOCKER:-0}"
START_SERVICES="${START_SERVICES:-0}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
ADMIN_API_PORT="${ADMIN_API_PORT:-8000}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
  printf "${GREEN}[setup]${NC} %s\n" "$1"
}

error() {
  printf "${RED}[error]${NC} %s\n" "$1" >&2
  exit 1
}

warn() {
  printf "${YELLOW}[warn]${NC} %s\n" "$1"
}

have_command() {
  command -v "$1" >/dev/null 2>&1
}

need_sudo() {
  [ "$(id -u)" -ne 0 ]
}

run_root() {
  if need_sudo; then
    sudo "$@"
  else
    "$@"
  fi
}

# Parse command-line arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --repo-url)
      REPO_URL="$2"
      shift 2
      ;;
    --app-dir)
      APP_DIR="$2"
      shift 2
      ;;
    --domain)
      DOMAIN_NAME="$2"
      shift 2
      ;;
    --user)
      SERVICE_USER="$2"
      shift 2
      ;;
    --install-nginx)
      INSTALL_NGINX=1
      shift
      ;;
    --install-docker)
      INSTALL_DOCKER=1
      shift
      ;;
    --start-services)
      START_SERVICES=1
      shift
      ;;
    --help)
      cat << 'EOF'
Comprehensive server setup for Dr. Stephen Asatsa Website

Usage: bash server-setup.sh [options]

Options:
  --repo-url <url>         Git repository URL (required)
  --app-dir <path>         Installation directory (default: ~/website)
  --domain <domain>        Domain name (default: devmain.co.ke)
  --user <username>        Service user (default: current user)
  --install-nginx          Install and configure Nginx
  --install-docker         Install Docker and Docker Compose
  --start-services         Start systemd services after installation
  --help                   Show this help message

Example:
  bash server-setup.sh \\
    --repo-url https://github.com/kibirastephengichigi-bit/website.git \\
    --app-dir ~/website \\
    --domain devmain.co.ke \\
    --user codecrafter \\
    --install-nginx \\
    --install-docker \\
    --start-services
EOF
      exit 0
      ;;
    *)
      error "Unknown option: $1"
      ;;
  esac
done

# Validate required arguments
if [ -z "$REPO_URL" ]; then
  error "Repository URL is required. Use --repo-url <url>"
fi

log "Server setup starting..."
log "  Repository: $REPO_URL"
log "  App directory: $APP_DIR"
log "  Domain: $DOMAIN_NAME"
log "  Service user: $SERVICE_USER"
log "  Install Nginx: $INSTALL_NGINX"
log "  Install Docker: $INSTALL_DOCKER"
log "  Start services: $START_SERVICES"

# Update system packages
log "Updating system packages..."
run_root apt-get update
run_root apt-get upgrade -y

# Install required system dependencies
log "Installing system dependencies..."
run_root apt-get install -y \
  git \
  curl \
  wget \
  build-essential \
  python3 \
  python3-pip \
  nodejs \
  npm

# Create app directory
log "Creating app directory: $APP_DIR"
mkdir -p "$APP_DIR"

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
  log "Repository already exists. Updating..."
  cd "$APP_DIR"
  git fetch origin
  git reset --hard origin/main
else
  log "Cloning repository..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# Install Node.js dependencies
log "Installing Node.js dependencies..."
npm ci

# Generate Prisma client
log "Generating Prisma client..."
npx prisma generate

# Build the application
log "Building Next.js application..."
npm run build

# Install Docker if requested
if [ "$INSTALL_DOCKER" -eq 1 ]; then
  if ! have_command docker; then
    log "Installing Docker..."
    run_root apt-get install -y \
      ca-certificates \
      curl \
      gnupg \
      lsb-release

    run_root mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | \
      run_root gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/debian \
      $(lsb_release -cs) stable" | \
      run_root tee /etc/apt/sources.list.d/docker.list > /dev/null

    run_root apt-get update
    run_root apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    run_root systemctl enable docker
    run_root systemctl start docker

    if need_sudo; then
      run_root usermod -aG docker "$SERVICE_USER"
      warn "Added $SERVICE_USER to docker group. Log out and back in for changes to take effect."
    fi
  else
    log "Docker is already installed."
  fi
fi

# Install Nginx if requested
if [ "$INSTALL_NGINX" -eq 1 ]; then
  if ! have_command nginx; then
    log "Installing Nginx..."
    run_root apt-get install -y nginx

    log "Configuring Nginx..."
    NGINX_CONFIG="/tmp/website-main.conf.$$"
    cat > "$NGINX_CONFIG" << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name devmain.co.ke www.devmain.co.ke;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

    # Replace domain if different from default
    if [ "$DOMAIN_NAME" != "devmain.co.ke" ]; then
      sed -i "s/devmain.co.ke www.devmain.co.ke/$DOMAIN_NAME www.$DOMAIN_NAME/" "$NGINX_CONFIG"
    fi

    run_root cp "$NGINX_CONFIG" /etc/nginx/sites-available/website-main.conf
    run_root ln -sfn /etc/nginx/sites-available/website-main.conf /etc/nginx/sites-enabled/website-main.conf

    # Remove default site if it exists
    if [ -f /etc/nginx/sites-enabled/default ]; then
      run_root rm -f /etc/nginx/sites-enabled/default
    fi

    # Test and reload Nginx
    run_root nginx -t
    run_root systemctl enable nginx
    run_root systemctl start nginx
    run_root systemctl reload nginx

    log "Nginx configured and started."
    rm -f "$NGINX_CONFIG"
  else
    log "Nginx is already installed."
  fi
fi

# Install systemd services
log "Installing systemd services..."
FRONTEND_SERVICE="devmain-frontend.service"
BACKEND_SERVICE="devmain-backend.service"

FRONTEND_UNIT="$(mktemp)"
BACKEND_UNIT="$(mktemp)"

cat > "$FRONTEND_UNIT" << EOF
[Unit]
Description=DevMain Frontend Next.js Service
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=-$APP_DIR/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=$FRONTEND_PORT

[Install]
WantedBy=multi-user.target
EOF

cat > "$BACKEND_UNIT" << EOF
[Unit]
Description=DevMain Backend API Service
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$APP_DIR
EnvironmentFile=-$APP_DIR/.env
ExecStart=/usr/bin/python3 -m backend
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1
Environment=ADMIN_API_PORT=$ADMIN_API_PORT
Environment=ADMIN_ALLOWED_ORIGIN=https://$DOMAIN_NAME

[Install]
WantedBy=multi-user.target
EOF

run_root cp "$FRONTEND_UNIT" "/etc/systemd/system/$FRONTEND_SERVICE"
run_root cp "$BACKEND_UNIT" "/etc/systemd/system/$BACKEND_SERVICE"
run_root systemctl daemon-reload
run_root systemctl enable "$FRONTEND_SERVICE" "$BACKEND_SERVICE"

rm -f "$FRONTEND_UNIT" "$BACKEND_UNIT"

log "Systemd services installed:"
log "  $FRONTEND_SERVICE"
log "  $BACKEND_SERVICE"

# Create .env if it doesn't exist
if [ ! -f "$APP_DIR/.env" ]; then
  log "Creating .env file (you must edit this with production values)..."
  cat > "$APP_DIR/.env" << 'ENV_EOF'
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/stephenasatsa"

# NextAuth Configuration
NEXTAUTH_URL="https://devmain.co.ke"
NEXTAUTH_SECRET="CHANGE_THIS_TO_A_SECURE_RANDOM_STRING"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://devmain.co.ke"

# Admin Configuration
ADMIN_EMAIL="admin@devmain.co.ke"
ADMIN_PASSWORD="CHANGE_THIS"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
ENV_EOF
  warn ".env created. Please edit $APP_DIR/.env with your production values."
fi

# Start services if requested
if [ "$START_SERVICES" -eq 1 ]; then
  log "Starting systemd services..."
  run_root systemctl start "$BACKEND_SERVICE"
  run_root systemctl start "$FRONTEND_SERVICE"

  log "Waiting for services to start..."
  sleep 3

  log "Service status:"
  run_root systemctl status "$BACKEND_SERVICE" --no-pager || true
  run_root systemctl status "$FRONTEND_SERVICE" --no-pager || true
fi

log "Server setup completed successfully!"
log ""
log "Next steps:"
log "  1. Edit $APP_DIR/.env with your production configuration"
log "  2. Start services: sudo systemctl start $BACKEND_SERVICE $FRONTEND_SERVICE"
log "  3. View logs: sudo journalctl -u $FRONTEND_SERVICE -f"
log "  4. Website will be available at https://$DOMAIN_NAME"
log ""
log "GitHub Actions deployment:"
log "  Configure these repository secrets:"
log "    - SERVER_HOST: $(hostname)"
log "    - SERVER_USER: $SERVICE_USER"
log "    - SERVER_APP_DIR: $APP_DIR"
log "    - FRONTEND_SERVICE: $FRONTEND_SERVICE"
log "    - BACKEND_SERVICE: $BACKEND_SERVICE"
