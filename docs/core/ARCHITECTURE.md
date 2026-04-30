# Architecture Overview

## High-Level Structure

The repository is organized as a practical full-stack monorepo:

- iict-library-client: React + TypeScript application for user interface and role-based navigation.
- iict-library-server: Express + Prisma API for business logic and data access.
- [Requirements Documents](../../Requirements%20Documents/): Requirement and analysis artifacts in PDF format.

## Backend Architecture

### Layering

The server follows a controller -> service -> repository pattern:

- Routes: define endpoints, attach auth/RBAC and validation middleware.
- Controllers: orchestrate request/response and call service methods.
- Services: contain business rules and transition checks.
- Repositories: contain Prisma data access queries.
- Middleware: auth bridge, validation, centralized error handling.
- Utils: shared AppError and API response envelope helpers.

### Current Modules

- Authentication and member management
  - JWT login, bcrypt password hashing, registration, first-admin bootstrap, `/me`, logout, and admin member management.
- Book catalog and classification
  - Admin single-book create/edit/archive, catalog search/viewing, accession metadata, Dewey/Cutter classification, and spine-label generation.
- Circulation
  - Admin issue/return, accession lookup, duplicate-return protection, active/overdue filtering, borrower history, and book circulation history.
- Reservation, fines, and policies
  - Queue management, policy-driven borrowing limits/durations, fine summaries, and manual fine payment recording.
- Outside book monitoring
  - Student outside-book entry and admin entry/exit verification.
- Inventory audit
  - Audit sessions, accession scans, computed stock status, and close-session flow.
- Procurement
  - Central library applications, book requisitions, vendors, procurement orders, delivery/handover tracking, and shelving status.
- Reporting and analytics
  - Admin dashboard analytics, role dashboards, CSV bulk exports, and issued-book reports.

## Frontend Architecture

### State and API

- Redux Toolkit store with auth slice.
- RTK Query API layer for backend integration.
- API base URL from environment variable.
- Temporary session persistence in localStorage for development mode.

### UI Composition

- Routes:
  - Public routes (home/login/register)
  - Protected dashboard routes with role checks
- Layouts:
  - PublicLayout
  - DashboardLayout with Sidebar
- Shared components:
  - Button, Card, Input, Table, Badge
- Feature components/pages:
  - Outside book forms and logs
  - Spine label generator

## Request/Response Contract

API responses are standardized using a common envelope:

- Success: success=true, optional message, data payload
- Error: success=false, message, optional errors list

## Security Notes

- Production authentication uses JWT bearer tokens or the auth cookie returned by the login flow.
- Passwords are hashed with bcrypt.
- RBAC checks are active for route-level authorization.
- Optional development header auth (`x-user-id`, `x-user-role`) exists only when `ENABLE_DEV_AUTH=true` and `NODE_ENV` is not `production`.
- Production deployments must set `ONLINE=true`, `JWT_SECRET`, `CORS_ORIGIN`, `DATABASE_URL` or `REMOTE_DATABASE_URL`, and `ADMIN_SETUP_TOKEN`.

## Extension Points

- Add password reset/email verification if the deployment needs self-service account recovery.
- Add persistent audit-log storage if console audit events are not enough for institutional policy.
- Add browser end-to-end tests and CI deployment automation.
