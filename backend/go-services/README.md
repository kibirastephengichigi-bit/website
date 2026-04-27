# Go Microservices

This directory contains Go microservices that handle CPU-intensive and concurrent operations for the website backend.

## Services

### 1. Password Service (Port 9001)
Offloads CPU-intensive PBKDF2-SHA256 password hashing operations from Python.

**Endpoints:**
- `POST /hash` - Hash a password
- `POST /verify` - Verify a password against a stored hash
- `GET /health` - Health check

**Usage:**
```python
from go_services_client import password_service

# Hash a password
result = password_service.hash_password("mypassword")
hash = result["hash"]

# Verify a password
valid = password_service.verify_password("mypassword", stored_hash)
```

### 2. Telemetry Service (Port 9002)
High-performance monitoring and metrics collection service.

**Endpoints:**
- `POST /record` - Record a telemetry event
- `GET /stats` - Get server statistics
- `GET /system` - Get system information
- `GET /health` - Health check
- `POST /reset` - Reset statistics

**Usage:**
```python
from go_services_client import telemetry_service

# Record an event
telemetry_service.record_event("auth_attempt", "/api/login", success=True)

# Get stats
stats = telemetry_service.get_stats()

# Get system info
info = telemetry_service.get_system_info()
```

### 3. Image Service (Port 9003)
Image processing service for optimization, resizing, and compression.

**Endpoints:**
- `POST /process` - Process an image (resize, compress, thumbnail)
- `POST /info` - Get image information
- `GET /health` - Health check

**Usage:**
```python
from go_services_client import image_service

# Process an image
result = image_service.process_image(
    image_data=base64_image,
    format="jpeg",
    width=800,
    height=600,
    quality=85
)
```

### 4. Worker Service (Port 9004)
Background task processing with goroutines for concurrent execution.

**Endpoints:**
- `POST /submit` - Submit a background task
- `GET /status?id=<task_id>` - Get task status
- `GET /list` - List all tasks
- `GET /health` - Health check

**Task Types:**
- `email` - Send email
- `report` - Generate reports
- `cleanup` - Cleanup operations
- `backup` - Backup operations

**Usage:**
```python
from go_services_client import worker_service

# Submit a task
task_id = worker_service.submit_task("email", {"to": "user@example.com"})

# Check status
status = worker_service.get_task_status(task_id)
```

## Setup

### Prerequisites
- Go 1.21 or higher
- PM2 (for process management)

### Building Services

Run the build script:
```bash
cd /home/codecrafter/Documents/combined/website/backend/go-services
./build-all.sh
```

Or build individually:
```bash
cd password-service
go build -o password-service main.go
```

### Environment Variables

Enable Go services in Python backend by setting these environment variables:

```bash
# Enable password service
export USE_GO_PASSWORD_SERVICE=true
export GO_PASSWORD_SERVICE_URL=http://localhost:9001

# Enable telemetry service
export USE_GO_TELEMETRY_SERVICE=true
export GO_TELEMETRY_SERVICE_URL=http://localhost:9002
```

### PM2 Management

The services are configured in `ecosystem.config.js`. Start them with:

```bash
# Start all services including Go services
pm2 start ecosystem.config.js

# Start only Go services
pm2 start go-password-service
pm2 start go-telemetry-service
pm2 start go-image-service
pm2 start go-worker-service

# View logs
pm2 logs go-password-service
pm2 logs go-telemetry-service

# Restart services
pm2 restart go-password-service
```

## Architecture

The Go services follow a microservices architecture:

```
Python Backend (server.py)
    ↓ HTTP requests
Go Services (ports 9001-9004)
    ↓
Go goroutines (concurrent processing)
```

**Benefits:**
- **Performance**: Go's goroutines provide true parallelism, unlike Python's GIL
- **CPU-intensive operations**: Offload PBKDF2 hashing, image processing to Go
- **Concurrency**: Native goroutines for background tasks
- **Resource efficiency**: Lower memory footprint than Python workers
- **Type safety**: Go's strong typing reduces runtime errors

## Fallback Behavior

If Go services are unavailable or disabled, the Python backend automatically falls back to native Python implementations:

- Password hashing → Python `hashlib.pbkdf2_hmac`
- Telemetry → Silently fails (non-blocking)
- Image processing → Would need Python fallback (not implemented)
- Background tasks → Would need Python fallback (not implemented)

## Monitoring

Check service health:
```bash
curl http://localhost:9001/health
curl http://localhost:9002/health
curl http://localhost:9003/health
curl http://localhost:9004/health
```

## Troubleshooting

**Service won't start:**
- Check if port is already in use: `ss -tuln | grep :9001`
- Check logs: `pm2 logs go-password-service`
- Ensure binary is built: `./build-all.sh`

**Python can't connect:**
- Verify service is running: `curl http://localhost:9001/health`
- Check firewall settings
- Verify environment variables are set

**Performance issues:**
- Increase worker count: `export MAX_WORKERS=20`
- Adjust memory limits in `ecosystem.config.js`
- Monitor with PM2: `pm2 monit`
