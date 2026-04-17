# Dr. Stephen Asatsa Website V2

Modern professional website scaffold for Dr. Stephen Asatsa, built with:

- Next.js 15 App Router + TypeScript
- Tailwind CSS + shadcn-style UI primitives + Framer Motion
- Prisma + PostgreSQL
- NextAuth.js with credentials and optional Google sign-in
- React Hook Form + Zod
- Cloudinary-ready media route structure

## Project scope

This V2 project is designed as a clean rebuild of the current site, using the cloned content in `/home/John/website/stephenasatsa.com` as the source of truth for:

- biography and credentials
- services and booking
- research and publications
- grants, conferences, and invited talks
- contact details
- gallery quote and media references

## Pages included

- `/`
- `/about`
- `/services`
- `/research`
- `/blog`
- `/blog/[slug]`
- `/contact`
- `/admin`
- `/admin/blog`
- `/admin/testimonials`
- `/admin/research`
- `/admin/publications`
- `/admin/media`
- `/admin/content`

## Admin features scaffolded

- Credentials auth via NextAuth
- Optional Google provider when env vars are supplied
- Dashboard overview
- Blog CRUD route handler
- Testimonials CRUD route handler
- Research CRUD route handler
- Publications CRUD route handler
- Media library route handler
- Shared site content route handler

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy env values

```bash
cp .env.example .env
```

3. Generate Prisma client

```bash
npm run prisma:generate
```

4. Run migrations

```bash
npm run prisma:migrate
```

5. Seed starter data

```bash
npm run prisma:seed
```

6. Start the app

```bash
npm run dev
```

## Notes

- The contact and newsletter APIs currently validate and accept submissions, then return success responses. Connect them to your preferred email platform for production notifications.
- The media API is Cloudinary-ready. Plug upload logic into `app/api/admin/media/route.ts`.
- The admin UI is scaffolded for a richer editor flow. Replace the placeholder editor with TipTap wiring as the next enhancement step if full rich text editing is required immediately.
- The original cloned site remains untouched in `/home/John/website/stephenasatsa.com`.

## Docker Setup

### Quick Start with Docker Compose

1. **Clone and setup environment:**

```bash
git clone <your-repo-url>
cd website
cp .env.example .env
# Edit .env with your actual values
```

2. **Build and run with Docker Compose:**

```bash
# Run the full stack (Next.js app + PostgreSQL)
docker-compose up --build

# Or run with admin backend included
docker-compose --profile admin up --build
```

3. **Access the application:**
   - Main app: http://localhost:3000
   - Admin backend (if enabled): http://localhost:8000
   - Database: localhost:5432

### Docker Commands

```bash
# Build the Next.js application only
docker build -t stephenasatsa-app .

# Run the application
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="your-secret" \
  stephenasatsa-app

# Run database migrations in container
docker run --rm -it \
  --network container:stephenasatsa-db \
  stephenasatsa-app \
  npx prisma migrate deploy

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Clean up volumes (WARNING: deletes data)
docker-compose down -v
```

### Environment Variables for Docker

Make sure your `.env` file contains:

```env
# Database (for Docker Compose)
DATABASE_URL="postgresql://postgres:password@db:5432/stephenasatsa"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret"

# Google OAuth (required for Google login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin Backend (optional)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="secure-password"
```

### Production Deployment

For production deployment:

1. **Update environment variables** with production URLs and secrets
2. **Use Docker secrets** or external secret management
3. **Configure reverse proxy** (nginx/caddy) for SSL termination
4. **Set up persistent volumes** for uploads and database
5. **Enable health checks** and monitoring

Example production docker-compose override:

```yaml
version: '3.8'
services:
  app:
    environment:
      - NEXTAUTH_URL=https://yourdomain.com
      - DATABASE_URL=postgresql://user:pass@prod-db:5432/db
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Troubleshooting

- **Database connection issues**: Ensure PostgreSQL is healthy with `docker-compose ps`
- **Build failures**: Clear Docker cache with `docker system prune`
- **Permission issues**: Check file permissions on mounted volumes
- **Port conflicts**: Change host ports in docker-compose.yml if needed
