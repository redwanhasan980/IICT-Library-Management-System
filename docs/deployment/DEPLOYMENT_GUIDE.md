# Deployment Guide

## Prerequisites

- Node.js compatible with the current package lock.
- MariaDB database.
- Valid `DATABASE_URL`.
- Production `JWT_SECRET`.
- `ADMIN_SETUP_TOKEN` for first admin creation.
- Client API base URL configured with `VITE_API_BASE_URL`.

## Environment Variables

Server:

- `DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE`
- `JWT_SECRET=strong-production-secret`
- `JWT_EXPIRES_IN=7d` optional
- `ADMIN_SETUP_TOKEN=one-time-bootstrap-token`
- `CORS_ORIGIN=https://your-client-domain`
- `PORT=5000` optional
- `ENABLE_DEV_AUTH=false` for production

Client:

- `VITE_API_BASE_URL=https://your-server-domain/api`
- `VITE_ENABLE_DEV_AUTH=false`

## Build And Migration Steps

For local final verification from repository root:

```bash
npm --prefix iict-library-server install
npm --prefix iict-library-client install
npm run prisma:generate
npm run prisma:migrate:deploy
npm run build
npm test
```

The repository root is not a deployable app. It only delegates commands into the two independent app folders.

## Render Deployment

Create two Render services from the same GitHub repository.

The repository includes a root-level `render.yaml` blueprint with these settings. Render's monorepo `rootDir` setting makes the commands and publish directory relative to the selected app folder.

Backend Web Service:

- Root directory: `iict-library-server`
- Build command: `npm install && npm run prisma:generate && npm run build`
- Start command: `npm start`
- Environment variables: server variables listed above, including `DATABASE_URL`/`REMOTE_DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, Cloudinary credentials, and `ENABLE_DEV_AUTH=false`.
- Run migrations before or during deployment with `npm run prisma:migrate:deploy`.

Frontend Static Site:

- Root directory: `iict-library-client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variables: `VITE_API_BASE_URL=https://your-server-domain/api` and `VITE_ENABLE_DEV_AUTH=false`.
- Configure SPA rewrite/fallback to `index.html`.

## Start Commands

Server:

```bash
npm --prefix iict-library-server start
```

Client:

- Serve `iict-library-client/dist` with a static web server or hosting platform.
- Ensure the static host rewrites SPA routes to `index.html`.

## First Admin Setup

1. Deploy server and client with `ADMIN_SETUP_TOKEN` configured.
2. Open `/bootstrap-admin`.
3. Submit setup token, name, email, and password.
4. Remove or rotate `ADMIN_SETUP_TOKEN` after bootstrap if your deployment process allows it.

## Smoke Test Checklist

1. Open `/api/health`.
2. Log in as Admin.
3. Create or edit a catalog book.
4. Register/create a Student with phone number.
5. Issue and return a book by accession.
6. Open `/dashboard/admin/reports` and generate a report.
7. Open `/dashboard/admin/audit-logs` and verify recent audit events.
8. Log in as Student/Teacher and verify own borrowing history.

## Rollback Notes

- Database changes are Prisma migrations. Back up MariaDB before deployment.
- Recent migrations add `StudentProfile.phoneNumber` and `AuditLog`.
- Rollback should restore the previous application build and database backup together.
