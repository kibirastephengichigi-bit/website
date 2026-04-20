# CI/CD Deployment Guide

This project now includes a GitHub Actions workflow that deploys the app to your server whenever code is pushed to the `main` branch.

## What the workflow does

1. Installs dependencies in GitHub Actions
2. Generates the Prisma client
3. Builds the Next.js app to catch broken pushes
4. Connects to the production server over SSH
5. Pulls the latest `main` branch on the server
6. Rebuilds the Docker app image
7. Runs Prisma migrations
8. Restarts the app container

## Files added

- `.github/workflows/deploy.yml`
- `scripts/deploy.sh`

## Server preparation

On the production server, clone the same GitHub repository into a permanent app directory, for example:

```bash
mkdir -p /var/www/devmain-co-ke
cd /var/www/devmain-co-ke
git clone git@github.com:<your-user>/<your-repo>.git .
```

Make sure the server has:

- `git`
- `docker`
- `docker compose` or `docker-compose`
- your production `.env` file in the project root

If the repository is private, also make sure the server itself can pull from GitHub using its own deploy key or a machine user SSH key.

## GitHub repository secrets

Add these GitHub Actions secrets in your repository settings:

- `SERVER_HOST`: the server IP or hostname for `devmain.co.ke`
- `SERVER_PORT`: SSH port, usually `22`
- `SERVER_USER`: the SSH user that can deploy the app
- `SERVER_SSH_KEY`: the private key GitHub Actions should use for SSH access
- `SERVER_APP_DIR`: the absolute path of the checked out app on the server, for example `/var/www/devmain-co-ke`

## Recommended production checklist

- Set `NEXTAUTH_URL` in the server `.env` to `https://devmain.co.ke`
- Set a strong production `NEXTAUTH_SECRET`
- Set the real production `DATABASE_URL`
- Put the site behind Nginx or Caddy for HTTPS and reverse proxying to port `3000`
- Keep uploads and database storage on persistent volumes

## Deploy flow

After the secrets are configured:

1. Push changes to the `main` branch
2. GitHub Actions runs `.github/workflows/deploy.yml`
3. The server pulls the latest code and restarts the app

## Important note

The local directory at `/home/codecrafter/Documents/website-main` is not currently a Git checkout, so these files are ready for your repository, but pushing them to GitHub must be done from the actual cloned repo or by copying these changes into the repo that GitHub tracks.
