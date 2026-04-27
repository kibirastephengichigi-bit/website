#!/bin/bash

# Scholar Forge Startup Script
# This script starts and stops the scholar-forge application

set -e

echo "🚀 Scholar Forge Service Manager"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[SERVICE]${NC} $1"
}

print_command() {
    echo -e "${CYAN}[CMD]${NC} $1"
}

# Define paths
WEBSITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHOLAR_FORGE_DIR="$WEBSITE_DIR/../Schoolars-work-bench/artifacts/scholar-forge"
PID_FILE="$WEBSITE_DIR/.scholar-forge.pid"
LOG_FILE="$SCHOLAR_FORGE_DIR/logs/server.log"

# Verify scholar-forge directory exists
if [ ! -d "$SCHOLAR_FORGE_DIR" ]; then
    print_error "Scholar Forge directory not found at: $SCHOLAR_FORGE_DIR"
    print_status "Please run ./scholar-forge-install.sh first"
    exit 1
fi

# Function to start development server
start_dev() {
    print_header "Starting Scholar Forge in Development Mode"
    
    # Check if already running
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            print_warning "Scholar Forge is already running (PID: $PID)"
            print_status "Use './scholar-forge-start.sh stop' to stop it first"
            exit 1
        else
            print_status "Removing stale PID file"
            rm -f "$PID_FILE"
        fi
    fi
    
    cd "$SCHOLAR_FORGE_DIR"
    
    # Create log directory
    mkdir -p logs
    
    print_status "Starting development server on port 4500..."
    print_command "npm run dev"
    
    # Start in background and save PID
    nohup npm run dev > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    # Wait a moment and check if it started successfully
    sleep 3
    
    if ps -p $PID > /dev/null 2>&1; then
        print_success "Scholar Forge development server started (PID: $PID)"
        echo ""
        echo "🌐 Access Scholar Forge at: http://localhost:4500"
        echo "📋 Logs: $LOG_FILE"
        echo ""
        print_status "Use './scholar-forge-start.sh stop' to stop the server"
    else
        print_error "Failed to start Scholar Forge development server"
        print_status "Check logs at: $LOG_FILE"
        rm -f "$PID_FILE"
        exit 1
    fi
}

# Function to start production server
start_prod() {
    print_header "Starting Scholar Forge in Production Mode"
    
    # Check if already running
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            print_warning "Scholar Forge is already running (PID: $PID)"
            print_status "Use './scholar-forge-start.sh stop' to stop it first"
            exit 1
        else
            print_status "Removing stale PID file"
            rm -f "$PID_FILE"
        fi
    fi
    
    cd "$SCHOLAR_FORGE_DIR"
    
    # Check if build exists
    if [ ! -d "dist/public" ]; then
        print_warning "Production build not found"
        print_status "Building Scholar Forge..."
        npm run build
    fi
    
    # Create log directory
    mkdir -p logs
    
    print_status "Starting production server on port 4500..."
    print_command "npm run serve"
    
    # Start in background and save PID
    nohup npm run serve > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    # Wait a moment and check if it started successfully
    sleep 3
    
    if ps -p $PID > /dev/null 2>&1; then
        print_success "Scholar Forge production server started (PID: $PID)"
        echo ""
        echo "🌐 Access Scholar Forge at: http://localhost:4500"
        echo "📋 Logs: $LOG_FILE"
        echo ""
        print_status "Use './scholar-forge-start.sh stop' to stop the server"
    else
        print_error "Failed to start Scholar Forge production server"
        print_status "Check logs at: $LOG_FILE"
        rm -f "$PID_FILE"
        exit 1
    fi
}

# Function to stop server
stop_server() {
    print_header "Stopping Scholar Forge"
    
    if [ ! -f "$PID_FILE" ]; then
        print_warning "Scholar Forge is not running (no PID file found)"
        exit 0
    fi
    
    PID=$(cat "$PID_FILE")
    
    if ps -p $PID > /dev/null 2>&1; then
        print_status "Stopping Scholar Forge (PID: $PID)..."
        kill $PID
        sleep 2
        
        # Force kill if still running
        if ps -p $PID > /dev/null 2>&1; then
            print_warning "Force stopping Scholar Forge..."
            kill -9 $PID
        fi
        
        print_success "Scholar Forge stopped"
    else
        print_warning "Scholar Forge process not found (stale PID file)"
    fi
    
    rm -f "$PID_FILE"
}

# Function to check status
check_status() {
    print_header "Scholar Forge Status"
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            print_success "Scholar Forge is running (PID: $PID)"
            
            # Check if server is responding
            if curl -s http://localhost:4500 > /dev/null 2>&1; then
                print_success "Server is responding at http://localhost:4500"
            else
                print_warning "Server process is running but not responding"
            fi
            
            echo ""
            print_status "Logs: $LOG_FILE"
        else
            print_warning "Scholar Forge is not running (stale PID file)"
            rm -f "$PID_FILE"
        fi
    else
        print_warning "Scholar Forge is not running"
    fi
}

# Function to restart server
restart_server() {
    print_header "Restarting Scholar Forge"
    stop_server
    sleep 2
    
    # Check which mode was running or default to dev
    MODE="${1:-dev}"
    if [ "$MODE" = "prod" ]; then
        start_prod
    else
        start_dev
    fi
}

# Function to view logs
view_logs() {
    if [ -f "$LOG_FILE" ]; then
        print_header "Scholar Forge Logs"
        tail -f "$LOG_FILE"
    else
        print_error "Log file not found: $LOG_FILE"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-help}" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "stop")
        stop_server
        ;;
    "restart")
        restart_server "${2:-dev}"
        ;;
    "status")
        check_status
        ;;
    "logs")
        view_logs
        ;;
    "help"|"-h"|"--help")
        echo "Scholar Forge Service Manager"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  dev      - Start Scholar Forge in development mode (default)"
        echo "  prod     - Start Scholar Forge in production mode"
        echo "  stop     - Stop Scholar Forge"
        echo "  restart  - Restart Scholar Forge (optional: dev|prod)"
        echo "  status   - Check Scholar Forge status"
        echo "  logs     - View Scholar Forge logs (tail -f)"
        echo "  help     - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 dev           # Start development server"
        echo "  $0 prod          # Start production server"
        echo "  $0 restart prod  # Restart in production mode"
        echo "  $0 status        # Check status"
        echo ""
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac
