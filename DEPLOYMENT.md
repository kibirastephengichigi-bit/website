# CI/CD Deployment Guide

This project includes automated deployment scripts for running the application using systemd services or Docker Compose on a production server.

## Quick Server Setup (Recommended)

The fastest way to get started is to use the comprehensive server setup script:

```bash
# On your Debian server:
curl -fsSL https://raw.githubusercontent.com/kibirastephengichigi-bit/website/main/scripts/server-setup.sh | bash -s -- \
  --repo-url https://github.com/kibirastephengichigi-bit/website.git \
  --app-dir ~/website \
  --domain devmain.co.ke \
  --user codecrafter \
  --install-nginx \
  --install-docker \
  --start-services
```

This single command will:
- ✅ Install Node.js, Python 3, Git, and build tools
- ✅ Clone your repository
- ✅ Install Node dependencies and build the Next.js app
- ✅ Install Docker and Docker Compose (optional)
- ✅ Configure and start Nginx reverse proxy (optional)
- ✅ Install systemd services
- ✅ Create a production `.env` file (which you must edit)
- ✅ Start all services

### Usage

```bash
bash server-setup.sh [options]

Options:
  --repo-url <url>         Git repository URL (required)
  --app-dir <path>         Installation directory (default: ~/website)
  --domain <domain>        Domain name (default: devmain.co.ke)
  --user <username>        Service user (default: current user)
  --install-nginx          Install and configure Nginx
  --install-docker         Install Docker and Docker Compose
  --start-services         Start systemd services after installation
```

### Example

```bash
bash scripts/server-setup.sh \
  --repo-url https://github.com/kibirastephengichigi-bit/website.git \
  --app-dir /home/codecrafter/work/website \
  --domain devmain.co.ke \
  --user codecrafter \
  --install-nginx \
  --install-docker \
  --start-services
```

---

---

## What the GitHub Actions workflow does

1. Installs dependencies in GitHub Actions
2. Generates the Prisma client
3. Builds the Next.js app to catch broken pushes
4. Connects to the production server over SSH
5. Pulls the latest `main` branch on the server
6. Deploys using either Docker Compose or systemd services (auto-detected)
7. Runs Prisma migrations when `DATABASE_URL` is available
8. Service management is automatic based on deployment mode

## Managing systemd Services

After installation, manage your services with these commands:

```bash
# View service status
sudo systemctl status devmain-frontend.service
sudo systemctl status devmain-backend.service

# View service logs
sudo journalctl -u devmain-frontend.service -f
sudo journalctl -u devmain-backend.service -f

# Restart services
sudo systemctl restart devmain-frontend.service
sudo systemctl restart devmain-backend.service

# Stop services
sudo systemctl stop devmain-frontend.service
sudo systemctl stop devmain-backend.service

# Start services
sudo systemctl start devmain-frontend.service
sudo systemctl start devmain-backend.service
```

## Verify Installation

Check that services are running:

```bash
docker ps  # If using Docker Compose
# or
ps aux | grep npm  # If using systemd
curl -I http://localhost:3001  # Test app is responding
curl -I http://devmain.co.ke  # Test Nginx proxy
```

---

## Alternative: Manual Server Preparation

If you prefer not to use the automated setup script, you can manually configure your server:


On the production server, clone the same GitHub repository into a permanent app directory, for example:

```bash
mkdir -p /home/codecrafter/work/website
cd /home/codecrafter/work/website
git clone git@github.com:<your-user>/<your-repo>.git .
```

Make sure the server has:

- `git`
- `node` and `npm`
- `python3`
- `systemd`
- your production `.env` file in the project root

If the repository is private, also make sure the server itself can pull from GitHub using its own deploy key or a machine user SSH key.

## Install the service units

This repo now includes ready-to-install unit files:

- `deploy/systemd/devmain-frontend.service`
- `deploy/systemd/devmain-backend.service`

Copy them into `/etc/systemd/system/` on the server:

```bash
sudo cp deploy/systemd/devmain-frontend.service /etc/systemd/system/devmain-frontend.service
sudo cp deploy/systemd/devmain-backend.service /etc/systemd/system/devmain-backend.service
sudo systemctl daemon-reload
sudo systemctl enable devmain-frontend.service devmain-backend.service
sudo systemctl start devmain-frontend.service devmain-backend.service
```

The frontend service should run `npm run start`, not `npm run dev`, so the site uses a production build.

## Allow CI to restart services

The SSH user used by GitHub Actions needs passwordless restart access for these services. Add a sudoers rule with `visudo`:

```sudoers
codecrafter ALL=NOPASSWD: /bin/systemctl restart devmain-frontend.service, /bin/systemctl restart devmain-backend.service, /bin/systemctl is-active devmain-frontend.service, /bin/systemctl is-active devmain-backend.service
```

## GitHub repository secrets

Add these GitHub Actions secrets in your repository settings:

- `SERVER_HOST`: the server IP or hostname for `devmain.co.ke`
- `SERVER_PORT`: SSH port, usually `22`
- `SERVER_USER`: the SSH user that can deploy the app
- `SERVER_SSH_KEY`: the private key GitHub Actions should use for SSH access
- `SERVER_APP_DIR`: the absolute path of the checked out app on the server, for example `/home/codecrafter/work/website`
- `FRONTEND_SERVICE`: usually `devmain-frontend.service`
- `BACKEND_SERVICE`: usually `devmain-backend.service`

Optionally, if your server runs Docker Compose, the workflow now deploys using the `docker-compose.yml` stack by default on the target server. Ensure Docker and Docker Compose are installed and your project contains `docker-compose.yml`.

## Recommended production checklist

- Set `NEXTAUTH_URL` in the server `.env` to `https://devmain.co.ke`
- Set a strong production `NEXTAUTH_SECRET`
- Set the real production `DATABASE_URL`
- Put the site behind Nginx or Caddy for HTTPS and reverse proxying to ports `3000` and `8000` as needed
- Keep `.env` only on the server and out of Git

## Deploy flow

After the secrets are configured:

1. Push changes to the `main` branch
2. GitHub Actions runs `.github/workflows/deploy.yml`
3. The server pulls the latest code, rebuilds the frontend, and restarts both services

## Suggested production service definitions

Frontend:

```ini
[Unit]
Description=DevMain Frontend Next.js Service
After=network.target

[Service]
Type=simple
User=codecrafter
WorkingDirectory=/home/codecrafter/work/website
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Backend:

```ini
[Unit]
Description=DevMain Backend API Service
After=network.target

[Service]
Type=simple
User=codecrafter
WorkingDirectory=/home/codecrafter/work/website
ExecStart=/usr/bin/python3 -m backend
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1
Environment=ADMIN_API_PORT=8000
Environment=ADMIN_ALLOWED_ORIGIN=https://devmain.co.ke

[Install]
WantedBy=multi-user.target
```
