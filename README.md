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
- JWT_SECRET: long random secret for signing auth tokens
- JWT_EXPIRES_IN: token lifetime, default 7d
- ADMIN_SETUP_TOKEN: one-time token for first admin bootstrap
- ENABLE_DEV_AUTH: false in production

Required client variables:

- VITE_API_BASE_URL: backend API base URL, example http://localhost:5000/api
- VITE_ENABLE_DEV_AUTH: false in production

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

## Authentication

The backend uses email/password authentication with bcrypt password hashing and JWT bearer tokens. The frontend login and registration pages call the backend auth APIs and store the returned token for RTK Query requests.

Core auth routes:

- `POST /api/auth/login`
- `POST /api/auth/register` for Student/Teacher self-registration
- `POST /api/auth/bootstrap-admin` for first admin setup using `ADMIN_SETUP_TOKEN`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Admin users can manage members from `/dashboard/admin/users`.

Optional local header auth is available only when `ENABLE_DEV_AUTH=true` and `NODE_ENV` is not `production`. Do not enable it in deployment.

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

15. For Admin role:

- open `/dashboard/admin/fines`
- search unpaid/partial fine rows by borrower or role
- select a loan transaction and record partial payment
- verify remaining balance decreases and payment history updates
- record final payment and verify transaction status becomes `PAID`

16. For Student/Teacher role:

- open `/dashboard/student/fines` or `/dashboard/teacher/fines`
- verify outstanding summary, transaction fine status, and payment history are visible

17. For Admin role:

- open `/dashboard/admin/circulation`
- scan/type an accession number
- issue by User ID, Student Reg No., or Teacher ID
- verify active loans table, overdue filter, borrower history, and book circulation history
- return an active loan and confirm returned status appears

18. For Student/Teacher role:

- open `/dashboard/student/borrowing` or `/dashboard/teacher/borrowing`
- verify current borrowed books and full borrowing history are visible

## Newly Added Modules (Current)

- Book reservation and waitlist workflow
- Library policy and system settings management
- Scanner-friendly circulation flow (barcode/QR accession handling)
- Bulk import/export tools (CSV-first)
- Advanced analytics dashboard (descriptive summaries)
- Inventory audit and stock verification workflow
- Manual fine payment tracking (no online gateway)

## Circulation Workflow (Hardened)

Circulation uses the unified `Loan` transaction model. Admin users can issue by accession number or book ID, return active loans, list active/all loans, filter overdue loans, and view borrower or book-level circulation history.

Key API routes:

- `POST /api/loans/issue` - Admin only; accepts `accessionNumber` or `bookId`, plus `userId`, `studentRegNumber`, or `teacherId`.
- `PATCH /api/loans/:id/return` - Admin only; return is guarded against duplicate availability increments.
- `GET /api/loans` - Admin only; paginated list with `status`, `overdue`, `borrowerRole`, and `q` filters.
- `GET /api/loans/:id` - Admin or owning borrower.
- `GET /api/loans/history/me` - Student/Teacher own borrowing history.
- `GET /api/loans/borrowers/:userId/history` - Admin borrower history.
- `GET /api/loans/books/:bookId/history` - Admin book circulation history.
- `GET /api/loans/lookup/:accessionNumber` - Admin accession lookup with active-loan details.

Borrowing policy is read from `SystemSetting`: student max active loans defaults to `3`, teacher max active loans defaults to `5`, student duration defaults to `14` days, and teacher duration defaults to `30` days. These values can be changed from the existing System Settings flow.

Reservation limitation: returns still auto-fulfill the next pending reservation, but admin issue does not currently block issuing to a borrower other than the pending reservation holder.

## Database Notes for This Phase

Prisma schema now includes `Book`, `Loan`, `Reservation`, `SystemSetting`, `InventoryAuditSession`, `InventoryAuditScan`, and `FinePayment` models.

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

For demo in current authenticated mode:

- Create the first admin with `POST /api/auth/bootstrap-admin` and `ADMIN_SETUP_TOKEN`.
- Register Student/Teacher accounts from `/register`.
- Admins can create additional members from `/dashboard/admin/users`.

## Implementation Audit Findings (April 2026)

An extensive audit was performed on the codebase, comparing the implemented features against the original requirements documents. For full details, see the `IMPLEMENTATION_AUDIT_REPORT.md` file.

**Crucial Known Deficiencies:**

- **Authentication:** Faked via HTTP headers (`x-user-role`, `x-user-id`). No real JWT or password hashing exists.
- **User Management:** Registration paths for students, teachers, and admins are completely missing.
- **Book Catalog:** `Add`, `Edit`, and `Delete` UI for individual books are missing. Books can currently only be ingested via CSV. Search operates on the backend but lacks UI.
- **Testing:** Zero automated tests exist in the workspace.
- **Procurement:** Database models exist, but the feature is missing from the API and frontend.

**Recent Gap Closures:**

- **Faculty Borrowing Fix:** Added `facultySignatureText` input in the Admin Circulation Page to satisfy backend constraints.
- **Documentation Update:** Created `GAP_CLOSURE_REPORT.md` and `REQUIREMENT_TRACEABILITY.md` to properly document the system's relationship to original specifications.
