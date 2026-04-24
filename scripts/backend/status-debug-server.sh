#!/bin/bash

# Debug Admin Backend Server Status Check Script
# Checks the status of the debug admin backend server

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
SERVER_SCRIPT="$PROJECT_ROOT/backend/simple_debug_server.py"
LOG_FILE="$PROJECT_ROOT/backend/data/debug.log"

echo -e "${BLUE}📊 Debug Admin Backend Server Status${NC}"
echo "=================================================="

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo -e "${RED}❌ Server is NOT running (no PID file)${NC}"
    
    # Check if port 8000 is in use
    if ss -tuln | grep -q ":8000 "; then
        echo -e "${YELLOW}⚠️  Port 8000 is in use by another process${NC}"
        echo -e "${YELLOW}   Process details:${NC}"
        lsof -i :8000 2>/dev/null || echo "   Unable to determine process"
    else
        echo -e "${GREEN}✅ Port 8000 is available${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📋 Management Commands:${NC}"
    echo -e "${BLUE}   - Start server: ./scripts/backend/start-debug-server.sh${NC}"
    echo -e "${BLUE}   - Stop server: ./scripts/backend/stop-debug-server.sh${NC}"
    exit 1
fi

# Read PID from file
PID=$(cat "$PID_FILE")

# Check if process is running
if ps -p $PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is RUNNING${NC}"
    echo -e "${GREEN}🔧 Process ID: $PID${NC}"
    
    # Get process details
    PROCESS_INFO=$(ps -p $PID -o pid,ppid,etime,cmd --no-headers)
    echo -e "${GREEN}📋 Process Info: $PROCESS_INFO${NC}"
    
    # Check if server is responding
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is responding to health checks${NC}"
        
        # Get server stats
        STATS=$(curl -s http://localhost:8000/api/debug/stats 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}📊 Server Statistics:${NC}"
            echo "$STATS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
stats = data.get('server_stats', {})
print(f'   - Total Requests: {stats.get(\"total_requests\", 0)}')
print(f'   - Auth Attempts: {stats.get(\"auth_attempts\", 0)}')
print(f'   - Successful Logins: {stats.get(\"successful_logins\", 0)}')
print(f'   - Failed Logins: {stats.get(\"failed_logins\", 0)}')
print(f'   - Active Sessions: {stats.get(\"active_sessions\", 0)}')
print(f'   - Uptime: {stats.get(\"uptime_seconds\", 0):.0f} seconds')
" 2>/dev/null || echo -e "${YELLOW}⚠️  Could not parse server stats${NC}"
    else
        echo -e "${YELLOW}⚠️  Server is running but not responding to health checks${NC}"
    fi
    
    # Check log file
    if [ -f "$LOG_FILE" ]; then
        LOG_SIZE=$(wc -l < "$LOG_FILE")
        echo -e "${GREEN}📝 Log File: $LOG_FILE ($LOG_SIZE lines)${NC}"
        echo -e "${GREEN}📋 Recent logs:${NC}"
        tail -5 "$LOG_FILE" | sed 's/^/   /'
    else
        echo -e "${YELLOW}⚠️  Log file not found: $LOG_FILE${NC}"
    fi
    
else
    echo -e "${RED}❌ Server is NOT running (stale PID file)${NC}"
    echo -e "${YELLOW}🧹 Removing stale PID file${NC}"
    rm "$PID_FILE"
    
    # Check if port 8000 is in use
    if ss -tuln | grep -q ":8000 "; then
        echo -e "${YELLOW}⚠️  Port 8000 is in use by another process${NC}"
        echo -e "${YELLOW}   Process details:${NC}"
        lsof -i :8000 2>/dev/null || echo "   Unable to determine process"
    else
        echo -e "${GREEN}✅ Port 8000 is available${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📋 Management Commands:${NC}"
echo -e "${BLUE}   - Start server: ./scripts/backend/start-debug-server.sh${NC}"
echo -e "${BLUE}   - Stop server: ./scripts/backend/stop-debug-server.sh${NC}"
echo -e "${BLUE}   - View logs: tail -f $LOG_FILE${NC}"
echo -e "${BLUE}   - Debug Stats: http://localhost:8000/api/debug/stats${NC}"
