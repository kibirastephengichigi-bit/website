#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

print_status "Starting server setup for devmain.co.ke CI/CD deployment..."

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

print_status "Installing Python 3.11..."
apt install python3.11 python3.11-pip python3.11-venv -y

print_status "Installing additional dependencies..."
apt install git nginx postgresql postgresql-contrib curl wget unzip build-essential -y

print_status "Installing PM2..."
npm install -g pm2

print_status "Installing Certbot..."
apt install certbot python3-certbot-nginx -y

# Create deploy user
print_status "Creating deploy user..."
if id "deploy" &>/dev/null; then
    print_warning "Deploy user already exists"
else
    adduser --system --group --home /var/www/deploy deploy
    usermod -aG sudo deploy
    usermod -aG www-data deploy
fi

# Setup directory structure
print_status "Setting up directory structure..."
mkdir -p /var/www/website
chown -R deploy:deploy /var/www/website

# Clone repository
print_status "Cloning repository..."
cd /var/www
if [ -d "website" ]; then
    print_warning "Website directory already exists, updating..."
    cd website
    git fetch origin
    git reset --hard origin/main
else
    git clone https://github.com/kibirastephengichigi-bit/website.git
    chown -R deploy:deploy /var/www/website
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
cd /var/www/website
sudo -u deploy npm ci

print_status "Generating Prisma client..."
sudo -u deploy npx prisma generate

# Setup PostgreSQL
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE stephenasatsa;" || print_warning "Database may already exist"
sudo -u postgres psql -c "CREATE USER stephenasatsa_user WITH PASSWORD 'secure_password';" || print_warning "User may already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE stephenasatsa TO stephenasatsa_user;" || print_warning "Permissions may already be set"

# Create systemd services
print_status "Creating systemd services..."

# Frontend service
cat > /etc/systemd/system/devmain-frontend.service << 'EOF'
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
cat > /etc/systemd/system/devmain-backend.service << 'EOF'
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
EOF

# Enable and start services
print_status "Enabling and starting services..."
systemctl daemon-reload
systemctl enable devmain-frontend devmain-backend
systemctl start devmain-frontend devmain-backend

# Setup Nginx
print_status "Setting up Nginx configuration..."
cat > /etc/nginx/sites-available/devmain.co.ke << 'EOF'
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
ln -sf /etc/nginx/sites-available/devmain.co.ke /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t && systemctl restart nginx

# Setup SSH key for GitHub Actions
print_status "Setting up SSH key for GitHub Actions..."
sudo -u deploy ssh-keygen -t ed25519 -C "deploy@devmain.co.ke" -f /var/www/deploy/.ssh/github_deploy_key -N ""

# Display public key
print_status "Public SSH key for GitHub:"
echo "============================================="
sudo -u deploy cat /var/www/deploy/.ssh/github_deploy_key.pub
echo "============================================="
print_status "Add this key to GitHub repository as a deploy key with write access"

# Create environment file template
print_status "Creating environment file template..."
if [ ! -f "/var/www/website/.env" ]; then
    sudo -u deploy cp /var/www/website/.env.example /var/www/website/.env
    print_warning "Please edit /var/www/website/.env with your actual environment variables"
fi

# Setup firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'

# Create backup script
print_status "Setting up database backup..."
cat > /usr/local/bin/backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U stephenasatsa_user stephenasatsa > $BACKUP_DIR/stephenasatsa_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-database.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-database.sh") | crontab -

print_status "Server setup completed!"
print_status "Next steps:"
print_status "1. Add the SSH public key to GitHub repository deploy keys"
print_status "2. Configure GitHub repository secrets"
print_status "3. Edit /var/www/website/.env with your environment variables"
print_status "4. Obtain SSL certificate: certbot --nginx -d devmain.co.ke"
print_status "5. Test deployment by pushing to GitHub"

# Show service status
print_status "Service status:"
systemctl status devmain-frontend --no-pager -l
systemctl status devmain-backend --no-pager -l
