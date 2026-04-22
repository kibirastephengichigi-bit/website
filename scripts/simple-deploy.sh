#!/bin/bash

# Simple Server Deployment Script
# This script sets up and runs the website without Docker

echo "=== Simple Server Setup ==="

# Step 1: Install dependencies
echo "Installing Node.js and required packages..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql nginx

# Step 2: Setup database
echo "Setting up PostgreSQL database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS stephenasatsa;"
sudo -u postgres psql -c "CREATE DATABASE stephenasatsa;"
sudo -u postgres psql -c "DROP USER IF EXISTS stephenasatsa_user;"
sudo -u postgres psql -c "CREATE USER stephenasatsa_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE stephenasatsa TO stephenasatsa_user;"
sudo -u postgres psql -c "ALTER USER stephenasatsa_user CREATEDB;"

# Step 3: Setup environment
echo "Setting up environment variables..."
cat > .env << EOF
# Database
DATABASE_URL="postgresql://stephenasatsa_user:secure_password@localhost:5432/stephenasatsa"

# NextAuth
NEXTAUTH_URL="https://devmain.co.ke"
NEXTAUTH_SECRET="your-nextauth-secret-change-this"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# JWT
JWT_SECRET="your-jwt-secret-change-this"

# Admin Backend
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-me-now"
ADMIN_TOTP_SECRET="your-totp-secret-change-this"
EOF

# Step 4: Install npm dependencies
echo "Installing npm dependencies..."
npm install

# Step 5: Generate Prisma client
echo "Setting up Prisma..."
npx prisma@6.6.0 generate

# Step 6: Run database migrations
echo "Running database migrations..."
npx prisma@6.6.0 migrate deploy

# Step 7: Build the application
echo "Building Next.js application..."
npm run build

# Step 8: Setup PM2 for process management
echo "Setting up PM2..."
sudo npm install -g pm2

# Step 9: Create PM2 configuration
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'website-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/website',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'website-backend',
      script: 'python',
      args: '-m backend',
      cwd: '/var/www/website',
      interpreter: '/usr/bin/python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M'
    }
  ]
};
EOF

# Step 10: Setup Nginx
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/devmain.co.ke > /dev/null << EOF
server {
    listen 80;
    server_name devmain.co.ke www.devmain.co.ke;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/admin/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/devmain.co.ke /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Step 11: Start services
echo "Starting services..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl start nginx
sudo systemctl enable nginx

# Step 12: Start applications with PM2
echo "Starting applications with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

echo "=== Setup Complete! ==="
echo "Your website should be running at: http://devmain.co.ke"
echo "Check status with: pm2 status"
echo "View logs with: pm2 logs"
echo "Restart with: pm2 restart all"
