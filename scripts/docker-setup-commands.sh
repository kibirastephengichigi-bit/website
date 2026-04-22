#!/bin/bash

# Docker Setup Commands for devmain.co.ke
# Run these commands in order on your server

echo "=== Step 1: Add deploy user to docker group ==="
sudo usermod -aG docker deploy

echo "=== Step 2: Pull latest Docker setup files ==="
cd /var/www/website
sudo -u deploy git fetch origin
sudo -u deploy git checkout hero-section-fix
sudo -u deploy git pull origin hero-section-fix

echo "=== Step 3: Stop existing services that conflict ==="
sudo systemctl stop nginx
sudo systemctl stop devmain-frontend
sudo systemctl stop devmain-backend
sudo systemctl disable nginx
sudo systemctl disable devmain-frontend
sudo systemctl disable devmain-backend

echo "=== Step 4: Setup environment file ==="
sudo -u deploy cp .env.docker .env
echo "Edit the .env file with your actual secrets:"
echo "sudo -u deploy nano .env"

echo "=== Step 5: Create required directories ==="
sudo -u deploy mkdir -p nginx/conf.d nginx/sites-available ssl backups logs uploads

echo "=== Step 6: Start Docker containers ==="
cd /var/www/website
sudo -u deploy docker-compose -f docker-compose.prod.yml up -d --build

echo "=== Step 7: Wait for containers to start ==="
sleep 30

echo "=== Step 8: Run database migrations ==="
sudo -u deploy docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

echo "=== Step 9: Check container status ==="
sudo -u deploy docker-compose -f docker-compose.prod.yml ps

echo "=== Step 10: Check logs if needed ==="
echo "View logs: sudo -u deploy docker-compose -f docker-compose.prod.yml logs -f"

echo "=== Setup Complete! ==="
echo "Your application should now be running at http://devmain.co.ke"
