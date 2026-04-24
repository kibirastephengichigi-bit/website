#!/bin/bash

# Service Stop Script
# Safely stops all running services

echo "🛑 Stopping Website Services..."

# Load PIDs if file exists
if [ -f service-pids.txt ]; then
    source service-pids.txt
    
    echo "Stopping services from saved PIDs..."
    
    # Stop Frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
        else
            echo "⚠️  Frontend process $FRONTEND_PID not running"
        fi
    fi
    
    # Stop Admin Backend
    if [ ! -z "$ADMIN_PID" ]; then
        if kill -0 $ADMIN_PID 2>/dev/null; then
            kill $ADMIN_PID
            echo "✅ Admin Backend stopped (PID: $ADMIN_PID)"
        else
            echo "⚠️  Admin Backend process $ADMIN_PID not running"
        fi
    fi
    
    # Stop Scholars Backend
    if [ ! -z "$SCHOLARS_PID" ]; then
        if kill -0 $SCHOLARS_PID 2>/dev/null; then
            kill $SCHOLARS_PID
            echo "✅ Scholars Backend stopped (PID: $SCHOLARS_PID)"
        else
            echo "⚠️  Scholars Backend process $SCHOLARS_PID not running"
        fi
    fi
    
    # Remove PID file
    rm service-pids.txt
else
    echo "No PID file found. Stopping services by process name..."
    
    # Force stop by process name
    pkill -f "next dev" && echo "✅ Frontend stopped"
    pkill -f "python -m backend" && echo "✅ Admin Backend stopped"
    pkill -f "python app.py" && echo "✅ Scholars Backend stopped"
fi

# Clean up any remaining processes on our ports
echo ""
echo "Checking for remaining processes on ports..."
for port in 3000 8000 8081; do
    if ss -tuln | grep -q ":$port "; then
        echo "⚠️  Port $port still in use. Force killing..."
        fuser -k $port/tcp 2>/dev/null
    fi
done

echo ""
echo "🎉 All services stopped successfully!"
