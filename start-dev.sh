#!/bin/bash

# Quick Development Start Script
# Stephen Asatsa Website
# Supports both nohup and PM2 deployment modes

echo "🚀 Starting Stephen Asatsa Website Development Servers..."

# Check for PM2 mode
USE_PM2="${USE_PM2:-false}"
if [ "$USE_PM2" = "true" ]; then
    if command -v pm2 &> /dev/null; then
        echo "📊 PM2 mode enabled. Using PM2 for service management..."
        cd /home/codecrafter/Documents/combined
        ./start-pm2.sh dev
        exit 0
    else
        echo "⚠️  PM2 requested but not installed. Falling back to nohup mode..."
        echo "Install PM2 with: sudo npm install -g pm2"
    fi
fi

echo "📝 Using nohup mode for service management..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Start backend
echo -e "${BLUE}[INFO]${NC} Starting backend server..."
cd backend
source venv/bin/activate 2>/dev/null || echo "Virtual environment not found, using system Python"
python3 server.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}[INFO]${NC} Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Save PIDs
echo $BACKEND_PID > .backend_pid
echo $FRONTEND_PID > .frontend_pid

echo -e "${GREEN}[SUCCESS]${NC} Both servers started!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "👤 Admin:    http://localhost:3000/admin"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""
echo "💡 To use PM2 multithreading mode: USE_PM2=true ./start-dev.sh"

# Wait for interrupt
trap 'echo -e "\n${BLUE}[INFO]${NC} Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend_pid .frontend_pid; exit 0' EXIT

while true; do
    sleep 1
done
