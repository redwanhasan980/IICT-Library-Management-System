# IICT Library Management System

IICT Library Management System is a full-stack monorepo with a React client and an Express + Prisma server targeting MariaDB.

## Project Structure

- iict-library-client: Frontend (React, TypeScript, Vite, RTK Query, Tailwind CSS)
- iict-library-server: Backend (Node.js, Express, Prisma, MariaDB)
- [Requirements Documents](../Requirements%20Documents/): Requirement and use-case artifacts
- [docs/development-process](development-process/): Phase-by-phase delivery notes

## Development Phases

- [development-process/Phase-1-Project-Setup.md](development-process/Phase-1-Project-Setup.md)
- [development-process/Phase-2-Outside-Book-Module.md](development-process/Phase-2-Outside-Book-Module.md)
- [development-process/Phase-3-Core-Expansion-and-Admin-Operations.md](development-process/Phase-3-Core-Expansion-and-Admin-Operations.md)

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
- REMOTE_DATABASE: set `false` for local XAMPP/MariaDB or `true` for the hosted database.
- LOCAL_DATABASE_URL: local MariaDB Prisma URL, example mysql://root:password@localhost:3306/iict_library
- REMOTE_DATABASE_URL: hosted MySQL/MariaDB Prisma URL, example Aiven MySQL with `sslaccept=accept_invalid_certs` or stricter SSL config if CA certificates are configured.
- DATABASE_URL: compatibility fallback used only when a selected local/remote URL is missing.
- JWT_SECRET: long random secret for signing auth tokens
- JWT_EXPIRES_IN: token lifetime, default 7d
- ADMIN_SETUP_TOKEN: one-time token for first admin bootstrap
- ENABLE_DEV_AUTH: false in production
- CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET: Cloudinary credentials for book image uploads

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

The server and Prisma npm scripts honor `REMOTE_DATABASE` in `iict-library-server/.env`. Use `REMOTE_DATABASE=false` for the local database and `REMOTE_DATABASE=true` for the hosted database.

### Seed steps

Demo data can be loaded after migrations are applied:

```bash
npm run seed:demo
```

The demo seed creates 20 catalog books with local cover placeholders, sample outside-book records, sample loans, audit logs, and these local credentials:

- Admin: `admin.demo@iict.local` / `Admin@12345`
- Student: `student.demo@iict.local` / `Student@12345`
- Teacher: `teacher.demo@iict.local` / `Teacher@12345`

Use the demo seed only for local development, QA, or presentation databases.

## Book Images

Admins can upload multiple images for each catalog book from the add/edit book screen. Images are uploaded to Cloudinary, and MariaDB stores only image metadata, ordering, and primary-image state. The first uploaded image is used as the catalog cover unless an admin chooses another primary image. Existing `coverImageUrl` values remain as a fallback, followed by the local placeholder image.

The LMS does not enforce a custom MB limit; Cloudinary account and plan limits still apply. Uploaded images are delivered through Cloudinary transformations for card covers, thumbnails, and detail-page gallery views.

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
- `POST /api/auth/register` for Student/Teacher self-registration. Student registration requires phone number.
- `POST /api/auth/bootstrap-admin` for first admin setup using `ADMIN_SETUP_TOKEN`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Admin users can manage members from `/dashboard/admin/users`.

The first admin can also be created from `/bootstrap-admin` when `ADMIN_SETUP_TOKEN` is configured.

Optional local header auth is available only when `ENABLE_DEV_AUTH=true` and `NODE_ENV` is not `production`. Do not enable it in deployment.

Unauthorized access is now routed to a dedicated `/unauthorized` page for clearer UX.

## Build and Test Steps

### Build checks

```bash
npm run build
npm test
```

The repository-root scripts delegate to `iict-library-server` and `iict-library-client`.

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

19. For Admin role:

- open `/dashboard/admin/procurement`
- create a procurement application with application code, budget year, allocated budget, and department
- create a book requisition under that application and verify total estimated price is calculated
- create a vendor with quotation details
- create a procurement order from the requisition and vendor
- update the order to ongoing/completed and mark shelving as shelved
- verify the summary cards and procurement order table update

20. For Admin role:

- open `/dashboard/admin/reports`
- generate an issued-book report with date, status, borrower role, or search filters
- verify summary cards and issued-book table rows
- download the visible report rows as CSV

## Newly Added Modules (Current)

- Book reservation and waitlist workflow
- Library policy and system settings management
- Scanner-friendly circulation flow (barcode/QR accession handling)
- Bulk import/export tools (CSV-first)
- Advanced analytics dashboard (descriptive summaries)
- Inventory audit and stock verification workflow
- Manual fine payment tracking (no online gateway)
- Procurement application, requisition, vendor, delivery, handover, and shelving workflow
- Administrative database-backed report generation
- Persistent admin audit logs with filters and CSV export

## Circulation Workflow (Hardened)

Circulation uses the unified `Loan` transaction model. Admin users can issue by accession number or book ID, return active loans, list active/all loans, filter overdue loans, and view borrower or book-level circulation history.

Key API routes:

- `POST /api/loans/issue` - Admin only; accepts `accessionNumber` or `bookId`, plus `userId`, `studentRegNumber`, or `teacherId`; supports reservation override with a required reason.
- `PATCH /api/loans/:id/return` - Admin only; return is guarded against duplicate availability increments.
- `GET /api/loans` - Admin only; paginated list with `status`, `overdue`, `borrowerRole`, and `q` filters.
- `GET /api/loans/:id` - Admin or owning borrower.
- `GET /api/loans/history/me` - Student/Teacher own borrowing history.
- `GET /api/loans/borrowers/:userId/history` - Admin borrower history.
- `GET /api/loans/books/:bookId/history` - Admin book circulation history.
- `GET /api/loans/lookup/:accessionNumber` - Admin accession lookup with active-loan and reservation-hold details.

Borrowing policy is read from `SystemSetting`: student max active loans defaults to `3`, teacher max active loans defaults to `5`, student duration defaults to `14` days, and teacher duration defaults to `30` days. These values can be changed from the existing System Settings flow.

Reservation-aware issuing is enforced: if a pending or currently fulfilled reservation hold exists, admin issue is blocked unless the borrower is the reservation holder. Admins can explicitly override the hold only by supplying a reason, and that override is written to persistent audit logs.

## Library Home, Header, Footer, And Public Catalog

The app now uses a reusable role-aware header and footer across public and protected pages. Header links are selected from the authenticated role so Admin-only routes are not shown to Student or Teacher users. Mobile navigation uses a hamburger menu, and authenticated users have a compact profile/logout menu.

Public routes:

- `/` - Library home with carousel, real aggregate stats, featured books, recommendations/fallbacks, new arrivals, popular books, quick actions, services, and help guidance.
- `/catalog` - unauthenticated safe catalog search using public book metadata only.
- `/about` - institution/library overview.
- `/bootstrap-admin` - first-admin bootstrap screen when `ADMIN_SETUP_TOKEN` is configured.

Protected routes added or surfaced:

- `/dashboard` - role-aware library dashboard summary.
- `/dashboard/profile` - authenticated account/profile view.
- `/dashboard/admin/audit-logs` - persistent audit log review.

Key API routes:

- `GET /api/dashboard/home` - public safe aggregate home data, recent books, popular books, and featured books.
- `GET /api/dashboard/summary` - authenticated role-aware stats and recent activity.
- `GET /api/books/public` - public safe catalog metadata with search and pagination.
- `GET /api/books/recent` - public recent active catalog records.
- `GET /api/books/popular` - public popular books ordered by loan count.
- `GET /api/books/recommended` - authenticated non-AI recommendations based on borrower history fields, with recent-book fallback.

There is no persistent favourites/bookmarks feature in this release. The home page intentionally uses **Featured Books** from active, available catalog records and documents that choice in [DASHBOARD_LAYOUT_IMPLEMENTATION_REPORT.md](reports/DASHBOARD_LAYOUT_IMPLEMENTATION_REPORT.md).

## Persistent Audit Logs

Audit events are stored in the `AuditLog` table with actor, role, action, entity, sanitized JSON metadata, IP address, user-agent, and timestamp fields. Admin users can review them at `/dashboard/admin/audit-logs`.

Key API route:

- `GET /api/audit-logs` - Admin only; supports `q`, `actorId`, `action`, `entityType`, `entityId`, `from`, `to`, `page`, and `pageSize`.

The audit helper redacts password/token/secret-like metadata keys before persistence. Current coverage includes login success/failure, catalog create/update/archive, circulation issue/return and reservation overrides, reservation changes, outside-book verification, inventory audit actions, fine payments, procurement changes, bulk exports/imports, report generation, and member status changes.

## Procurement Workflow

Procurement uses the existing MariaDB/Prisma procurement models. No schema migration was needed for this implementation. Admin users can record central library applications, create book requisitions, maintain vendor quotation records, create procurement orders, track approval/delivery/handover dates, mark procurement status, and track shelving status.

Key API routes:

- `GET /api/procurements/summary` - Admin only; returns application, requisition, vendor, order, budget, quantity, and estimated cost totals.
- `GET /api/procurements/applications` - Admin only; paginated application list with `q`, `department`, `budgetYear`, `page`, and `pageSize` filters.
- `POST /api/procurements/applications` - Admin only; creates a central library application record.
- `PUT /api/procurements/applications/:id` - Admin only; updates an application.
- `GET /api/procurements/requisitions` - Admin only; paginated requisition list with `q`, `applicationId`, `page`, and `pageSize`.
- `POST /api/procurements/requisitions` - Admin only; creates a book requisition and calculates `totalPrice` from quantity and unit price when omitted.
- `PUT /api/procurements/requisitions/:id` - Admin only; updates a requisition.
- `GET /api/procurements/vendors` - Admin only; paginated vendor list with search.
- `POST /api/procurements/vendors` - Admin only; creates a vendor quotation record.
- `PUT /api/procurements/vendors/:id` - Admin only; updates a vendor.
- `GET /api/procurements/orders` - Admin only; paginated procurement order list with status, shelving, requisition, vendor, and search filters.
- `POST /api/procurements/orders` - Admin only; creates a procurement order.
- `PUT /api/procurements/orders/:id` - Admin only; updates procurement status, shelving status, dates, receiving record, requisition, or vendor.

## Administrative Reports

The SRS LMS-FR15 report-generation requirement is covered by database-backed admin report views. Reports support relevant filters, summary totals, paginated rows, and CSV export from the admin UI.

Key API routes:

- `GET /api/reports/issued-books` - issued-book circulation report with computed overdue status.
- `GET /api/reports/returned-books` - returned-book circulation report.
- `GET /api/reports/overdue-loans` - active loans past due date.
- `GET /api/reports/outside-books` - outside-book entry/exit monitoring report.
- `GET /api/reports/catalog-inventory` - catalog and availability summary.
- `GET /api/reports/procurement-summary` - procurement order and cataloging summary.
- `GET /api/reports/audit-logs` - audit-log reporting view.

## Database Notes for This Phase

Prisma schema now includes `Book`, `Loan`, `Reservation`, `SystemSetting`, `InventoryAuditSession`, `InventoryAuditScan`, `FinePayment`, `ProcurementApplication`, `BookRequisition`, `Vendor`, and `Procurement` models.

After pulling latest code, run:

```bash
cd iict-library-server
npm run prisma:generate
npm run prisma:migrate
```

These are required before starting the backend for the new modules.

Latest auth/member migration note: `StudentProfile.phoneNumber` is nullable for existing rows, but new Student registration and admin-created Student records require it.

## Deployment Notes

- Build both apps before deployment.
- Use repository-root `npm run build` and `npm test` for final verification.
- Set NODE_ENV=production on server.
- Set CORS_ORIGIN to the deployed frontend origin.
- Ensure MariaDB is reachable from backend runtime environment.
- Run `npm run prisma:generate` and `npm run prisma:migrate:deploy` in deployment pipeline.
- Frontend is a static Vite build from iict-library-client/dist.
- See [DEPLOYMENT_CHECKLIST.md](deployment/DEPLOYMENT_CHECKLIST.md) and [DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md) for deployment steps.
- Final readiness docs: [SYSTEM_AUDIT_CURRENT_STATE.md](reports/SYSTEM_AUDIT_CURRENT_STATE.md), [FINAL_SYSTEM_READINESS_CHECKLIST.md](deployment/FINAL_SYSTEM_READINESS_CHECKLIST.md), [FINAL_QA_REPORT.md](reports/FINAL_QA_REPORT.md), and [SYSTEM_COMPLETION_REPORT.md](reports/SYSTEM_COMPLETION_REPORT.md).

## Demo Credentials

There are no hardcoded backend credentials currently.

For demo in current authenticated mode:

- Create the first admin with `POST /api/auth/bootstrap-admin` and `ADMIN_SETUP_TOKEN`.
- Register Student/Teacher accounts from `/register`.
- Admins can create additional members from `/dashboard/admin/users`.

## Implementation Audit Findings (April 2026)

An extensive audit was performed on the codebase, comparing the implemented features against the original requirements documents. For full details, see [IMPLEMENTATION_AUDIT_REPORT.md](reports/IMPLEMENTATION_AUDIT_REPORT.md).

**Original Audit Deficiencies Now Closed:**

- **Authentication:** JWT login, bcrypt password hashing, self-registration, admin bootstrap, and member management are implemented.
- **User Management:** Student, Teacher, and Admin member management exists through backend APIs and `/dashboard/admin/users`.
- **Book Catalog:** Single-book add/edit/archive and catalog search are implemented.
- **Testing:** Focused backend and frontend Vitest suites now cover circulation and procurement slices.
- **Procurement:** Backend APIs and the admin procurement UI are implemented.

**Recent Gap Closures:**

- **Faculty Borrowing Fix:** Added `facultySignatureText` input in the Admin Circulation Page to satisfy backend constraints.
- **Documentation Update:** Created [GAP_CLOSURE_REPORT.md](reports/GAP_CLOSURE_REPORT.md) and [REQUIREMENT_TRACEABILITY.md](core/REQUIREMENT_TRACEABILITY.md) to properly document the system's relationship to original specifications.
- **Procurement Workflow:** Added procurement applications, requisitions, vendors, orders, summary cards, status updates, and documentation.
- **Report Generation:** Added LMS-FR15 issued-book reporting with filters, summary, table output, and CSV download.
