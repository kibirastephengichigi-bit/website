#!/bin/bash

# Frontend Development Server Stop Script
# Stops the Next.js development server gracefully

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
PID_FILE="$PROJECT_ROOT/.frontend-dev.pid"
LOG_FILE="$PROJECT_ROOT/.next/frontend-dev.log"

echo -e "${BLUE}🛑 Stopping Frontend Development Server${NC}"
echo "=================================================="

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}⚠️  No PID file found. Frontend may not be running.${NC}"
    echo -e "${YELLOW}   Checking for Next.js processes on port 3000...${NC}"
    
    # Check for Next.js processes
    NEXT_PIDS=$(pgrep -f "next dev" || true)
    if [ -n "$NEXT_PIDS" ]; then
        echo -e "${YELLOW}⚠️  Found Next.js processes: $NEXT_PIDS${NC}"
        echo -e "${YELLOW}   Stopping them...${NC}"
        echo "$NEXT_PIDS" | xargs kill 2>/dev/null || true
        echo -e "${GREEN}✅ Next.js processes stopped${NC}"
    else
        echo -e "${GREEN}✅ No Next.js processes found${NC}"
    fi
    
    # Check if port 3000 is still in use
    if ss -tuln | grep -q ":3000 "; then
        echo -e "${YELLOW}⚠️  Port 3000 is still in use. Force killing...${NC}"
        fuser -k 3000/tcp 2>/dev/null || true
        echo -e "${GREEN}✅ Port 3000 cleared${NC}"
    else
        echo -e "${GREEN}✅ Port 3000 is available${NC}"
    fi
    exit 0
fi

# Read PID from file
PID=$(cat "$PID_FILE")

# Check if process is running
if ! ps -p $PID > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Process $PID not found. Removing stale PID file.${NC}"
    rm "$PID_FILE"
    
    # Check for any remaining Next.js processes
    NEXT_PIDS=$(pgrep -f "next dev" || true)
    if [ -n "$NEXT_PIDS" ]; then
        echo -e "${YELLOW}⚠️  Found remaining Next.js processes: $NEXT_PIDS${NC}"
        echo -e "${YELLOW}   Stopping them...${NC}"
        echo "$NEXT_PIDS" | xargs kill 2>/dev/null || true
    fi
    
    exit 0
fi

echo -e "${GREEN}🔄 Stopping frontend development server (PID: $PID)...${NC}"

# Try graceful shutdown first
kill $PID 2>/dev/null || true

# Wait for process to stop
for i in {1..10}; do
    if ! ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend server stopped gracefully${NC}"
        rm "$PID_FILE"
        
        # Check for any remaining Next.js processes
        sleep 1
        NEXT_PIDS=$(pgrep -f "next dev" || true)
        if [ -n "$NEXT_PIDS" ]; then
            echo -e "${YELLOW}⚠️  Found remaining Next.js processes: $NEXT_PIDS${NC}"
            echo -e "${YELLOW}   Stopping them...${NC}"
            echo "$NEXT_PIDS" | xargs kill 2>/dev/null || true
        fi
        
        # Verify port is released
        if ss -tuln | grep -q ":3000 "; then
            echo -e "${YELLOW}⚠️  Port 3000 still in use, force killing...${NC}"
            fuser -k 3000/tcp 2>/dev/null || true
        fi
        
        echo -e "${GREEN}✅ Frontend development server stopped successfully${NC}"
        exit 0
    fi
    
    echo -e "${YELLOW}⏳ Waiting for server to stop... ($i/10)${NC}"
    sleep 1
done

# Force kill if graceful shutdown failed
echo -e "${YELLOW}⚠️  Graceful shutdown failed, force killing...${NC}"
kill -9 $PID 2>/dev/null || true
rm "$PID_FILE"

# Kill any remaining Next.js processes
NEXT_PIDS=$(pgrep -f "next dev" || true)
if [ -n "$NEXT_PIDS" ]; then
    echo -e "${YELLOW}⚠️  Force killing remaining Next.js processes...${NC}"
    echo "$NEXT_PIDS" | xargs kill -9 2>/dev/null || true
fi

# Final port check
sleep 1
if ss -tuln | grep -q ":3000 "; then
    echo -e "${YELLOW}⚠️  Port 3000 still in use, force killing...${NC}"
    fuser -k 3000/tcp 2>/dev/null || true
fi

echo -e "${GREEN}✅ Frontend development server stopped successfully${NC}"
