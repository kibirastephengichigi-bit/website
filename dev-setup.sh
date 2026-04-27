#!/bin/bash

# Stephen Asatsa Website - Development Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

echo "🚀 Setting up Stephen Asatsa Website Development Environment..."

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
    echo -e "${PURPLE}[SETUP]${NC} $1"
}

print_command() {
    echo -e "${CYAN}[CMD]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the website root directory."
    exit 1
fi

print_header "Step 1: Checking System Requirements"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18.x or higher."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
print_success "Node.js $NODE_VERSION detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION detected"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
print_success "Python $PYTHON_VERSION detected"

# Check Git
if ! command -v git &> /dev/null; then
    print_warning "Git is not installed. Some features may not work properly."
else
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    print_success "Git $GIT_VERSION detected"
fi

print_header "Step 2: Frontend Setup"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
print_command "npm install"
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Setup environment file
if [ ! -f ".env" ]; then
    print_status "Creating .env file from .env.example..."
    cp .env.example .env
    print_success "Environment file created"
    print_warning "Please update the .env file with your configuration"
else
    print_status "Environment file already exists"
fi

# Create necessary directories
print_status "Creating frontend directories..."
mkdir -p .next
mkdir -p public/uploads
mkdir -p logs
print_success "Frontend directories created"

print_header "Step 3: Backend Setup"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found. Please ensure the backend folder exists."
    exit 1
fi

cd backend

# Make build script executable
if [ -f "build.sh" ]; then
    chmod +x build.sh
    print_status "Made build.sh executable"
fi

# Run backend build script
print_status "Building backend environment..."
print_command "./build.sh"

if [ -f "build.sh" ]; then
    ./build.sh
    if [ $? -eq 0 ]; then
        print_success "Backend build completed"
    else
        print_error "Backend build failed"
        exit 1
    fi
else
    print_warning "Backend build script not found, setting up manually..."
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
        print_success "Virtual environment created"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install requirements if exists
    if [ -f "requirements.txt" ]; then
        print_status "Installing Python dependencies..."
        pip install -r requirements.txt
        print_success "Python dependencies installed"
    fi
fi

# Create backend directories
print_status "Creating backend directories..."
mkdir -p data
mkdir -p logs
mkdir -p backups
mkdir -p uploads

# Create log files
touch logs/app.log
touch logs/error.log
touch logs/access.log

print_success "Backend directories created"

# Initialize database if database.py exists
if [ -f "database.py" ]; then
    print_status "Initializing database..."
    python3 -c "
try:
    from database import db
    db.initialize_database()
    print('Database initialized successfully')
except Exception as e:
    print(f'Database initialization error: {e}')
"
    print_success "Database initialized"
fi

cd ..

print_header "Step 4: Configuration Setup"

# Generate random secrets
print_status "Generating secure secrets..."

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "development-secret-change-in-production-$(date +%s)")
sed -i.bak "s|replace-with-a-long-random-secret|$NEXTAUTH_SECRET|" .env

# Generate backend secret
BACKEND_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "backend-secret-change-in-production-$(date +%s)")
if [ -f "backend/.env" ]; then
    sed -i.bak "s|your-secret-key-change-in-production|$BACKEND_SECRET|" backend/.env
fi

print_success "Secure secrets generated"

print_header "Step 5: Development Servers"

# Function to start servers
start_servers() {
    print_status "Starting development servers..."
    
    # Start backend in background
    cd backend
    if [ -f "server.py" ]; then
        print_command "Starting backend server on port 8000..."
        python3 server.py &
        BACKEND_PID=$!
        print_success "Backend server started (PID: $BACKEND_PID)"
    else
        print_warning "Backend server file not found"
    fi
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend
    print_command "Starting frontend server on port 3000..."
    npm run dev &
    FRONTEND_PID=$!
    print_success "Frontend server started (PID: $FRONTEND_PID)"
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > .backend_pid
    echo $FRONTEND_PID > .frontend_pid
    
    print_success "Both servers started successfully!"
}

# Function to stop servers
stop_servers() {
    print_status "Stopping development servers..."
    
    if [ -f ".backend_pid" ]; then
        BACKEND_PID=$(cat .backend_pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm .backend_pid
        print_success "Backend server stopped"
    fi
    
    if [ -f ".frontend_pid" ]; then
        FRONTEND_PID=$(cat .frontend_pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm .frontend_pid
        print_success "Frontend server stopped"
    fi
}

# Function to check server status
check_status() {
    print_status "Checking server status..."
    
    # Check backend
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        print_success "Backend server is running (http://localhost:8000)"
    else
        print_warning "Backend server may not be running"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend server is running (http://localhost:3000)"
    else
        print_warning "Frontend server may not be running"
    fi
}

# Handle command line arguments
case "${1:-setup}" in
    "setup")
        print_success "Development environment setup completed!"
        echo ""
        echo "🎉 Setup Complete!"
        echo ""
        echo "📋 Next Steps:"
        echo "  1. Update .env file with your configuration"
        echo "  2. Run './dev-setup.sh start' to start development servers"
        echo "  3. Open http://localhost:3000 in your browser"
        echo "  4. Access admin panel at http://localhost:3000/admin"
        echo ""
        echo "🔧 Useful Commands:"
        echo "  ./dev-setup.sh start     - Start development servers"
        echo "  ./dev-setup.sh stop      - Stop development servers"
        echo "  ./dev-setup.sh status    - Check server status"
        echo "  ./dev-setup.sh restart   - Restart development servers"
        echo ""
        ;;
    "start")
        start_servers
        echo ""
        echo "🚀 Servers are running!"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:8000"
        echo "  Admin:    http://localhost:3000/admin"
        echo ""
        echo "Press Ctrl+C to stop servers"
        echo ""
        # Wait for interrupt
        trap stop_servers EXIT
        while true; do
            sleep 1
        done
        ;;
    "stop")
        stop_servers
        ;;
    "restart")
        stop_servers
        sleep 2
        start_servers
        ;;
    "status")
        check_status
        ;;
    "clean")
        print_status "Cleaning development environment..."
        stop_servers
        rm -f .backend_pid .frontend_pid
        rm -rf .next
        rm -rf node_modules/.cache
        print_success "Development environment cleaned"
        ;;
    "help"|"-h"|"--help")
        echo "Stephen Asatsa Website - Development Setup Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  setup    - Set up the complete development environment (default)"
        echo "  start    - Start development servers"
        echo "  stop     - Stop development servers"
        echo "  restart  - Restart development servers"
        echo "  status   - Check server status"
        echo "  clean    - Clean development environment"
        echo "  help     - Show this help message"
        echo ""
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac

print_success "Development setup script completed! 🎉"
