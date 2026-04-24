#!/bin/bash

# Port Conflict Prevention Script
# Checks for port conflicts before starting services

echo "🔍 Checking for port conflicts..."

# Define ports to check
FRONTEND_PORT=3000
ADMIN_API_PORT=8000
SCHOLARS_API_PORT=8081

# Function to check if port is in use
check_port() {
    local port=$1
    local service=$2
    
    if ss -tuln | grep -q ":$port "; then
        echo "⚠️  Port $port ($service) is already in use!"
        echo "   Process using this port:"
        lsof -i :$port 2>/dev/null || echo "   Unable to determine process"
        return 1
    else
        echo "✅ Port $port ($service) is available"
        return 0
    fi
}

# Check all ports
conflicts=0

check_port $FRONTEND_PORT "Frontend" || conflicts=$((conflicts + 1))
check_port $ADMIN_API_PORT "Admin API" || conflicts=$((conflicts + 1))
check_port $SCHOLARS_API_PORT "Scholars API" || conflicts=$((conflicts + 1))

if [ $conflicts -gt 0 ]; then
    echo ""
    echo "❌ Found $conflicts port conflict(s)!"
    echo ""
    echo "To resolve conflicts:"
    echo "1. Stop the conflicting services"
    echo "2. Or change the port in the respective .env file"
    echo ""
    echo "Commands to stop services:"
    echo "  - Frontend: pkill -f 'next dev'"
    echo "  - Admin API: pkill -f 'python -m backend'"
    echo "  - Scholars API: pkill -f 'python app.py'"
    exit 1
else
    echo ""
    echo "✅ No port conflicts detected. Safe to start services!"
    exit 0
fi
