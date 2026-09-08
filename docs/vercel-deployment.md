# Deploying to Vercel

The repo is a monorepo, so it becomes **two Vercel projects** pointed at the same
Git repository with different Root Directories. Both are already configured by
`iict-library-client/vercel.json` and `iict-library-server/vercel.json`.

Why move off Render: the Render free tier spins a web service down after ~15
minutes idle, so the first API call after a quiet period paid a ~50 second cold
boot. Vercel functions cold start in well under a second.

## 1. Server project

Vercel dashboard → Add New → Project → import the repo.

| Setting | Value |
| --- | --- |
| Project Name | `iict-library-server` |
| Root Directory | `iict-library-server` |
| Framework Preset | Other |

Leave build/output settings alone — `vercel.json` supplies them.

Environment variables (Production + Preview):

```
NODE_ENV=production
ONLINE=true
ENABLE_DEV_AUTH=false
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
ADMIN_SETUP_TOKEN=<one-time bootstrap token>
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud-name>
CORS_ORIGIN=https://<client-project>.vercel.app,https://*.vercel.app
REMOTE_DATABASE_URL=mysql://avnadmin:<password>@<host>.aivencloud.com:28635/defaultdb?sslaccept=accept_invalid_certs&connection_limit=1&pool_timeout=20
```

Two details matter in that database URL:

- **`connection_limit=1`** — every warm serverless instance holds its own Prisma
  pool. Without this cap, a handful of concurrent instances exhausts the Aiven
  free plan's connection budget and requests start failing with
  `Too many connections`.
- **`pool_timeout=20`** — waits for a free connection instead of erroring fast.

Deploy, then confirm `https://<server-project>.vercel.app/api/health` returns
`status: ok`.

## 2. Client project

Add a second project from the same repo.

| Setting | Value |
| --- | --- |
| Project Name | `iict-library-client` |
| Root Directory | `iict-library-client` |
| Framework Preset | Vite |

Environment variables:

```
ONLINE=true
VITE_ONLINE_API_BASE_URL=https://<server-project>.vercel.app/api
VITE_LOCAL_API_BASE_URL=http://localhost:5000/api
VITE_ENABLE_DEV_AUTH=false
```

`ONLINE` is readable by the client because `vite.config.ts` sets
`envPrefix: ['VITE_', 'ONLINE']`. These are build-time values, so changing one
requires a redeploy, not just a save.

Once the client URL is known, set the server's `CORS_ORIGIN` to it and redeploy
the server.

## 3. Migrations

Vercel has no equivalent of Render's `preDeployCommand`, so schema changes are
applied from your machine against the same Aiven database:

```bash
npm --prefix iict-library-server run prisma:migrate:deploy
```

with `ONLINE=true` and `REMOTE_DATABASE_URL` set in
`iict-library-server/.env`. The build step on Vercel only runs `prisma generate`.

## Limits to know about

- **Request body cap of 4.5 MB.** Book cover uploads go through `multer` to
  `os.tmpdir()` (writable as `/tmp` on Vercel) and on to Cloudinary, so anything
  under that ceiling works. Larger files need a direct browser-to-Cloudinary
  upload instead.
- **Function timeout** is set to 30s in `vercel.json`. Bulk imports and reports
  that run longer than that will need to be chunked.
- **No persistent local state.** `/tmp` is per-instance and disposable, which is
  fine for the current upload flow but rules out storing anything else on disk.

## Files involved

- `iict-library-server/api/index.ts` — serverless entry; re-exports the Express app.
- `iict-library-server/src/app.ts` — the app itself (routes, CORS, middleware).
- `iict-library-server/src/index.ts` — local `listen()` only, used by `npm run dev`/`start`.
- `iict-library-server/vercel.json` — rewrites every path to the function.
- `iict-library-client/vercel.json` — SPA fallback to `index.html`.
