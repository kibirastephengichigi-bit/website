#!/bin/bash

# Stephen Asatsa Website - Python Backend Daemon Script
# This script manages the Python backend as a system daemon

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Configuration
SERVICE_NAME="stephen-asatsa-backend"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
PYTHON_FILE="app.py"
WORKING_DIR="$(pwd)"
VENV_PATH="${WORKING_DIR}/venv"
LOG_FILE="${WORKING_DIR}/logs/app.log"
ERROR_LOG="${WORKING_DIR}/logs/error.log"
PID_FILE="${WORKING_DIR}/backend.pid"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script requires root privileges to manage system services"
    print_status "Try running with: sudo $0 $1"
    exit 1
fi

# Function to create systemd service file
create_service_file() {
    print_status "Creating systemd service file..."
    
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Stephen Asatsa Website Backend API
After=network.target
Wants=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=${WORKING_DIR}
Environment=PATH=${VENV_PATH}/bin
Environment=FLASK_APP=${PYTHON_FILE}
Environment=FLASK_ENV=production
Environment=FLASK_DEBUG=False
ExecStart=${VENV_PATH}/bin/python ${PYTHON_FILE}
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
StandardOutput=append:${LOG_FILE}
StandardError=append:${ERROR_LOG}
PIDFile=${PID_FILE}

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${WORKING_DIR}/logs ${WORKING_DIR}/data ${WORKING_DIR}/backups

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF

    print_success "Systemd service file created: $SERVICE_FILE"
}

# Function to install the service
install_service() {
    print_status "Installing ${SERVICE_NAME} service..."
    
    # Create service file
    create_service_file
    
    # Set proper permissions
    chmod 644 "$SERVICE_FILE"
    
    # Create necessary directories with proper permissions
    mkdir -p "${WORKING_DIR}/logs"
    mkdir -p "${WORKING_DIR}/data"
    mkdir -p "${WORKING_DIR}/backups"
    
    # Set ownership for www-data user
    chown -R www-data:www-data "${WORKING_DIR}/logs"
    chown -R www-data:www-data "${WORKING_DIR}/data"
    chown -R www-data:www-data "${WORKING_DIR}/backups"
    
    # Reload systemd
    systemctl daemon-reload
    
    # Enable the service
    systemctl enable "$SERVICE_NAME"
    
    print_success "Service installed and enabled"
}

# Function to start the service
start_service() {
    print_status "Starting ${SERVICE_NAME} service..."
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_warning "Service is already running"
        return 0
    fi
    
    systemctl start "$SERVICE_NAME"
    
    # Wait a moment for service to start
    sleep 3
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "Service started successfully"
        print_status "Service status:"
        systemctl status "$SERVICE_NAME" --no-pager
    else
        print_error "Failed to start service"
        print_status "Service status:"
        systemctl status "$SERVICE_NAME" --no-pager
        exit 1
    fi
}

# Function to stop the service
stop_service() {
    print_status "Stopping ${SERVICE_NAME} service..."
    
    if ! systemctl is-active --quiet "$SERVICE_NAME"; then
        print_warning "Service is not running"
        return 0
    fi
    
    systemctl stop "$SERVICE_NAME"
    
    # Wait a moment for service to stop
    sleep 2
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_error "Failed to stop service"
        exit 1
    else
        print_success "Service stopped successfully"
    fi
}

# Function to restart the service
restart_service() {
    print_status "Restarting ${SERVICE_NAME} service..."
    
    systemctl restart "$SERVICE_NAME"
    
    # Wait a moment for service to restart
    sleep 3
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "Service restarted successfully"
        print_status "Service status:"
        systemctl status "$SERVICE_NAME" --no-pager
    else
        print_error "Failed to restart service"
        print_status "Service status:"
        systemctl status "$SERVICE_NAME" --no-pager
        exit 1
    fi
}

# Function to check service status
status_service() {
    print_status "${SERVICE_NAME} service status:"
    echo ""
    systemctl status "$SERVICE_NAME" --no-pager
    echo ""
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        print_success "Service is running"
        
        # Show recent logs
        echo ""
        print_status "Recent logs:"
        journalctl -u "$SERVICE_NAME" --no-pager -n 10
    else
        print_warning "Service is not running"
    fi
}

# Function to show logs
logs_service() {
    print_status "Showing logs for ${SERVICE_NAME} service:"
    echo ""
    journalctl -u "$SERVICE_NAME" -f
}

# Function to uninstall the service
uninstall_service() {
    print_status "Uninstalling ${SERVICE_NAME} service..."
    
    # Stop and disable service
    systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    
    # Remove service file
    if [ -f "$SERVICE_FILE" ]; then
        rm "$SERVICE_FILE"
        print_success "Service file removed"
    fi
    
    # Reload systemd
    systemctl daemon-reload
    
    # Reset file ownership
    chown -R $(logname):$(logname) "$WORKING_DIR" 2>/dev/null || true
    
    print_success "Service uninstalled successfully"
}

# Function to monitor service health
monitor_service() {
    print_status "Monitoring ${SERVICE_NAME} service health..."
    
    while true; do
        if systemctl is-active --quiet "$SERVICE_NAME"; then
            # Check if the server is responding
            if curl -s http://localhost:8000/ > /dev/null 2>&1; then
                print_success "$(date): Service is healthy and responding"
            else
                print_warning "$(date): Service is running but not responding"
            fi
        else
            print_error "$(date): Service is not running"
            # Try to restart the service
            print_status "Attempting to restart service..."
            systemctl restart "$SERVICE_NAME"
        fi
        
        sleep 30
    done
}

# Function to update service configuration
update_service() {
    print_status "Updating ${SERVICE_NAME} service configuration..."
    
    # Recreate service file
    create_service_file
    
    # Reload systemd
    systemctl daemon-reload
    
    # Restart service if it's running
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        systemctl restart "$SERVICE_NAME"
        print_success "Service configuration updated and restarted"
    else
        print_success "Service configuration updated"
    fi
}

# Function to show help
show_help() {
    echo "Stephen Asatsa Website Backend Daemon Manager"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  install     Install the systemd service"
    echo "  start       Start the service"
    echo "  stop        Stop the service"
    echo "  restart     Restart the service"
    echo "  status      Show service status"
    echo "  logs        Show service logs"
    echo "  monitor     Monitor service health (continuous)"
    echo "  update      Update service configuration"
    echo "  uninstall   Uninstall the service"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  sudo $0 install     # Install and enable the service"
    echo "  sudo $0 start       # Start the service"
    echo "  sudo $0 status      # Check service status"
    echo "  sudo $0 logs        # View service logs"
}

# Main script logic
case "${1:-}" in
    install)
        install_service
        ;;
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        status_service
        ;;
    logs)
        logs_service
        ;;
    monitor)
        monitor_service
        ;;
    update)
        update_service
        ;;
    uninstall)
        uninstall_service
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: ${1:-}"
        echo ""
        show_help
        exit 1
        ;;
esac
