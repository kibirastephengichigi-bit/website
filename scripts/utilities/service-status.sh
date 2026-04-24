#!/bin/bash

# Service Status Check Script
# Checks the status of all services

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

echo -e "${BLUE}📊 Website Service Status${NC}"
echo "=================================================="

# Function to check service status
check_service() {
    local name=$1
    local port=$2
    local health_url=$3
    local pid_file=$4
    
    echo -e "${BLUE}🔍 Checking $name...${NC}"
    
    # Check PID file
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Process running (PID: $PID)${NC}"
        else
            echo -e "${RED}   ❌ Stale PID file - process not running${NC}"
            rm "$pid_file"
        fi
    else
        echo -e "${YELLOW}   ⚠️  No PID file found${NC}"
    fi
    
    # Check port
    if ss -tuln | grep -q ":$port "; then
        echo -e "${GREEN}   ✅ Port $port is in use${NC}"
        
        # Show process using port
        PROCESS=$(lsof -i :$port 2>/dev/null | tail -1)
        if [ -n "$PROCESS" ]; then
            echo -e "${GREEN}   📋 Process: $PROCESS${NC}"
        fi
    else
        echo -e "${RED}   ❌ Port $port is not in use${NC}"
    fi
    
    # Check health endpoint if provided
    if [ -n "$health_url" ]; then
        if curl -s "$health_url" > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Health check responding${NC}"
            
            # Try to get additional info
            if [ "$name" = "Admin Backend" ]; then
                STATS=$(curl -s "$health_url/../debug/stats" 2>/dev/null)
                if [ $? -eq 0 ]; then
                    echo "$STATS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    stats = data.get('server_stats', {})
    print(f'   📊 Requests: {stats.get(\"total_requests\", 0)} | Auth: {stats.get(\"auth_attempts\", 0)} | Sessions: {stats.get(\"active_sessions\", 0)}')
except:
    pass
" 2>/dev/null || echo -e "${YELLOW}   ⚠️  Could not fetch stats${NC}"
            fi
        else
            echo -e "${RED}   ❌ Health check not responding${NC}"
        fi
    fi
    
    echo ""
}

# Check all services
check_service "Frontend" "3000" "http://localhost:3000" "$PROJECT_ROOT/.frontend-dev.pid"
check_service "Admin Backend" "8000" "http://localhost:8000/api/health" "$PROJECT_ROOT/.debug-server.pid"

# Check Scholars API (optional)
if ss -tuln | grep -q ":8081 "; then
    echo -e "${BLUE}🔍 Checking Scholars API...${NC}"
    echo -e "${GREEN}   ✅ Port 8081 is in use${NC}"
    PROCESS=$(lsof -i :8081 2>/dev/null | tail -1)
    if [ -n "$PROCESS" ]; then
        echo -e "${GREEN}   📋 Process: $PROCESS${NC}"
    fi
    echo ""
else
    echo -e "${BLUE}🔍 Scholars API Status:${NC}"
    echo -e "${YELLOW}   ⚠️  Scholars API not running on port 8081${NC}"
    echo ""
fi

# System information
echo -e "${BLUE}💻 System Information:${NC}"
echo -e "${GREEN}   📁 Project Root: $PROJECT_ROOT${NC}"
echo -e "${GREEN}   🔧 Working Directory: $(pwd)${NC}"
echo -e "${GREEN}   🕐 Current Time: $(date)${NC}"

# Port summary
echo ""
echo -e "${BLUE}🔌 Port Summary:${NC}"
for port in 3000 8000 8081; do
    if ss -tuln | grep -q ":$port "; then
        echo -e "${GREEN}   ✅ Port $port: IN USE${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Port $port: AVAILABLE${NC}"
    fi
done

# Management commands
echo ""
echo -e "${BLUE}📋 Management Commands:${NC}"
echo -e "${YELLOW}   - Start all services:    ./scripts/utilities/start-all-services.sh${NC}"
echo -e "${YELLOW}   - Stop all services:     ./scripts/utilities/stop-all-services.sh${NC}"
echo -e "${YELLOW}   - Check port conflicts: ./scripts/utilities/port-check.sh${NC}"
echo -e "${YELLOW}   - Start frontend:      ./scripts/frontend/start-dev-server.sh${NC}"
echo -e "${YELLOW}   - Start backend:       ./scripts/backend/start-debug-server.sh${NC}"
echo -e "${YELLOW}   - Stop frontend:       ./scripts/frontend/stop-dev-server.sh${NC}"
echo -e "${YELLOW}   - Stop backend:        ./scripts/backend/stop-debug-server.sh${NC}"

# Access URLs
echo ""
echo -e "${BLUE}🌐 Access URLs (if services are running):${NC}"
echo -e "${GREEN}   - Main Website:     http://localhost:3000${NC}"
echo -e "${GREEN}   - Admin Panel:      http://localhost:3000/admin${NC}"
echo -e "${GREEN}   - Debug Dashboard:  http://localhost:3000/debug${NC}"
echo -e "${GREEN}   - Admin API:        http://localhost:8000${NC}"
echo -e "${GREEN}   - Backend Stats:    http://localhost:8000/api/debug/stats${NC}"
