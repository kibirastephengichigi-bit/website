#!/bin/bash

# Service Startup Script with Port Conflict Prevention
# Starts all services in the correct order with conflict checking

echo "🚀 Starting Website Services..."

# First check for port conflicts
echo "Step 1: Checking for port conflicts..."
./port-check.sh
if [ $? -ne 0 ]; then
    echo "❌ Cannot start services due to port conflicts"
    exit 1
fi

# Function to start a service
start_service() {
    local name=$1
    local command=$2
    local directory=$3
    
    echo "Starting $name..."
    cd "$directory"
    
    if [ "$name" = "Frontend" ]; then
        # Start frontend in background
        nohup $command > frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "✅ Frontend started (PID: $FRONTEND_PID) on port 3000"
    elif [ "$name" = "Admin Backend" ]; then
        # Start admin backend in background
        nohup $command > admin-backend.log 2>&1 &
        ADMIN_PID=$!
        echo "✅ Admin Backend started (PID: $ADMIN_PID) on port 8000"
    elif [ "$name" = "Scholars Backend" ]; then
        # Start scholars backend in background
        nohup $command > scholars-backend.log 2>&1 &
        SCHOLARS_PID=$!
        echo "✅ Scholars Backend started (PID: $SCHOLARS_PID) on port 8081"
    fi
}

# Get the base directory
BASE_DIR="/home/codecrafter/Documents/combined"

# Start services in order
echo ""
echo "Step 2: Starting services..."

# 1. Start Admin Backend first
start_service "Admin Backend" "python -m backend" "$BASE_DIR/website"

# Wait a moment for admin backend to start
sleep 2

# 2. Start Scholars Backend
start_service "Scholars Backend" "python app.py" "$BASE_DIR/Schoolars-work-bench"

# Wait a moment for scholars backend to start
sleep 2

# 3. Start Frontend last
start_service "Frontend" "npm run dev" "$BASE_DIR/website"

# Save PIDs to file for easy stopping
echo ""
echo "Step 3: Saving process IDs..."
cat > service-pids.txt << EOF
FRONTEND_PID=$FRONTEND_PID
ADMIN_PID=$ADMIN_PID
SCHOLARS_PID=$SCHOLARS_PID
EOF

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "Service URLs:"
echo "  - Frontend:      http://localhost:3000"
echo "  - Admin Panel:   http://localhost:3000/admin"
echo "  - Admin API:     http://localhost:8000/api"
echo "  - Scholars API:  http://localhost:8081"
echo ""
echo "To stop all services: ./stop-services.sh"
echo "To check logs: tail -f frontend.log admin-backend.log scholars-backend.log"
