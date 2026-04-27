# Scripts Directory

This directory contains all management and utility scripts for the website project.

## Directory Structure

```
scripts/
├── backend/           # Backend server management scripts
│   ├── start-debug-server.sh    # Start admin backend with debugging
│   ├── stop-debug-server.sh     # Stop admin backend
│   └── status-debug-server.sh    # Check backend status
├── frontend/          # Frontend development server scripts
│   ├── start-dev-server.sh      # Start Next.js development server
│   └── stop-dev-server.sh       # Stop Next.js development server
├── deployment/         # Deployment and production scripts
│   └── (existing deployment scripts)
└── utilities/         # General utility scripts
    ├── port-check.sh           # Check for port conflicts
    ├── start-all-services.sh   # Start all services in order
    ├── stop-all-services.sh    # Stop all services
    └── service-status.sh       # Check status of all services
```

## Usage

### Quick Start
```bash
# Start all services
./scripts/utilities/start-all-services.sh

# Stop all services
./scripts/utilities/stop-all-services.sh

# Check service status
./scripts/utilities/service-status.sh

# Check for port conflicts
./scripts/utilities/port-check.sh
```

### Individual Services

#### Backend (Admin API)
```bash
# Start with debugging
./scripts/backend/start-debug-server.sh

# Stop backend
./scripts/backend/stop-debug-server.sh

# Check backend status
./scripts/backend/status-debug-server.sh
```

#### Frontend (Next.js)
```bash
# Start development server
./scripts/frontend/start-dev-server.sh

# Stop development server
./scripts/frontend/stop-dev-server.sh
```

## Features

### Backend Scripts
- **Enhanced debugging**: Comprehensive logging and monitoring
- **Process management**: PID tracking and graceful shutdown
- **Health checks**: Automated service verification
- **Statistics**: Real-time server metrics

### Frontend Scripts
- **Hot reload**: Automatic browser refresh on code changes
- **Dependency management**: Auto-install missing dependencies
- **Port conflict detection**: Prevents startup issues
- **Log management**: Centralized logging

### Utility Scripts
- **Port conflict prevention**: Checks before starting services
- **Service orchestration**: Start/stop all services in correct order
- **Status monitoring**: Comprehensive service health checks
- **Error handling**: Graceful error recovery and reporting

## Configuration

All scripts automatically detect the project structure and use the following defaults:

- **Frontend Port**: 3000
- **Backend Port**: 8000
- **Scholars API Port**: 8081
- **Log Directory**: `./backend/data/`
- **PID Files**: `./.frontend-dev.pid`, `./.debug-server.pid`

## Troubleshooting

### Port Conflicts
If you encounter port conflicts:
1. Run `./scripts/utilities/port-check.sh` to identify conflicts
2. Run `./scripts/utilities/stop-all-services.sh` to clear all services
3. Restart services individually if needed

### Services Not Responding
1. Check service status: `./scripts/utilities/service-status.sh`
2. View logs: `tail -f backend/data/debug.log` or `tail -f .next/frontend-dev.log`
3. Restart affected service using individual scripts

### Stale Processes
If services don't stop properly:
1. Use `./scripts/utilities/stop-all-services.sh` for force cleanup
2. Manually kill processes: `pkill -f "next dev"` or `pkill -f "simple_debug_server.py"`

## Development

All scripts include:
- **Colored output** for better readability
- **Error handling** with informative messages
- **Process tracking** with PID files
- **Health monitoring** with automated checks
- **Graceful shutdown** with fallback force kill

## Security

- Scripts use process IDs to track services
- PID files are automatically cleaned up
- Port usage is verified before starting services
- Graceful shutdown with fallback force termination
