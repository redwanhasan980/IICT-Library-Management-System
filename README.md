# IICT Library Management System

IICT Library Management System is a full-stack monorepo with a React client and an Express + Prisma server targeting MariaDB.

## Project Structure

- iict-library-client: Frontend (React, TypeScript, Vite, RTK Query, Tailwind CSS)
- iict-library-server: Backend (Node.js, Express, Prisma, MariaDB)
- Requirements Documents: Requirement and use-case artifacts
- Development Process: Phase-by-phase delivery notes

## Development Phases

- [Development Process/Phase-1-Project-Setup.md](Development%20Process/Phase-1-Project-Setup.md)
- [Development Process/Phase-2-Outside-Book-Module.md](Development%20Process/Phase-2-Outside-Book-Module.md)
- [Development Process/Phase-3-Core-Expansion-and-Admin-Operations.md](Development%20Process/Phase-3-Core-Expansion-and-Admin-Operations.md)

## Tech Stack

### Backend

- Node.js + TypeScript
- Express
- Prisma ORM
- MariaDB (Prisma datasource provider is mysql)
- Zod validation

### Frontend

- React + TypeScript
- Vite
- Redux Toolkit + RTK Query
- React Router
- Tailwind CSS

## Setup

### Prerequisites

- Node.js 18+
- npm 9+
- MariaDB 10.6+

### 1. Clone and install

```bash
git clone <repository-url>
cd IICT-Library-Management-System

cd iict-library-server
npm install

cd ../iict-library-client
npm install
```

### 2. Environment variables

Copy env examples and adjust values:

- Server: iict-library-server/.env.example -> iict-library-server/.env
- Client: iict-library-client/.env.example -> iict-library-client/.env

Required server variables:

- NODE_ENV: development or production
- PORT: API port (default 5000)
- CORS_ORIGIN: frontend origin, example http://localhost:5173
- DATABASE_URL: MariaDB Prisma URL, example mysql://root:password@localhost:3306/iict_library

Required client variables:

- VITE_API_BASE_URL: backend API base URL, example http://localhost:5000/api

## Database Migration and Seed

### Migration steps

```bash
cd iict-library-server
npm run prisma:generate
npm run prisma:migrate
```

### Seed steps

There is currently no seed script in package.json. If seed data is required, add a Prisma seed script in a later phase.

## Run (Development)

Start server:

```bash
cd iict-library-server
npm run dev
```

Start client (separate terminal):

```bash
cd iict-library-client
npm run dev
```

Default URLs:

- API: http://localhost:5000
- Health: http://localhost:5000/api/health
- Client: http://localhost:5173 (Vite may auto-increment if occupied)

## Temporary Auth Mode (Current)

The backend currently uses a development auth bridge in middleware. Protected API routes expect request headers:

- x-user-id
- x-user-role: ADMIN, STUDENT, or TEACHER

The frontend login page currently sets a local development session and injects these headers automatically through RTK Query.

Unauthorized access is now routed to a dedicated `/unauthorized` page for clearer UX.

## Build and Test Steps

### Build checks

```bash
cd iict-library-server
npm run build

cd ../iict-library-client
npm run build
```

### Manual test checklist

1. Open client and log in with a selected role.
2. Verify unauthorized routing:
   - sign in as `STUDENT`
   - open `/dashboard/outside-book-log`
   - confirm redirect to `/unauthorized`
3. For Student role:
   - open Add Outside Book
   - submit title + author
   - confirm success toast and table update in My Outside Books
4. For Admin role:
   - open Outside Book Log
   - verify entry and then verify exit
5. For Admin role:
   - open Spine Label Generator
   - generate label preview and print
6. Trigger retry UI:
   - temporarily stop backend
   - open My Outside Books or Outside Book Log
   - confirm error state with Retry button appears
7. Verify API health endpoint returns success envelope.
8. For Student or Teacher role:
   - open `/dashboard/books`
   - open a book with `availableCopies = 0`
   - place a reservation and verify it appears in My Reservations
9. For Admin role:
   - open `/dashboard/admin/reservations`
   - mark pending reservation as fulfilled/cancelled/expired
10. For Admin role:

- open `/dashboard/admin/settings`
- update policy values and save

11. For Admin role:

- open `/dashboard/admin/circulation`
- scan/type accession, then issue and return a loan

12. For Admin role:

- open `/dashboard/admin/bulk-tools`
- import books from CSV text and export datasets

13. For Admin role:

- open `/dashboard/admin/analytics`
- verify summary cards and trend/table sections load
14. For Admin role:

- open `/dashboard/admin/inventory-audit`
- create a new audit session
- add single and bulk accession scans
- verify summary cards and result-table status filters
- close the session and confirm historical session remains listable

## Newly Added Modules (Current)

- Book reservation and waitlist workflow
- Library policy and system settings management
- Scanner-friendly circulation flow (barcode/QR accession handling)
- Bulk import/export tools (CSV-first)
- Advanced analytics dashboard (descriptive summaries)
- Inventory audit and stock verification workflow

## Database Notes for This Phase

Prisma schema now includes `Book`, `Loan`, `Reservation`, `SystemSetting`, `InventoryAuditSession`, and `InventoryAuditScan` models.

After pulling latest code, run:

```bash
cd iict-library-server
npm run prisma:generate
npm run prisma:migrate
```

These are required before starting the backend for the new modules.

## Deployment Notes

- Build both apps before deployment.
- Set NODE_ENV=production on server.
- Set CORS_ORIGIN to the deployed frontend origin.
- Ensure MariaDB is reachable from backend runtime environment.
- Run prisma generate and prisma migrate deploy in deployment pipeline.
- Frontend is a static Vite build from iict-library-client/dist.

## Demo Credentials

There are no hardcoded backend credentials currently.

For demo in current development mode:

- Use any email + password on the login page
- Select the role needed for the flow (Student/Admin/Teacher)
