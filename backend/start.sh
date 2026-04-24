#!/bin/bash

# Stephen Asatsa Website - Python Backend Start Script
# This script starts the Python backend server with proper environment setup

set -e  # Exit on any error

echo "🐍 Starting Stephen Asatsa Website Backend..."

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

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Virtual environment not found. Creating..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Check if requirements.txt exists and install dependencies
if [ -f "requirements.txt" ]; then
    print_status "Installing/updating dependencies..."
    pip install -r requirements.txt
    print_success "Dependencies installed"
else
    print_error "requirements.txt not found"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_status "Creating .env file from .env.example..."
        cp .env.example .env
        print_warning "Please update the SECRET_KEY in .env file"
    else
        print_status "Creating default .env file..."
        cat > .env << EOF
SECRET_KEY=your-secret-key-change-in-production-$(date +%s)
FLASK_ENV=development
FLASK_DEBUG=True
EOF
        print_warning "Default .env file created. Please review and update."
    fi
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p data
mkdir -p backups

# Create log files if they don't exist
touch logs/app.log
touch logs/error.log
touch logs/access.log

# Check which Python file to use
PYTHON_FILE=""
if [ -f "app.py" ]; then
    PYTHON_FILE="app.py"
elif [ -f "main.py" ]; then
    PYTHON_FILE="main.py"
else
    print_error "No Python application file found (app.py or main.py)"
    exit 1
fi

print_status "Using Python file: $PYTHON_FILE"

# Check if the port is already in use
PORT=8000
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port $PORT is already in use."
    print_status "Attempting to kill existing process..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Set environment variables
export FLASK_APP=$PYTHON_FILE
export FLASK_ENV=development
export FLASK_DEBUG=True

# Load environment variables from .env file
if [ -f ".env" ]; then
    print_status "Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
fi

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down server..."
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the server
print_success "Starting Python backend server on http://localhost:$PORT"
print_status "Press Ctrl+C to stop the server"
print_status "Logs will be saved to logs/app.log"
echo ""

# Start the server with logging
python $PYTHON_FILE 2>&1 | tee logs/app.log &

# Wait for the server to start
sleep 2

# Check if server started successfully
if curl -s http://localhost:$PORT/ > /dev/null 2>&1; then
    print_success "Server is running successfully on http://localhost:$PORT"
    print_status "API documentation available at http://localhost:$PORT"
    print_status "Admin login: http://localhost:$PORT/api/admin/login"
else
    print_warning "Server may not be responding. Check logs for details."
fi

# Keep the script running and show logs
tail -f logs/app.log
