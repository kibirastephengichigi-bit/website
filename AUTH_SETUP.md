# Authentication Setup Guide

## Issue: ClientFetchError in Console

The NextAuth.js ClientFetchError occurs because the authentication system is not properly configured. Here's how to fix it:

## Quick Fix (Temporary)

The error has been temporarily suppressed by adding error handling to the components:
- `components/layout/site-header.tsx`
- `components/user/save-item-button.tsx`

## Permanent Fix: Environment Configuration

Create a `.env` file in the root directory with the following configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stephenasatsa_v2?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-long-random-secret-here"
NEXTAUTH_URL="http://localhost:3001"
NEXT_PUBLIC_SITE_URL="http://localhost:3001"

# Admin Credentials
ADMIN_EMAIL="admin@stephenasatsa.com"
ADMIN_PASSWORD="ChangeMe123!"

# Google OAuth (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Cloudinary (Optional - for media uploads)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

## Steps to Complete Setup

1. **Generate NextAuth Secret**:
   ```bash
   openssl rand -base64 32
   ```

2. **Create .env file**:
   - Copy the template above
   - Replace `your-long-random-secret-here` with the generated secret
   - Update the URL to match your development port (3001)

3. **Restart the Development Server**:
   ```bash
   npm run dev
   ```

## Database Setup

If you haven't set up the database:

1. **Install PostgreSQL** (if not already installed)
2. **Create Database**:
   ```sql
   CREATE DATABASE stephenasatsa_v2;
   ```

3. **Run Migrations**:
   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

## Google OAuth Setup (Optional)

If you want to enable Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google`
6. Copy Client ID and Client Secret to .env file

## Testing the Fix

After setting up the environment:

1. The ClientFetchError should disappear from console
2. Authentication buttons should work properly
3. Session management should function correctly

## Troubleshooting

If errors persist:

1. Check that all environment variables are set
2. Ensure the database URL is correct and database exists
3. Verify the NEXTAUTH_URL matches your development server URL
4. Check that the NEXTAUTH_SECRET is at least 32 characters long

## Security Notes

- Never commit the .env file to version control
- Use different secrets for production and development
- Keep your Google OAuth credentials secure
- Change the default admin password in production
