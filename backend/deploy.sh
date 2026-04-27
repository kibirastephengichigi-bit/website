#!/bin/bash

# Stephen Asatsa Website Backend Deployment Script

set -e

echo "🚀 Deploying Stephen Asatsa Website Backend..."

# Stop existing service
sudo systemctl stop stephen-asatsa-backend || true

# Pull latest changes (if using git)
# git pull origin main

# Build the application
./build.sh

# Install systemd service
sudo cp stephen-asatsa-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable stephen-asatsa-backend

# Start the service
sudo systemctl start stephen-asatsa-backend

# Check status
sudo systemctl status stephen-asatsa-backend

echo "✅ Deployment completed!"
