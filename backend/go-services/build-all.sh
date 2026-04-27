#!/bin/bash

# Build script for all Go microservices

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICES=("password-service" "telemetry-service" "image-service" "worker-service")

echo "Building Go microservices..."

for service in "${SERVICES[@]}"; do
    echo "Building $service..."
    cd "$SCRIPT_DIR/$service"
    
    # Download dependencies
    go mod download
    
    # Build the service
    go build -o "$service" main.go
    
    # Make executable
    chmod +x "$service"
    
    echo "✓ $service built successfully"
done

echo ""
echo "All services built successfully!"
echo "Binaries are located in their respective service directories."
