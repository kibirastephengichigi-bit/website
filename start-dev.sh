#!/bin/bash

# Quick Development Start Script
# Stephen Asatsa Website

echo "🚀 Starting Stephen Asatsa Website Development Servers..."

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

# Wait for interrupt
trap 'echo -e "\n${BLUE}[INFO]${NC} Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend_pid .frontend_pid; exit 0' EXIT

while true; do
    sleep 1
done
