#!/bin/bash

# Service Stop Script
# Safely stops all running services
# Supports both nohup and PM2 deployment modes

echo "🛑 Stopping Website Services..."

# Check if PM2 is running and stop it first
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "online"; then
        echo "📊 PM2 processes detected. Stopping PM2 services..."
        cd /home/codecrafter/Documents/combined
        ./stop-pm2.sh
        echo "✅ PM2 services stopped"
        exit 0
    fi
fi

echo "📝 Using nohup mode for service management..."

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

    # Stop Scholar Forge
    if [ ! -z "$SCHOLAR_FORGE_PID" ]; then
        if kill -0 $SCHOLAR_FORGE_PID 2>/dev/null; then
            kill $SCHOLAR_FORGE_PID
            echo "✅ Scholar Forge stopped (PID: $SCHOLAR_FORGE_PID)"
        else
            echo "⚠️  Scholar Forge process $SCHOLAR_FORGE_PID not running"
        fi
    fi

    # Also try to stop via the dedicated script
    if [ -f "./scholar-forge-start.sh" ]; then
        ./scholar-forge-start.sh stop > /dev/null 2>&1
    fi

    # Remove PID file
    rm service-pids.txt
else
    echo "No PID file found. Stopping services by process name..."
    
    # Force stop by process name
    pkill -f "next dev" && echo "✅ Frontend stopped"
    pkill -f "python -m backend" && echo "✅ Admin Backend stopped"
    pkill -f "python app.py" && echo "✅ Scholars Backend stopped"
    pkill -f "vite" && echo "✅ Scholar Forge stopped"
fi

# Clean up any remaining processes on our ports
echo ""
echo "Checking for remaining processes on ports..."
for port in 3000 8000 8081 4500; do
    if ss -tuln | grep -q ":$port "; then
        echo "⚠️  Port $port still in use. Force killing..."
        fuser -k $port/tcp 2>/dev/null
    fi
done

echo ""
echo "🎉 All services stopped successfully!"
