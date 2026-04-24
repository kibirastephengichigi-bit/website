#!/bin/bash

# Stephen Asatsa Website - Systemd Deployment Script
# This script sets up systemd services and nginx for the website

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
SYSTEMD_DIR="$PROJECT_ROOT/systemd"
NGINX_DIR="$PROJECT_ROOT/nginx"
LOG_DIR="$PROJECT_ROOT/logs"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKEND_DIR/logs"
    mkdir -p "$BACKEND_DIR/data"
    mkdir -p "$PROJECT_ROOT/public/uploads/admin"
    print_info "Directories created successfully"
}

# Install dependencies
install_dependencies() {
    print_info "Checking and installing dependencies..."
    
    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        print_info "Installing nginx..."
        apt-get update
        apt-get install -y nginx
    else
        print_info "nginx is already installed"
    fi
    
    # Check if node is installed
    if ! command -v node &> /dev/null; then
        print_info "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    else
        print_info "Node.js is already installed"
    fi
    
    # Check if python3 is installed
    if ! command -v python3 &> /dev/null; then
        print_info "Installing Python 3..."
        apt-get install -y python3 python3-pip python3-venv
    else
        print_info "Python 3 is already installed"
    fi
    
    print_info "Dependencies check completed"
}

# Setup Python virtual environment for backend
setup_backend_venv() {
    print_info "Setting up Python virtual environment for backend..."
    
    if [ ! -d "$BACKEND_DIR/venv" ]; then
        print_info "Creating virtual environment..."
        python3 -m venv "$BACKEND_DIR/venv"
    fi
    
    print_info "Installing Python dependencies..."
    source "$BACKEND_DIR/venv/bin/activate"
    if [ -f "$BACKEND_DIR/requirements.txt" ]; then
        pip install -r "$BACKEND_DIR/requirements.txt"
    else
        print_warning "No requirements.txt found, skipping pip install"
    fi
    deactivate
    
    print_info "Backend virtual environment setup completed"
}

# Install Node.js dependencies for frontend
install_frontend_deps() {
    print_info "Installing Node.js dependencies for frontend..."
    
    cd "$PROJECT_ROOT"
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_info "Frontend dependencies installed"
}

# Build Next.js application
build_frontend() {
    print_info "Building Next.js application..."
    
    cd "$PROJECT_ROOT"
    npm run build
    
    print_info "Frontend build completed"
}

# Setup systemd services
setup_systemd_services() {
    print_info "Setting up systemd services..."
    
    # Copy backend service file
    if [ -f "$SYSTEMD_DIR/stephenasatsa-backend.service" ]; then
        print_info "Installing backend systemd service..."
        cp "$SYSTEMD_DIR/stephenasatsa-backend.service" /etc/systemd/system/
        systemctl daemon-reload
        systemctl enable stephenasatsa-backend.service
        print_info "Backend service installed and enabled"
    else
        print_error "Backend service file not found at $SYSTEMD_DIR/stephenasatsa-backend.service"
        exit 1
    fi
    
    # Copy frontend service file
    if [ -f "$SYSTEMD_DIR/stephenasatsa-frontend.service" ]; then
        print_info "Installing frontend systemd service..."
        cp "$SYSTEMD_DIR/stephenasatsa-frontend.service" /etc/systemd/system/
        systemctl daemon-reload
        systemctl enable stephenasatsa-frontend.service
        print_info "Frontend service installed and enabled"
    else
        print_error "Frontend service file not found at $SYSTEMD_DIR/stephenasatsa-frontend.service"
        exit 1
    fi
}

# Setup nginx configuration
setup_nginx() {
    print_info "Setting up nginx configuration..."
    
    if [ -f "$NGINX_DIR/stephenasatsa.conf" ]; then
        # Remove existing configuration if present
        if [ -f "/etc/nginx/sites-available/stephenasatsa" ]; then
            print_info "Removing existing nginx configuration..."
            rm -f /etc/nginx/sites-available/stephenasatsa
            rm -f /etc/nginx/sites-enabled/stephenasatsa
        fi
        
        # Copy new configuration
        print_info "Installing nginx configuration..."
        cp "$NGINX_DIR/stephenasatsa.conf" /etc/nginx/sites-available/stephenasatsa
        
        # Create symbolic link
        ln -sf /etc/nginx/sites-available/stephenasatsa /etc/nginx/sites-enabled/stephenasatsa
        
        # Remove default nginx site
        if [ -f "/etc/nginx/sites-enabled/default" ]; then
            rm -f /etc/nginx/sites-enabled/default
        fi
        
        # Test nginx configuration
        print_info "Testing nginx configuration..."
        nginx -t
        
        # Reload nginx
        systemctl reload nginx
        print_info "Nginx configuration completed"
    else
        print_error "Nginx configuration file not found at $NGINX_DIR/stephenasatsa.conf"
        exit 1
    fi
}

# Set permissions
set_permissions() {
    print_info "Setting permissions..."
    
    # Set ownership for www-data user
    chown -R www-data:www-data "$PROJECT_ROOT"
    chown -R www-data:www-data "$BACKEND_DIR"
    chmod -R 755 "$PROJECT_ROOT"
    chmod -R 755 "$BACKEND_DIR"
    
    print_info "Permissions set successfully"
}

# Start services
start_services() {
    print_info "Starting services..."
    
    # Start backend service
    print_info "Starting backend service..."
    systemctl start stephenasatsa-backend.service
    sleep 3
    
    # Check if backend is running
    if systemctl is-active --quiet stephenasatsa-backend.service; then
        print_info "Backend service started successfully"
    else
        print_error "Backend service failed to start"
        systemctl status stephenasatsa-backend.service
        exit 1
    fi
    
    # Start frontend service
    print_info "Starting frontend service..."
    systemctl start stephenasatsa-frontend.service
    sleep 3
    
    # Check if frontend is running
    if systemctl is-active --quiet stephenasatsa-frontend.service; then
        print_info "Frontend service started successfully"
    else
        print_error "Frontend service failed to start"
        systemctl status stephenasatsa-frontend.service
        exit 1
    fi
    
    # Restart nginx
    print_info "Restarting nginx..."
    systemctl restart nginx
    sleep 2
    
    if systemctl is-active --quiet nginx; then
        print_info "Nginx restarted successfully"
    else
        print_error "Nginx failed to restart"
        systemctl status nginx
        exit 1
    fi
}

# Display status
display_status() {
    print_info "Service Status:"
    echo ""
    echo "Backend Service:"
    systemctl status stephenasatsa-backend.service --no-pager
    echo ""
    echo "Frontend Service:"
    systemctl status stephenasatsa-frontend.service --no-pager
    echo ""
    echo "Nginx:"
    systemctl status nginx --no-pager
    echo ""
    print_info "Deployment completed successfully!"
    echo ""
    echo "Website should be accessible at: http://localhost"
    echo "Backend API: http://localhost/api/"
    echo ""
    echo "To view logs:"
    echo "  Backend: journalctl -u stephenasatsa-backend -f"
    echo "  Frontend: journalctl -u stephenasatsa-frontend -f"
    echo "  Nginx: journalctl -u nginx -f"
    echo ""
    echo "To manage services:"
    echo "  Start: sudo systemctl start stephenasatsa-backend stephenasatsa-frontend"
    echo "  Stop: sudo systemctl stop stephenasatsa-backend stephenasatsa-frontend"
    echo "  Restart: sudo systemctl restart stephenasatsa-backend stephenasatsa-frontend"
}

# Main execution
main() {
    print_info "Starting deployment process for Stephen Asatsa Website..."
    echo ""
    
    check_root
    create_directories
    install_dependencies
    setup_backend_venv
    install_frontend_deps
    build_frontend
    setup_systemd_services
    setup_nginx
    set_permissions
    start_services
    display_status
}

# Run main function
main
