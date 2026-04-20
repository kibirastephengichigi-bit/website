# Admin Backend

Run the Python admin service from the project root:

```bash
python -m backend
```

Default local values:

- `ADMIN_API_PORT=8000`
- `ADMIN_ALLOWED_ORIGIN=http://localhost:3000`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=change-me-now`

Recommended before production:

- Set a strong `ADMIN_PASSWORD`
- Set `ADMIN_TOTP_SECRET` to enforce one-time code login
- Restrict `ADMIN_ALLOWED_ORIGIN`
- Run the service behind HTTPS

The backend edits:

- `lib/content/site-content.json`
- `lib/content/blog-data.json`

Uploaded files are stored in:

- `public/uploads/admin`
