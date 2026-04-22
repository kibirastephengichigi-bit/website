#!/bin/bash

# Server Cleanup Script for Low Disk Space
# This script cleans up unnecessary files to free up disk space

echo "=== Server Cleanup Script ==="
echo "Current disk usage:"
df -h

echo -e "\n=== Cleaning up package caches ==="
# Clean apt package cache
sudo apt-get clean
sudo apt-get autoremove -y

echo -e "\n=== Cleaning up Docker ==="
# Remove unused Docker images, containers, and networks
sudo docker system prune -af --volumes

echo -e "\n=== Cleaning up npm cache ==="
# Clean npm cache (if npm is available)
if command -v npm &> /dev/null; then
    npm cache clean --force
fi

echo -e "\n=== Cleaning up temporary files ==="
# Clean temporary files
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*

echo -e "\n=== Cleaning up log files ==="
# Clean old log files (keep last 7 days)
sudo find /var/log -name "*.log" -type f -mtime +7 -delete
sudo journalctl --vacuum-time=7d

echo -e "\n=== Cleaning up old Docker images ==="
# Remove old Docker images
sudo docker image prune -af

echo -e "\n=== Disk usage after cleanup ==="
df -h

echo -e "\n=== Memory usage ==="
free -h

echo -e "\n=== Cleanup complete! ==="
