# CI/CD Deployment Guide

This project now includes a GitHub Actions workflow that deploys the app to your server whenever code is pushed to the `main` branch.

## What the workflow does

1. Installs dependencies in GitHub Actions
2. Generates the Prisma client
3. Builds the Next.js app to catch broken pushes
4. Connects to the production server over SSH
5. Pulls the latest `main` branch on the server
6. Installs Node dependencies and rebuilds the Next.js app
7. Runs Prisma migrations when `DATABASE_URL` is available
8. Restarts the frontend and backend `systemd` services

## Files added

- `.github/workflows/deploy.yml`
- `scripts/deploy.sh`

## Server preparation

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
