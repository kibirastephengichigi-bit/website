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
