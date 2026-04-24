#!/bin/bash

# Debug Admin Backend Server Startup Script
# Starts the enhanced admin backend with debugging and monitoring

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
BACKEND_DIR="$PROJECT_ROOT/backend"
SERVER_SCRIPT="$BACKEND_DIR/simple_debug_server.py"
PID_FILE="$PROJECT_ROOT/.debug-server.pid"
LOG_FILE="$BACKEND_DIR/data/debug.log"

echo -e "${BLUE}🚀 Starting Debug Admin Backend Server${NC}"
echo "=================================================="

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found: $BACKEND_DIR${NC}"
    exit 1
fi

# Check if server script exists
if [ ! -f "$SERVER_SCRIPT" ]; then
    echo -e "${RED}❌ Server script not found: $SERVER_SCRIPT${NC}"
    exit 1
fi

# Check if server is already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Server is already running (PID: $PID)${NC}"
        echo -e "${YELLOW}   Use '$0 stop' to stop it first${NC}"
        exit 1
    else
        echo -e "${YELLOW}🧹 Removing stale PID file${NC}"
        rm "$PID_FILE"
    fi
fi

# Create data directory if it doesn't exist
mkdir -p "$BACKEND_DIR/data"

# Check if port 8000 is available
if ss -tuln | grep -q ":8000 "; then
    echo -e "${RED}❌ Port 8000 is already in use!${NC}"
    echo -e "${RED}   Please stop the service using this port first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Starting debug server...${NC}"
echo -e "${GREEN}📁 Backend Directory: $BACKEND_DIR${NC}"
echo -e "${GREEN}📋 Log File: $LOG_FILE${NC}"
echo -e "${GREEN}🌐 Server URL: http://localhost:8000${NC}"
echo -e "${GREEN}📊 Debug Dashboard: http://localhost:8000/api/debug/stats${NC}"
echo ""

# Change to backend directory and start server
cd "$BACKEND_DIR"

# Start server in background and capture PID
python3 simple_debug_server.py &
SERVER_PID=$!

# Save PID to file
echo $SERVER_PID > "$PID_FILE"

# Wait a moment to check if server started successfully
sleep 2

if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Debug server started successfully!${NC}"
    echo -e "${GREEN}🔧 Process ID: $SERVER_PID${NC}"
    echo -e "${GREEN}🌐 Access URLs:${NC}"
    echo -e "${GREEN}   - Main API: http://localhost:8000${NC}"
    echo -e "${GREEN}   - Health Check: http://localhost:8000/api/health${NC}"
    echo -e "${GREEN}   - Debug Stats: http://localhost:8000/api/debug/stats${NC}"
    echo -e "${GREEN}   - Debug Logs: http://localhost:8000/api/debug/logs${NC}"
    echo ""
    echo -e "${BLUE}📋 Management Commands:${NC}"
    echo -e "${BLUE}   - Stop server: $0 stop${NC}"
    echo -e "${BLUE}   - View logs: tail -f $LOG_FILE${NC}"
    echo -e "${BLUE}   - Check status: $0 status${NC}"
else
    echo -e "${RED}❌ Failed to start debug server${NC}"
    rm "$PID_FILE"
    exit 1
fi
