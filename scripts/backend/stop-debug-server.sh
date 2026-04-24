#!/bin/bash

# Debug Admin Backend Server Stop Script
# Stops the enhanced admin backend server gracefully

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR)")"
PID_FILE="$PROJECT_ROOT/.debug-server.pid"
LOG_FILE="$PROJECT_ROOT/backend/data/debug.log"

echo -e "${BLUE}🛑 Stopping Debug Admin Backend Server${NC}"
echo "=================================================="

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠️  No PID file found. Server may not be running.${NC}"
    echo -e "${YELLOW}   Checking for processes on port 8000...${NC}"
    
    # Check if port 8000 is still in use
    if ss -tuln | grep -q ":8000 "; then
        echo -e "${YELLOW}⚠️  Port 8000 is still in use. Force killing...${NC}"
        fuser -k 8000/tcp 2>/dev/null || true
        echo -e "${GREEN}✅ Port 8000 cleared${NC}"
    else
        echo -e "${GREEN}✅ No server running on port 8000${NC}"
    fi
    exit 0
fi

# Read PID from file
PID=$(cat "$PID_FILE")

# Check if process is running
if ! ps -p $PID > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Process $PID not found. Removing stale PID file.${NC}"
    rm "$PID_FILE"
    
    # Check if port 8000 is still in use
    if ss -tuln | grep -q ":8000 "; then
        echo -e "${YELLOW}⚠️  Port 8000 is still in use. Force killing...${NC}"
        fuser -k 8000/tcp 2>/dev/null || true
        echo -e "${GREEN}✅ Port 8000 cleared${NC}"
    fi
    exit 0
fi

echo -e "${GREEN}🔄 Stopping debug server (PID: $PID)...${NC}"

# Try graceful shutdown first
kill $PID 2>/dev/null || true

# Wait for process to stop
for i in {1..10}; do
    if ! ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server stopped gracefully${NC}"
        rm "$PID_FILE"
        
        # Verify port is released
        sleep 1
        if ss -tuln | grep -q ":8000 "; then
            echo -e "${YELLOW}⚠️  Port 8000 still in use, force killing...${NC}"
            fuser -k 8000/tcp 2>/dev/null || true
        fi
        
        echo -e "${GREEN}✅ Debug server stopped successfully${NC}"
        exit 0
    fi
    
    echo -e "${YELLOW}⏳ Waiting for server to stop... ($i/10)${NC}"
    sleep 1
done

# Force kill if graceful shutdown failed
echo -e "${YELLOW}⚠️  Graceful shutdown failed, force killing...${NC}"
kill -9 $PID 2>/dev/null || true
rm "$PID_FILE"

# Final port check
sleep 1
if ss -tuln | grep -q ":8000 "; then
    echo -e "${YELLOW}⚠️  Port 8000 still in use, force killing...${NC}"
    fuser -k 8000/tcp 2>/dev/null || true
fi

echo -e "${GREEN}✅ Debug server stopped successfully${NC}"
