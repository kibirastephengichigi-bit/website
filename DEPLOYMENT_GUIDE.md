# Development Deployment Guide
# Stephen Asatsa Website

This guide provides step-by-step instructions for deploying and running the Stephen Asatsa website on a development server.

## 🏗️ Project Architecture

The project consists of:
- **Frontend**: Next.js 15 application with React 19
- **Backend**: Python HTTP server with SQLite database
- **Admin Panel**: Custom admin interface with content management

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **Python**: 3.8 or higher
- **Operating System**: Linux, macOS, or Windows (with WSL2)
- **Memory**: Minimum 4GB RAM
- **Storage**: Minimum 10GB free space

### Required Software
```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Python 3.8+
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Install Git
sudo apt install git
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Cyberverse-cent0/Schoolars-work-bench.git
cd website
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
cd backend

# Build and start backend
chmod +x build.sh
./build.sh

# Start the backend server
python3 server.py
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:3000/admin

## 🔧 Detailed Setup

### Frontend Configuration

#### Environment Variables
Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:
```env
# Database Configuration
DATABASE_URL="sqlite:./data/app.db"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Admin Credentials
ADMIN_EMAIL="admin@stephenasatsa.com"
ADMIN_PASSWORD="YourSecurePassword123!"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Cloudinary for media
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### Install Dependencies
```bash
npm install
```

#### Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### Backend Configuration

#### Environment Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

#### Backend Environment Variables
```env
# Server Configuration
SECRET_KEY="your-backend-secret-key"
FLASK_ENV=development
FLASK_DEBUG=True

# Database
DATABASE_PATH="./data/app.db"

# Upload Configuration
MAX_UPLOAD_SIZE=10485760  # 10MB
UPLOAD_FOLDER="./uploads"

# Logging
LOG_LEVEL=INFO
LOG_FILE="./logs/app.log"
```

#### Database Initialization
```bash
# Create data directory
mkdir -p data logs backups

# Initialize database
python3 -c "from database import db; db.initialize_database()"
```

## 🛠️ Development Scripts

### Frontend Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Database operations
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Backend Scripts
```bash
# Build backend
./build.sh

# Start backend server
python3 server.py

# Alternative start method
python3 -m http.server 8000

# Create backup
./backup.sh

# Deploy to production
./deploy.sh
```

## 🐳 Docker Deployment (Optional)

### Docker Compose Setup
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - backend_data:/app/data
    environment:
      - FLASK_ENV=development

volumes:
  backend_data:
```

### Docker Commands
```bash
# Build and start containers
docker-compose up --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Access containers
docker-compose exec frontend bash
docker-compose exec backend bash
```

## 🔍 Testing

### Frontend Tests
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Backend Tests
```bash
# Run Python tests
python -m pytest tests/

# Run specific test file
python test_app.py

# Test API endpoints
curl http://localhost:8000/api/health
```

## 📊 Monitoring

### Health Checks
```bash
# Frontend health
curl http://localhost:3000/api/health

# Backend health
curl http://localhost:8000/api/health

# Database connection
curl http://localhost:8000/api/database/status
```

### Log Monitoring
```bash
# Frontend logs
tail -f logs/next.log

# Backend logs
tail -f backend/logs/app.log

# Error logs
tail -f backend/logs/error.log
```

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's running on ports
lsof -i :3000
lsof -i :8000

# Kill processes
kill -9 <PID>
```

#### Database Issues
```bash
# Reset database
rm -f data/app.db
npm run prisma:migrate

# Check database status
python3 -c "from database import db; print('Database OK')"
```

#### Permission Issues
```bash
# Fix file permissions
chmod +x backend/build.sh
chmod +x backend/deploy.sh
chmod +x backend/backup.sh

# Fix directory permissions
sudo chown -R $USER:$USER data/ logs/ backups/
```

#### Dependency Issues
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Clear Python cache
pip cache purge
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 🔄 Development Workflow

### Daily Development
1. Start backend: `cd backend && python3 server.py`
2. Start frontend: `npm run dev`
3. Make changes to code
4. Test changes in browser
5. Commit changes: `git add . && git commit -m "message"`

### Before Deployment
1. Run tests: `npm test && python -m pytest tests/`
2. Check linting: `npm run lint`
3. Build frontend: `npm run build`
4. Test production build: `npm run start`
5. Create backup: `./backup.sh`

## 📱 Mobile Development

### Responsive Testing
- Test on different screen sizes
- Use browser dev tools for mobile simulation
- Test touch interactions

### Performance Optimization
- Enable lazy loading
- Optimize images
- Minimize bundle size
- Use service workers

## 🔒 Security Considerations

### Development Security
- Use strong passwords in development
- Don't commit sensitive data
- Use environment variables for secrets
- Enable HTTPS in production

### API Security
- Validate all inputs
- Use authentication middleware
- Rate limit API endpoints
- Sanitize database queries

## 🚀 Production Deployment

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Error logging enabled

### Deployment Steps
1. Build frontend: `npm run build`
2. Build backend: `./build.sh`
3. Deploy to server: `./deploy.sh`
4. Verify deployment: Check health endpoints
5. Monitor logs: `tail -f logs/app.log`

## 📞 Support

### Getting Help
- Check this guide first
- Review error logs
- Search issue tracker
- Contact development team

### Useful Commands
```bash
# Show system info
node --version
npm --version
python3 --version
pip --version

# Show project info
npm list
pip list
git status

# Clean up
npm cache clean --force
pip cache purge
```

---

**Happy Development! 🎉**

For additional help or questions, refer to the project documentation or contact the development team.
