#!/usr/bin/env bash

set -Eeuo pipefail

DEFAULT_APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="${APP_DIR:-${1:-$DEFAULT_APP_DIR}}"
SERVICE_USER="${SERVICE_USER:-$(id -un)}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-devmain-frontend.service}"
BACKEND_SERVICE="${BACKEND_SERVICE:-devmain-backend.service}"
SYSTEMD_DIR="${SYSTEMD_DIR:-/etc/systemd/system}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
ADMIN_API_PORT="${ADMIN_API_PORT:-8000}"
PUBLIC_ORIGIN="${PUBLIC_ORIGIN:-https://your-domain.com}"

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

if [ ! -d "$APP_DIR" ]; then
  echo "APP_DIR does not exist: $APP_DIR"
  exit 1
fi

frontend_unit="$(mktemp)"
backend_unit="$(mktemp)"

cat >"$frontend_unit" <<EOF
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

cat >"$backend_unit" <<EOF
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
Environment=ADMIN_ALLOWED_ORIGIN=$PUBLIC_ORIGIN

[Install]
WantedBy=multi-user.target
EOF

run_root cp "$frontend_unit" "$SYSTEMD_DIR/$FRONTEND_SERVICE"
run_root cp "$backend_unit" "$SYSTEMD_DIR/$BACKEND_SERVICE"
run_root systemctl daemon-reload
run_root systemctl enable "$FRONTEND_SERVICE" "$BACKEND_SERVICE"

rm -f "$frontend_unit" "$backend_unit"

echo "Installed systemd services:"
echo "  $SYSTEMD_DIR/$FRONTEND_SERVICE"
echo "  $SYSTEMD_DIR/$BACKEND_SERVICE"
echo
echo "Next steps:"
echo "  sudo systemctl start $BACKEND_SERVICE $FRONTEND_SERVICE"
echo "  sudo systemctl status $BACKEND_SERVICE $FRONTEND_SERVICE"
