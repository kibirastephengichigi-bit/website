# Port Configuration and Conflict Prevention

This document outlines the standardized port configuration and conflict prevention measures for all services.

## Port Allocation

| Service | Port | Purpose | Environment Variable |
|---------|------|---------|---------------------|
| Frontend (Next.js) | 3000 | Main website and admin panel | `NEXT_PUBLIC_PORT` |
| Admin Backend (Python) | 8000 | Admin API endpoints | `ADMIN_API_PORT` |
| Scholars Backend (Flask) | 8081 | Scholars API endpoints | `SCHOLARS_API_PORT` |

## Environment Configuration

### Website (.env.local)
```env
# Port Configuration
NEXT_PUBLIC_PORT=3000
ADMIN_API_PORT=8000
SCHOLARS_API_PORT=8081

# Backend URLs
ADMIN_BACKEND_URL=http://localhost:8000/api
SCHOLARS_BACKEND_URL=http://localhost:8081

# CORS Origins
NEXTAUTH_URL=http://localhost:3000
ADMIN_ALLOWED_ORIGIN=http://localhost:3000
```

### Scholars Backend (.env)
```env
# Port Standardization
PORT=8081
FRONTEND_PORT=3000
SCHOLARS_API_PORT=8081
ADMIN_API_PORT=8000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Service Management Scripts

### Port Conflict Check
```bash
./port-check.sh
```
Checks for port conflicts before starting services.

### Start All Services
```bash
./start-services.sh
```
Starts all services in the correct order with conflict prevention.

### Stop All Services
```bash
./stop-services.sh
```
Safely stops all running services.

## Service URLs

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Admin API**: http://localhost:8000/api
- **Scholars API**: http://localhost:8081

## Default Credentials

### Admin Panel
- **Username**: `admin`
- **Password**: `change-me-now`

## Troubleshooting

### Port Conflicts
If you encounter port conflicts:

1. Run `./port-check.sh` to identify conflicts
2. Run `./stop-services.sh` to stop all services
3. Check for other processes using the ports
4. Restart services with `./start-services.sh`

### Manual Port Changes
If you need to change ports:

1. Update the respective `.env` files
2. Update CORS origins to match
3. Restart services

### Service Logs
Monitor service logs with:
```bash
tail -f frontend.log admin-backend.log scholars-backend.log
```

## Startup Order

1. **Admin Backend** (port 8000) - Required for admin functionality
2. **Scholars Backend** (port 8081) - Required for scholars features
3. **Frontend** (port 3000) - Depends on both backends

## Health Check Endpoints

- Admin API: `GET http://localhost:8000/api/health`
- Scholars API: Check individual API documentation

## Security Notes

- All services are configured to only accept connections from localhost
- CORS is properly configured for the frontend origin
- Admin backend uses session-based authentication
- Environment variables should be secured in production
