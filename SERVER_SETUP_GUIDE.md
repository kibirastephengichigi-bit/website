# Debian Server CI/CD Setup Guide

## Overview
This guide will help you configure your Debian Linux server (devmain.co.ke) to automatically deploy changes when pushed to GitHub.

## Prerequisites
- Debian Linux server with SSH access
- Domain (devmain.co.ke) pointing to your server
- GitHub repository access
- Basic knowledge of Linux commands

## Step 1: Server Preparation

### 1.1 Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Dependencies
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.11
sudo apt install python3.11 python3.11-pip python3.11-venv -y

# Install other dependencies
sudo apt install git nginx postgresql postgresql-contrib curl wget unzip -y
sudo apt install build-essential -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 1.3 Create Deployment User
```bash
# Create dedicated user for deployments
sudo adduser deploy
sudo usermod -aG sudo deploy
sudo usermod -aG www-data deploy

# Switch to deploy user
sudo su - deploy
```

## Step 2: Application Setup

### 2.1 Clone Repository
```bash
# Clone your repository
cd /var/www
sudo git clone https://github.com/kibirastephengichigi-bit/website.git
sudo chown -R deploy:deploy /var/www/website
cd /var/www/website
```

### 2.2 Install Dependencies
```bash
# Install Node.js dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build the application
npm run build
```

### 2.3 Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Edit the environment file
nano .env
```

**Required environment variables:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@localhost:5432/stephenasatsa
NEXTAUTH_URL=https://devmain.co.ke
NEXTAUTH_SECRET=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password-here
ADMIN_ALLOWED_ORIGIN=https://devmain.co.ke
```

## Step 3: Database Setup

### 3.1 Configure PostgreSQL
```bash
# Switch to postgres user
sudo su - postgres

# Create database and user
psql
CREATE DATABASE stephenasatsa;
CREATE USER stephenasatsa_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE stephenasatsa TO stephenasatsa_user;
\q

exit
```

### 3.2 Run Database Migrations
```bash
cd /var/www/website
npx prisma migrate deploy
```

## Step 4: Systemd Services Setup

### 4.1 Create Frontend Service
```bash
sudo nano /etc/systemd/system/devmain-frontend.service
```

**Content:**
```ini
[Unit]
Description=DevMain Frontend Next.js Service
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/website
EnvironmentFile=-/var/www/website/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### 4.2 Create Backend Service
```bash
sudo nano /etc/systemd/system/devmain-backend.service
```

**Content:**
```ini
[Unit]
Description=DevMain Backend API Service
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/website
EnvironmentFile=-/var/www/website/.env
ExecStart=/usr/bin/python3.11 -m backend
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1
Environment=ADMIN_API_PORT=8000
Environment=ADMIN_ALLOWED_ORIGIN=https://devmain.co.ke

[Install]
WantedBy=multi-user.target
```

### 4.3 Enable Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable devmain-frontend devmain-backend
sudo systemctl start devmain-frontend devmain-backend
```

### 4.4 Check Service Status
```bash
sudo systemctl status devmain-frontend
sudo systemctl status devmain-backend
```

## Step 5: Nginx Configuration

### 5.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/devmain.co.ke
```

**Content:**
```nginx
server {
    listen 80;
    server_name devmain.co.ke www.devmain.co.ke;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name devmain.co.ke www.devmain.co.ke;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/devmain.co.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/devmain.co.ke/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;

    # Frontend Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Proxy
    location /api/admin/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Files
    location /_next/static/ {
        alias /var/www/website/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /uploads/ {
        alias /var/www/website/public/uploads/;
        expires 1d;
        add_header Cache-Control "public";
    }
}
```

### 5.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/devmain.co.ke /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 6: SSL Certificate Setup

### 6.1 Obtain SSL Certificate
```bash
sudo certbot --nginx -d devmain.co.ke -d www.devmain.co.ke
```

### 6.2 Setup Auto-Renewal
```bash
sudo crontab -e
```

**Add this line:**
```cron
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 7: SSH Key Setup for GitHub Actions

### 7.1 Generate SSH Key on Server
```bash
sudo su - deploy
ssh-keygen -t ed25519 -C "deploy@devmain.co.ke" -f ~/.ssh/github_deploy_key
```

### 7.2 Add Public Key to GitHub
```bash
cat ~/.ssh/github_deploy_key.pub
```

Copy the output and add it to:
- GitHub Repository Settings > Deploy Keys > Add deploy key
- Give it a name (e.g., "devmain-server-deploy")
- Check "Allow write access"

### 7.3 Test SSH Connection
```bash
ssh -T git@github.com
```

## Step 8: GitHub Repository Secrets

### 8.1 Required GitHub Secrets
Go to your GitHub repository > Settings > Secrets and variables > Actions > New repository secret

**Add these secrets:**
```
SERVER_HOST=devmain.co.ke
SERVER_PORT=22
SERVER_USER=deploy
SERVER_APP_DIR=/var/www/website
SERVER_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
[Your private key content here]
-----END OPENSSH PRIVATE KEY-----
FRONTEND_SERVICE=devmain-frontend.service
BACKEND_SERVICE=devmain-backend.service
DATABASE_URL=postgresql://stephenasatsa_user:secure_password@localhost:5432/stephenasatsa
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://devmain.co.ke
```

## Step 9: Test Deployment

### 9.1 Manual Deployment Test
```bash
cd /var/www/website
sudo -u deploy ./scripts/deploy.sh
```

### 9.2 GitHub Actions Test
1. Make a small change to your code
2. Push to the main branch
3. Check GitHub Actions tab for deployment status
4. Verify changes are live on devmain.co.ke

## Step 10: Monitoring and Maintenance

### 10.1 Log Monitoring
```bash
# View service logs
sudo journalctl -u devmain-frontend -f
sudo journalctl -u devmain-backend -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 10.2 Service Management
```bash
# Restart services
sudo systemctl restart devmain-frontend devmain-backend

# Check service status
sudo systemctl status devmain-frontend devmain-backend
```

### 10.3 Backup Database
```bash
# Create backup script
sudo nano /usr/local/bin/backup-database.sh
```

**Content:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U stephenasatsa_user stephenasatsa > $BACKUP_DIR/stephenasatsa_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-database.sh
sudo crontab -e
```

**Add backup cron:**
```cron
0 2 * * * /usr/local/bin/backup-database.sh
```

## Troubleshooting

### Common Issues:

1. **Service won't start**
   - Check logs: `sudo journalctl -u service-name -f`
   - Verify environment variables
   - Check file permissions

2. **GitHub Actions SSH fails**
   - Verify SSH key is correctly added to GitHub
   - Check server firewall allows SSH
   - Test SSH connection manually

3. **Database connection fails**
   - Verify PostgreSQL is running
   - Check database credentials
   - Test connection: `psql -h localhost -U stephenasatsa_user -d stephenasatsa`

4. **Nginx configuration errors**
   - Test configuration: `sudo nginx -t`
   - Check syntax errors
   - Verify SSL certificates

## Security Considerations

1. **Firewall Configuration**
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

2. **Regular Updates**
```bash
# Set up automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

3. **User Permissions**
- Use dedicated deploy user
- Limit sudo access
- Regular security audits

This setup will enable automatic deployments from GitHub to your devmain.co.ke server with proper monitoring, SSL, and security measures.
