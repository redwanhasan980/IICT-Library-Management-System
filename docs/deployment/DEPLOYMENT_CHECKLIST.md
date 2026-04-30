# Deployment Checklist

## Build Targets

Run these commands from the repository root:

```bash
npm run build
npm test
```

The root scripts delegate to the actual applications:

- `iict-library-server`
- `iict-library-client`

## Required Server Environment

Set these in the backend runtime:

- `NODE_ENV=production`
- `PORT`
- `CORS_ORIGIN` includes the deployed frontend origin, for example `https://iict-library.onrender.com`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_SETUP_TOKEN`
- `ENABLE_DEV_AUTH=false`

Do not enable development header auth in production.

## Required Client Environment

Set these before building the client:

- `VITE_ONLINE=true`
- `VITE_ONLINE_API_BASE_URL`
- `VITE_LOCAL_API_BASE_URL`
- `VITE_ENABLE_DEV_AUTH=false`

## Database Migration

Before starting the production server against a new deployment or updated schema:

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
```

The datasource is MariaDB-compatible through Prisma's `mysql` provider.

## First Admin

After deployment, create the first admin once:

```http
POST /api/auth/bootstrap-admin
```

Use the configured `ADMIN_SETUP_TOKEN`. After the first admin exists, additional accounts can be managed from `/dashboard/admin/users`.

## Runtime Start

Backend:

```bash
npm run start:server
```

Frontend:

- Serve `iict-library-client/dist` from a static host.
- For a local production preview, run `npm run preview:client`.

## Smoke Test

1. Open `/api/health` and confirm the success response.
2. Log in as Admin.
3. Open `/dashboard/admin/catalog`, `/dashboard/admin/circulation`, `/dashboard/admin/procurement`, and `/dashboard/admin/reports`.
4. Register or create one Student and one Teacher.
5. Create or verify a book accession.
6. Issue and return the accession.
7. Generate an issued-book report.
8. Confirm unauthorized users cannot open admin routes.

## Current Non-Blocking Hardening

- Add CI to run root `npm run build` and `npm test`.
- Add browser end-to-end tests for the smoke-test path.
- Add persistent audit-log storage if required by policy.
