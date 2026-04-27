#!/bin/bash

# Frontend Development Server Startup Script
# Starts the Next.js development server with proper configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
FRONTEND_DIR="$PROJECT_ROOT"
PID_FILE="$PROJECT_ROOT/.frontend-dev.pid"
LOG_FILE="$PROJECT_ROOT/.next/frontend-dev.log"

echo -e "${BLUE}🚀 Starting Frontend Development Server${NC}"
echo "=================================================="

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found: $FRONTEND_DIR${NC}"
    exit 1
fi

# Check if package.json exists
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo -e "${RED}❌ package.json not found in $FRONTEND_DIR${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    cd "$FRONTEND_DIR"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Check if frontend is already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Frontend dev server is already running (PID: $PID)${NC}"
        echo -e "${YELLOW}   Use '$0 stop' to stop it first${NC}"
        exit 1
    else
        echo -e "${YELLOW}🧹 Removing stale PID file${NC}"
        rm "$PID_FILE"
    fi
fi

# Check if port 3000 is available
if ss -tuln | grep -q ":3000 "; then
    echo -e "${RED}❌ Port 3000 is already in use!${NC}"
    echo -e "${RED}   Please stop the service using this port first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Starting frontend development server...${NC}"
echo -e "${GREEN}📁 Frontend Directory: $FRONTEND_DIR${NC}"
echo -e "${GREEN}📋 Log File: $LOG_FILE${NC}"
echo -e "${GREEN}🌐 Server URL: http://localhost:3000${NC}"
echo ""

# Change to frontend directory and start server
cd "$FRONTEND_DIR"

# Start server in background and capture PID
npm run dev > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# Wait a moment to get the actual Node.js process PID
sleep 3
NODE_PID=$(pgrep -f "next dev" | head -1)

if [ -z "$NODE_PID" ]; then
    echo -e "${RED}❌ Failed to start frontend development server${NC}"
    echo -e "${RED}   Check logs: tail -f $LOG_FILE${NC}"
    exit 1
fi

# Save PID to file
echo $NODE_PID > "$PID_FILE"

# Check if server started successfully
if ps -p $NODE_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend development server started successfully!${NC}"
    echo -e "${GREEN}🔧 Process ID: $NODE_PID${NC}"
    echo -e "${GREEN}🌐 Access URLs:${NC}"
    echo -e "${GREEN}   - Main Website: http://localhost:3000${NC}"
    echo -e "${GREEN}   - Admin Panel: http://localhost:3000/admin${NC}"
    echo -e "${GREEN}   - Debug Dashboard: http://localhost:3000/debug${NC}"
    echo ""
    echo -e "${BLUE}📋 Management Commands:${NC}"
    echo -e "${BLUE}   - Stop server: $0 stop${NC}"
    echo -e "${BLUE}   - View logs: tail -f $LOG_FILE${NC}"
    echo -e "${BLUE}   - Check status: $0 status${NC}"
    echo ""
    echo -e "${GREEN}🔥 Hot reload is enabled - changes will auto-refresh${NC}"
else
    echo -e "${RED}❌ Failed to start frontend development server${NC}"
    rm "$PID_FILE"
    exit 1
fi
