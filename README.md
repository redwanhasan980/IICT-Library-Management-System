# IICT Library Management System

Full-stack IICT Library Management System monorepo with a React client and an Express + Prisma server targeting MariaDB/MySQL.

The repository root is only a lightweight command runner and documentation hub. There is no root app, and the deployable projects are independent:

- [`iict-library-client/`](iict-library-client/) contains the complete Vite frontend.
- [`iict-library-server/`](iict-library-server/) contains the complete Express/Prisma backend.

## Quick Start

```bash
npm --prefix iict-library-server install
npm --prefix iict-library-client install

npm run dev:server
npm run dev:client
```

Useful commands:

```bash
npm run build
npm test
npm run prisma:migrate:deploy
npm run seed:demo
```

## Documentation

The detailed project documents now live under [`docs/`](docs/README.md):

- Full project guide: [`docs/PROJECT_README.md`](docs/PROJECT_README.md)
- Architecture/API/schema docs: [`docs/core/`](docs/core/)
- Development history: [`docs/core/DEVELOPMENT_PROCESS.md`](docs/core/DEVELOPMENT_PROCESS.md)
- Phase notes: [`docs/development-process/`](docs/development-process/)
- Deployment docs: [`docs/deployment/`](docs/deployment/)
- Implementation and QA reports: [`docs/reports/`](docs/reports/)
- Source requirements: [`Requirements Documents/`](Requirements%20Documents/)

## Apps

- Frontend: [`iict-library-client/`](iict-library-client/)
- Backend: [`iict-library-server/`](iict-library-server/)

For Render, create two services from the same Git repo:

- Backend Web Service: root directory `iict-library-server`, build command `npm install && npm run prisma:generate && npm run build`, start command `npm start`.
- Frontend Static Site: root directory `iict-library-client`, build command `npm install && npm run build`, publish directory `dist`, env `ONLINE=true` and `VITE_ONLINE_API_BASE_URL=https://iict-library-management-system-server.onrender.com/api`.

You can also use the root [`render.yaml`](render.yaml) blueprint and fill the secret environment variables in Render.

Package-level notes remain beside each app:

- [`iict-library-client/README.md`](iict-library-client/README.md)
- [`iict-library-server/README.md`](iict-library-server/README.md)
