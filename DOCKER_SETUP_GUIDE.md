# Docker-Based CI/CD Setup Guide

## Overview
This guide will help you set up a Docker-based deployment for your devmain.co.ke server. Docker provides better isolation, scalability, and easier management compared to traditional systemd services.

## Prerequisites
- Debian Linux server with SSH access
- Docker and Docker Compose installed
- Domain (devmain.co.ke) pointing to your server
- GitHub repository access

## Step 1: Install Docker on Server

### 1.1 Install Docker
```bash
# Update package index
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
sudo usermod -aG docker deploy

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Test installation
docker --version
docker-compose --version
```

### 1.2 Configure Docker to start on boot
```bash
sudo systemctl enable docker
sudo systemctl start docker
```

## Step 2: Setup Application Directory

### 2.1 Clone Repository
```bash
# Create application directory
sudo mkdir -p /var/www/website
sudo chown deploy:deploy /var/www/website

# Clone repository
cd /var/www/website
sudo -u deploy git clone https://github.com/kibirastephengichigi-bit/website.git .
```

### 2.2 Setup Environment File
```bash
# Copy environment template
sudo -u deploy cp .env.docker .env

# Edit environment file
sudo -u deploy nano .env
```

**Required environment variables:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://stephenasatsa_user:secure_password@db:5432/stephenasatsa
DB_PASSWORD=secure_password
NEXTAUTH_URL=https://devmain.co.ke
NEXTAUTH_SECRET=your-nextauth-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password-here
```

## Step 3: Initial Docker Setup

### 3.1 Create Required Directories
```bash
sudo -u deploy mkdir -p nginx/conf.d nginx/sites-available ssl backups logs uploads
```

### 3.2 Start Services for First Time
```bash
cd /var/www/website
sudo -u deploy docker-compose -f docker-compose.prod.yml up -d --build
```

### 3.3 Setup Database
```bash
# Wait for database to start
sleep 30

# Run migrations
sudo -u deploy docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Create admin user (optional)
sudo -u deploy docker-compose -f docker-compose.prod.yml exec app npx prisma db seed
```

## Step 4: SSL Certificate Setup

### 4.1 Setup Let's Encrypt with Docker
```bash
# Create certbot container for SSL
sudo -u deploy docker run -it --rm \
  -v /var/www/certbot/conf:/etc/letsencrypt \
  -v /var/www/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@devmain.co.ke \
  --agree-tos \
  --no-eff-email \
  -d devmain.co.ke
```

### 4.2 Copy SSL Certificates
```bash
sudo mkdir -p /var/www/website/ssl/live
sudo cp -r /var/www/certbot/conf/live/devmain.co.ke/* /var/www/website/ssl/live/
sudo chown -R deploy:deploy /var/www/website/ssl
```

### 4.3 Restart Nginx with SSL
```bash
cd /var/www/website
sudo -u deploy docker-compose -f docker-compose.prod.yml restart nginx
```

## Step 5: GitHub Actions Integration

### 5.1 SSH Key Setup
```bash
# Generate SSH key for deployment
sudo -u deploy ssh-keygen -t ed25519 -C "deploy@devmain.co.ke" -f ~/.ssh/github_deploy_key -N ""

# Display public key
sudo -u deploy cat ~/.ssh/github_deploy_key.pub
```

Add this public key to GitHub repository as a deploy key with write access.

### 5.2 GitHub Repository Secrets
Add these secrets to your GitHub repository:

**Server Configuration:**
```
SERVER_HOST=devmain.co.ke
SERVER_PORT=22
SERVER_USER=deploy
SERVER_APP_DIR=/var/www/website
```

**Application Secrets:**
```
DATABASE_URL=postgresql://stephenasatsa_user:secure_password@db:5432/stephenasatsa
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://devmain.co.ke
DB_PASSWORD=secure_password
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password
```

**SSH Key:**
```
SERVER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
[Your private key content]
-----END OPENSSH PRIVATE KEY-----
```

## Step 6: Deployment Management

### 6.1 Manual Deployment
```bash
cd /var/www/website
sudo -u deploy ./scripts/docker-deploy.sh
```

### 6.2 View Container Status
```bash
sudo -u deploy docker-compose -f docker-compose.prod.yml ps
```

### 6.3 View Logs
```bash
# All logs
sudo -u deploy docker-compose -f docker-compose.prod.yml logs -f

# Specific service logs
sudo -u deploy docker-compose -f docker-compose.prod.yml logs -f app
sudo -u deploy docker-compose -f docker-compose.prod.yml logs -f admin-backend
```

### 6.4 Update Application
```bash
cd /var/www/website
sudo -u deploy git pull origin main
sudo -u deploy docker-compose -f docker-compose.prod.yml up -d --build
```

## Step 7: Maintenance

### 7.1 Database Backups
```bash
# Manual backup
sudo -u deploy docker-compose -f docker-compose.prod.yml exec db pg_dump -U stephenasatsa_user stephenasatsa > backups/manual_backup_$(date +%Y%m%d_%H%M%S).sql

# View backups
sudo -u deploy ls -la backups/
```

### 7.2 Container Maintenance
```bash
# Clean up unused images
sudo -u deploy docker image prune -f

# Clean up unused volumes (careful!)
sudo -u deploy docker volume prune -f

# Update Docker images
sudo -u deploy docker-compose -f docker-compose.prod.yml pull
```

### 7.3 Monitoring
```bash
# Resource usage
sudo -u deploy docker stats

# Container health
sudo -u deploy docker-compose -f docker-compose.prod.yml ps
```

## Step 8: Troubleshooting

### 8.1 Common Issues

**Container won't start:**
```bash
# Check logs
sudo -u deploy docker-compose -f docker-compose.prod.yml logs [service-name]

# Check container status
sudo -u deploy docker inspect [container-name]
```

**Database connection failed:**
```bash
# Check database container
sudo -u deploy docker-compose -f docker-compose.prod.yml logs db

# Test connection
sudo -u deploy docker-compose -f docker-compose.prod.yml exec db psql -U stephenasatsa_user -d stephenasatsa
```

**SSL Certificate issues:**
```bash
# Check certificate files
sudo -u deploy ls -la ssl/live/devmain.co.ke/

# Renew certificate
sudo docker run -it --rm \
  -v /var/www/certbot/conf:/etc/letsencrypt \
  -v /var/www/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot renew
```

### 8.2 Recovery Procedures

**Full application restart:**
```bash
cd /var/www/website
sudo -u deploy docker-compose -f docker-compose.prod.yml down
sudo -u deploy docker-compose -f docker-compose.prod.yml up -d
```

**Database restore:**
```bash
# Stop application
sudo -u deploy docker-compose -f docker-compose.prod.yml stop app admin-backend

# Restore database
sudo -u deploy docker-compose -f docker-compose.prod.yml exec -T db psql -U stephenasatsa_user stephenasatsa < backups/backup_file.sql

# Restart application
sudo -u deploy docker-compose -f docker-compose.prod.yml start app admin-backend
```

## Step 9: Performance Optimization

### 9.1 Resource Limits
Add to `docker-compose.prod.yml`:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 9.2 Caching
The setup includes Redis for caching. Configure your application to use Redis:
```env
REDIS_URL=redis://redis:6379
```

## Step 10: Security

### 10.1 Firewall Configuration
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 5432  # Don't expose PostgreSQL directly
```

### 10.2 Container Security
```bash
# Run containers as non-root user (already configured)
# Use read-only filesystems where possible
# Regular security updates
sudo apt update && sudo apt upgrade -y
```

## Benefits of Docker Setup

1. **Isolation**: Each service runs in its own container
2. **Scalability**: Easy to scale individual services
3. **Consistency**: Same environment everywhere
4. **Portability**: Easy to move between servers
5. **Version Control**: Docker images are versioned
6. **Health Checks**: Built-in health monitoring
7. **Easy Rollbacks**: Quick rollback to previous versions

## Architecture Overview

```
Internet
    |
    v
[Nginx Container] (Port 80/443)
    |
    +--> [Frontend Container] (Port 3000)
    |
    +--> [Backend Container] (Port 8000)
    |
    +--> [Database Container] (Port 5432)
    |
    +--> [Redis Container] (Port 6379)
```

This Docker setup provides a production-ready, scalable, and maintainable deployment solution for your devmain.co.ke website!
