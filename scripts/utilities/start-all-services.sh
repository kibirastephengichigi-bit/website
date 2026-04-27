#!/bin/bash

# Service Startup Script with Port Conflict Prevention
# Starts all services in the correct order with conflict checking
# Supports both nohup and PM2 deployment modes

echo "🚀 Starting Website Services..."

# Check for PM2 mode
USE_PM2="${USE_PM2:-false}"
if [ "$USE_PM2" = "true" ]; then
    if command -v pm2 &> /dev/null; then
        echo "📊 PM2 mode enabled. Using PM2 for service management..."
        cd /home/codecrafter/Documents/combined
        ./start-pm2.sh
        exit 0
    else
        echo "⚠️  PM2 requested but not installed. Falling back to nohup mode..."
        echo "Install PM2 with: sudo npm install -g pm2"
    fi
fi

echo "📝 Using nohup mode for service management..."

# First check for port conflicts
echo "Step 1: Checking for port conflicts..."
./port-check.sh
if [ $? -ne 0 ]; then
    echo "❌ Cannot start services due to port conflicts"
    exit 1
fi

# Function to check if a service is healthy
check_service_health() {
    local name=$1
    local port=$2
    local health_url=$3
    local max_retries=10
    local retry_delay=2
    
    echo "Checking $name health..."
    
    for i in $(seq 1 $max_retries); do
        if curl -s -f "$health_url" > /dev/null 2>&1; then
            echo "✅ $name is healthy and responding"
            return 0
        fi
        
        if [ $i -lt $max_retries ]; then
            echo "⏳ Waiting for $name to start... ($i/$max_retries)"
            sleep $retry_delay
        fi
    done
    
    echo "❌ $name failed to start or is not responding"
    return 1
}

# Function to start a service
start_service() {
    local name=$1
    local command=$2
    local directory=$3
    local port=$4
    local health_url=$5
    
    echo "Starting $name..."
    cd "$directory"
    
    if [ "$name" = "Frontend" ]; then
        # Start frontend in background
        nohup $command > frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "🚀 Frontend started (PID: $FRONTEND_PID) on port 3000"
        
        # Check health
        if ! check_service_health "Frontend" "$port" "$health_url"; then
            echo "❌ Frontend health check failed"
            return 1
        fi
        
    elif [ "$name" = "Admin Backend" ]; then
        # Start admin backend in background
        nohup $command > admin-backend.log 2>&1 &
        ADMIN_PID=$!
        echo "🚀 Admin Backend started (PID: $ADMIN_PID) on port 8000"
        
        # Check health
        if ! check_service_health "Admin Backend" "$port" "$health_url"; then
            echo "❌ Admin Backend health check failed"
            return 1
        fi
        
    elif [ "$name" = "Scholars Backend" ]; then
        # Start scholars backend in background
        nohup $command > scholars-backend.log 2>&1 &
        SCHOLARS_PID=$!
        echo "🚀 Scholars Backend started (PID: $SCHOLARS_PID) on port 8081"

        # Check health
        if ! check_service_health "Scholars Backend" "$port" "$health_url"; then
            echo "❌ Scholars Backend health check failed"
            return 1
        fi

    elif [ "$name" = "Scholar Forge" ]; then
        # Start scholar forge frontend using the dedicated script
        cd "$BASE_DIR/website"
        ./scholar-forge-start.sh dev > /dev/null 2>&1
        SCHOLAR_FORGE_PID=$(cat .scholar-forge.pid 2>/dev/null || echo "")
        if [ -n "$SCHOLAR_FORGE_PID" ]; then
            echo "🚀 Scholar Forge started (PID: $SCHOLAR_FORGE_PID) on port 4500"
        else
            echo "⚠️  Scholar Forge may not have started properly"
        fi
    fi
    
    return 0
}

# Get the base directory
BASE_DIR="/home/codecrafter/Documents/combined"

# Start services in order
echo ""
echo "Step 2: Starting services..."

# 1. Start Admin Backend first
if ! start_service "Admin Backend" "python -m backend" "$BASE_DIR/website" "8000" "http://localhost:8000/api/health"; then
    echo "❌ Failed to start Admin Backend. Stopping..."
    exit 1
fi

# 2. Start Scholars Backend
if ! start_service "Scholars Backend" "python app.py" "$BASE_DIR/Schoolars-work-bench" "8081" "http://localhost:8081/api/health"; then
    echo "❌ Failed to start Scholars Backend. Stopping..."
    exit 1
fi

# 3. Start Scholar Forge Frontend
if ! start_service "Scholar Forge" "echo" "$BASE_DIR/website" "4500" "http://localhost:4500"; then
    echo "⚠️  Scholar Forge may not have started, but continuing..."
fi

# 4. Start Frontend last
if ! start_service "Frontend" "npm run dev" "$BASE_DIR/website" "3000" "http://localhost:3000"; then
    echo "❌ Failed to start Frontend. Stopping..."
    exit 1
fi

# Save PIDs to file for easy stopping
echo ""
echo "Step 3: Saving process IDs..."
cat > service-pids.txt << EOF
FRONTEND_PID=$FRONTEND_PID
ADMIN_PID=$ADMIN_PID
SCHOLARS_PID=$SCHOLARS_PID
SCHOLAR_FORGE_PID=$SCHOLAR_FORGE_PID
EOF

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "Service URLs:"
echo "  - Frontend:      http://localhost:3000"
echo "  - Admin Panel:   http://localhost:3000/admin"
echo "  - Admin API:     http://localhost:8000/api"
echo "  - Scholars API:  http://localhost:8081"
echo "  - Scholar Forge: http://localhost:3000/scholars (proxied) or http://localhost:4500 (direct)"
echo ""
echo "To stop all services: ./stop-all-services.sh"
echo "To check logs: tail -f frontend.log admin-backend.log scholars-backend.log"
echo "To check Scholar Forge logs: ./scholar-forge-start.sh logs"
echo ""
echo "💡 To use PM2 multithreading mode: USE_PM2=true ./start-all-services.sh"
