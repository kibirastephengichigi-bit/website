#!/bin/bash

# Scholar Forge Installation Script
# This script installs and sets up the scholar-forge application

set -e  # Exit on any error

echo "🔨 Installing Scholar Forge..."

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

# Define paths
WEBSITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHOLAR_FORGE_DIR="$WEBSITE_DIR/../Schoolars-work-bench/artifacts/scholar-forge"

print_header "Step 1: Verifying Scholar Forge Location"

if [ ! -d "$SCHOLAR_FORGE_DIR" ]; then
    print_error "Scholar Forge directory not found at: $SCHOLAR_FORGE_DIR"
    exit 1
fi

print_success "Scholar Forge directory found"

print_header "Step 2: Checking System Requirements"

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

print_header "Step 3: Installing Scholar Forge Dependencies"

cd "$SCHOLAR_FORGE_DIR"

print_status "Installing npm dependencies..."
print_command "npm install"

npm install

if [ $? -eq 0 ]; then
    print_success "Scholar Forge dependencies installed"
else
    print_error "Failed to install Scholar Forge dependencies"
    exit 1
fi

print_header "Step 4: Setting Up Environment"

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOF
# Scholar Forge Environment Configuration
PORT=4500
BASE_PATH=/
EOF
    print_success "Environment file created"
else
    print_status "Environment file already exists"
fi

print_header "Step 5: Creating Directories"

mkdir -p logs
mkdir -p dist/public

print_success "Directories created"

print_header "Step 6: Building Scholar Forge"

print_status "Building Scholar Forge for production..."
print_command "npm run build"

npm run build

if [ $? -eq 0 ]; then
    print_success "Scholar Forge built successfully"
else
    print_warning "Build failed, but development mode will still work"
fi

cd "$WEBSITE_DIR"

print_header "Installation Complete!"
echo ""
echo "🎉 Scholar Forge has been installed successfully!"
echo ""
echo "📋 Next Steps:"
echo "  1. Run './scholar-forge-start.sh dev' to start in development mode"
echo "  2. Run './scholar-forge-start.sh prod' to start in production mode"
echo "  3. Access Scholar Forge at http://localhost:4500"
echo ""
echo "🔧 Useful Commands:"
echo "  ./scholar-forge-start.sh dev     - Start development server"
echo "  ./scholar-forge-start.sh prod    - Start production server"
echo "  ./scholar-forge-start.sh stop    - Stop Scholar Forge"
echo "  ./scholar-forge-start.sh status  - Check status"
echo ""
