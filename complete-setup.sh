#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Completing server setup for devmain.co.ke..."

# Step 1: Setup PostgreSQL Database
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE stephenasatsa;" 2>/dev/null || print_warning "Database may already exist"
sudo -u postgres psql -c "CREATE USER stephenasatsa_user WITH PASSWORD 'secure_password';" 2>/dev/null || print_warning "User may already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE stephenasatsa TO stephenasatsa_user;" 2>/dev/null || print_warning "Permissions may already be set"

# Step 2: Setup Environment File
print_status "Setting up environment file..."
cd /var/www/website
if [ ! -f ".env" ]; then
    sudo -u deploy cp .env.example .env
fi

# Create environment file with proper values
sudo -u deploy tee .env > /dev/null << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://stephenasatsa_user:secure_password@localhost:5432/stephenasatsa
NEXTAUTH_URL=https://devmain.co.ke
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me-now-in-production
ADMIN_ALLOWED_ORIGIN=https://devmain.co.ke
ADMIN_API_PORT=8000
JWT_SECRET=your-jwt-secret-change-this
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EOF

# Step 3: Run Database Migrations
print_status "Running database migrations..."
cd /var/www/website
sudo -u deploy npx prisma migrate deploy

# Step 4: Create Systemd Services
print_status "Creating systemd services..."

# Frontend service
sudo tee /etc/systemd/system/devmain-frontend.service > /dev/null << 'EOF'
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
EOF

# Backend service
sudo tee /etc/systemd/system/devmain-backend.service > /dev/null << 'EOF'
[Unit]
Description=DevMain Backend API Service
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/var/www/website
EnvironmentFile=-/var/www/website/.env
ExecStart=/usr/bin/python3 -m backend
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1
Environment=ADMIN_API_PORT=8000
Environment=ADMIN_ALLOWED_ORIGIN=https://devmain.co.ke

[Install]
WantedBy=multi-user.target
EOF

# Step 5: Enable and Start Services
print_status "Enabling and starting services..."
sudo systemctl daemon-reload
sudo systemctl enable devmain-frontend devmain-backend
sudo systemctl start devmain-frontend devmain-backend

# Step 6: Setup Nginx
print_status "Setting up Nginx configuration..."
sudo tee /etc/nginx/sites-available/devmain.co.ke > /dev/null << 'EOF'
server {
    listen 80;
    server_name devmain.co.ke www.devmain.co.ke;

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
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/devmain.co.ke /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t && sudo systemctl restart nginx

# Step 7: Setup SSH Key for GitHub Actions
print_status "Setting up SSH key for GitHub Actions..."
sudo -u deploy mkdir -p /home/deploy/.ssh
sudo -u deploy ssh-keygen -t ed25519 -C "deploy@devmain.co.ke" -f /home/deploy/.ssh/github_deploy_key -N ""

# Display public key
print_status "Public SSH key for GitHub:"
echo "============================================="
sudo -u deploy cat /home/deploy/.ssh/github_deploy_key.pub
echo "============================================="
print_status "Add this key to GitHub repository as a deploy key with write access"

# Step 8: Setup Firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Step 9: Create Backup Script
print_status "Setting up database backup..."
sudo tee /usr/local/bin/backup-database.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U stephenasatsa_user stephenasatsa > $BACKUP_DIR/stephenasatsa_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-database.sh
echo "0 2 * * * /usr/local/bin/backup-database.sh" | sudo crontab -

# Step 10: Check Service Status
print_status "Checking service status..."
sudo systemctl status devmain-frontend --no-pager -l
sudo systemctl status devmain-backend --no-pager -l

print_status "Setup completed!"
print_status "Next steps:"
print_status "1. Add the SSH public key to GitHub repository deploy keys"
print_status "2. Configure GitHub repository secrets (see GITHUB_SECRETS_GUIDE.md)"
print_status "3. Update NEXTAUTH_SECRET in /var/www/website/.env"
print_status "4. Obtain SSL certificate: sudo certbot --nginx -d devmain.co.ke"
print_status "5. Test deployment by pushing to GitHub"

print_status "Application URLs:"
print_status "Frontend: http://devmain.co.ke"
print_status "Backend API: http://devmain.co.ke/api/admin/"
