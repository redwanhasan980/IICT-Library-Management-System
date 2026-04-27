# Development Process

This document tracks the development process of the IICT Library Management System.

## Phase 1: Project Setup

- **Description**: Initial project setup with a monorepo structure for the client and server.
- **Files Created/Updated**:
  - `iict-library-client/`
  - `iict-library-server/`
  - `package.json` (root)
- **Commands Used**:
  - `npm create vite@latest iict-library-client -- --template react-ts`
  - `npm init -y` (in `iict-library-server`)
- **Next Steps**: Implement the Outside Book module.

## Phase 2: Outside Book Module

- **Description**: Implemented the core functionality for students to register outside books and for admins to verify their entry and exit.
- **Files Created/Updated**:
  - `iict-library-server/prisma/schema.prisma`
  - `iict-library-server/src/controllers/outsideBook.controller.ts`
  - `iict-library-server/src/repositories/outsideBook.repository.ts`
  - `iict-library-server/src/routes/outsideBook.routes.ts`
  - `iict-library-server/src/services/outsideBook.service.ts`
  - `iict-library-server/src/validators/outsideBook.validator.ts`
  - `iict-library-client/src/components/outside-book/OutsideBookEntryForm.tsx`
  - `iict-library-client/src/pages/admin/ActiveOutsideBookLogPage.tsx`
  - `iict-library-client/src/pages/student/MyOutsideBooksPage.tsx`
  - `iict-library-client/src/services/outsideBook.api.ts`
- **Commands Used**:
  - `npx prisma migrate dev --name init_schema`
- **Next Steps**: Continue with Phase 3 expansion modules (see `Development Process/Phase-3-Core-Expansion-and-Admin-Operations.md`).

## Phase 3: Spine Label Generator

- **Description**: Added a feature for admins to generate printable spine labels for books.
- **Files Created/Updated**:
  - `iict-library-server/src/controllers/spineLabel.controller.ts`
  - `iict-library-server/src/validators/spineLabel.validator.ts`
  - `iict-library-server/src/services/spineLabel.service.ts`
  - `iict-library-server/src/routes/spineLabel.routes.ts`
  - `iict-library-client/src/services/spineLabel.api.ts`
  - `iict-library-client/src/types/spineLabel.types.ts`
  - `iict-library-client/src/components/spine-label/SpineLabelGeneratorForm.tsx`
  - `iict-library-client/src/components/spine-label/SpineLabelPreview.tsx`
  - `iict-library-client/src/pages/admin/SpineLabelGeneratorPage.tsx`
  - `iict-library-client/src/routes/AppRouter.tsx` (updated)
  - `iict-library-client/src/layouts/Sidebar.tsx` (updated)
- **Commands Used**: None
- **Next Steps**: Prepare the project for production deployment.

## Phase 3 (Continuation from Phase 2): Core Expansion and Admin Operations

- **Description**: This continuation phase completes what followed after Phase 2 by expanding core modules for practical day-to-day library operations.
- **Detailed Document**:
  - `Development Process/Phase-3-Core-Expansion-and-Admin-Operations.md`
- **Coverage**:
  - Spine label generator
  - Reservation and waitlist flow
  - Policy and system settings
  - Circulation support
  - Bulk tools (import/export)
  - Analytics dashboard
  - Inventory audit and stock verification

## Phase 4: Full-System Polish and Stabilization

- **What Was Improved**:
  - Standardized backend API success/error response envelopes.
  - Added centralized not-found and error middleware.
  - Strengthened backend validation integration and route consistency.
  - Aligned Prisma schema with implemented outside-book workflow models and relations.
  - Completed missing frontend routing/layout/shared-component scaffolding.
  - Fixed strict TypeScript issues (type-only imports, selector typing, role typing).
  - Added frontend session bridge to align with temporary backend header-based auth.
  - Added and updated environment examples and expanded handoff documentation.

- **Files Created or Updated**:
  - `iict-library-server/prisma/schema.prisma` (updated)
  - `iict-library-server/tsconfig.json` (updated)
  - `iict-library-server/.env.example` (updated)
  - `iict-library-server/src/index.ts` (updated)
  - `iict-library-server/src/controllers/outsideBook.controller.ts` (updated)
  - `iict-library-server/src/controllers/spineLabel.controller.ts` (updated)
  - `iict-library-server/src/repositories/outsideBook.repository.ts` (updated)
  - `iict-library-server/src/routes/spineLabel.routes.ts` (updated)
  - `iict-library-server/src/validators/outsideBook.validator.ts` (updated)
  - `iict-library-server/src/middleware/auth.middleware.ts` (updated)
  - `iict-library-server/src/middleware/validate.middleware.ts` (updated)
  - `iict-library-server/src/middleware/error.middleware.ts` (created)
  - `iict-library-server/src/utils/apiResponse.ts` (created)
  - `iict-library-client/.env.example` (updated)
  - `iict-library-client/src/main.tsx` (updated)
  - `iict-library-client/src/App.tsx` (updated)
  - `iict-library-client/src/store.ts` (updated)
  - `iict-library-client/src/types/user.types.ts` (updated)
  - `iict-library-client/src/types/book.types.ts` (updated)
  - `iict-library-client/src/types/api.types.ts` (created)
  - `iict-library-client/src/config/api.ts` (updated)
  - `iict-library-client/src/services/auth.api.ts` (updated)
  - `iict-library-client/src/services/auth.slice.ts` (updated)
  - `iict-library-client/src/services/outsideBook.api.ts` (updated)
  - `iict-library-client/src/services/spineLabel.api.ts` (updated)
  - `iict-library-client/src/layouts/Sidebar.tsx` (updated)
  - `iict-library-client/src/components/outside-book/OutsideBookEntryForm.tsx` (updated)
  - `iict-library-client/src/components/spine-label/SpineLabelGeneratorForm.tsx` (updated)
  - `iict-library-client/src/components/spine-label/SpineLabelPreview.tsx` (updated)
  - `iict-library-client/src/pages/admin/ActiveOutsideBookLogPage.tsx` (updated)
  - `iict-library-client/src/pages/student/MyOutsideBooksPage.tsx` (updated)
  - `iict-library-client/src/components/shared/Button.tsx` (created)
  - `iict-library-client/src/components/shared/Card.tsx` (created)
  - `iict-library-client/src/components/shared/Input.tsx` (created)
  - `iict-library-client/src/components/shared/Table.tsx` (created)
  - `iict-library-client/src/components/shared/Badge.tsx` (created)
  - `iict-library-client/src/hooks/store.ts` (created)
  - `iict-library-client/src/layouts/PublicLayout.tsx` (created)
  - `iict-library-client/src/layouts/DashboardLayout.tsx` (created)
  - `iict-library-client/src/routes/ProtectedRoute.tsx` (created)
  - `iict-library-client/src/pages/HomePage.tsx` (created)
  - `iict-library-client/src/pages/LoginPage.tsx` (created)
  - `iict-library-client/src/pages/RegisterPage.tsx` (created)
  - `iict-library-client/src/pages/DashboardHomePage.tsx` (created)
  - `iict-library-client/src/pages/NotFoundPage.tsx` (created)
  - `iict-library-client/src/pages/admin/AdminDashboard.tsx` (created)
  - `iict-library-client/src/pages/student/StudentDashboard.tsx` (created)
  - `iict-library-client/src/pages/teacher/TeacherDashboard.tsx` (created)
  - `README.md` (updated)
  - `ARCHITECTURE.md` (created)
  - `API_OVERVIEW.md` (created)
  - `DATABASE_SCHEMA.md` (created)

- **What Commands Were Used**:
  - `npm install react-router-dom react-hook-form @hookform/resolvers zod react-hot-toast date-fns` (client)
  - `npx prisma format` (server)
  - `npx prisma generate` (server)
  - `npm run build` (server)
  - `npm run build` (client)
  - `npm run dev` (server smoke run)
  - `npm run dev` (client smoke run)

- **What Was Tested**:
  - Backend TypeScript compilation (`npm run build` in server) passed.
  - Frontend TypeScript + Vite production build (`npm run build` in client) passed.
  - Backend startup confirmed with health endpoint route available.
  - Frontend startup confirmed with Vite dev server running.

- **What Still Remains Optional**:
  - Replace temporary header-based auth bridge with real JWT/cookie authentication.
  - Add Prisma seed script and demo dataset.
  - Add automated integration tests for role-protected flows.
  - Add deployment automation (CI pipeline) for build + migrate + deploy sequence.

## Phase 5: Consistency and UX Safety Pass

- **What Was Improved**:
  - Added route param validation for verify-entry and verify-exit endpoints.
  - Added safer backend startup behavior (port-in-use handling, graceful shutdown signals).
  - Reduced production error detail leakage in centralized error handler.
  - Added lightweight audit log helper for outside-book create/verify actions.
  - Added reusable frontend loading/error/empty feedback components with retry support.
  - Added dedicated unauthorized page and routed RBAC denials there.
  - Added sidebar sign-out action to keep session handling explicit.

- **What Files Were Created or Updated**:
  - `iict-library-server/src/index.ts` (updated)
  - `iict-library-server/src/middleware/error.middleware.ts` (updated)
  - `iict-library-server/src/routes/outsideBook.routes.ts` (updated)
  - `iict-library-server/src/validators/outsideBook.validator.ts` (updated)
  - `iict-library-server/src/services/outsideBook.service.ts` (updated)
  - `iict-library-server/src/utils/auditLog.ts` (created)
  - `iict-library-client/src/components/shared/FeedbackState.tsx` (created)
  - `iict-library-client/src/pages/admin/ActiveOutsideBookLogPage.tsx` (updated)
  - `iict-library-client/src/pages/student/MyOutsideBooksPage.tsx` (updated)
  - `iict-library-client/src/pages/UnauthorizedPage.tsx` (created)
  - `iict-library-client/src/routes/ProtectedRoute.tsx` (updated)
  - `iict-library-client/src/routes/AppRouter.tsx` (updated)
  - `iict-library-client/src/layouts/Sidebar.tsx` (updated)
  - `README.md` (updated)
  - `DEVELOPMENT_PROCESS.md` (updated)

- **What Commands Were Used**:
  - `npm run build` (server)
  - `npm run build` (client)

- **What Was Tested**:
  - Backend TypeScript build passed after route/validation/startup updates.
  - Frontend TypeScript + Vite production build passed after UX and RBAC updates.
  - Unauthorized routing path behavior validated in route guard logic.

- **What Still Remains Optional**:
  - Persist audit events to database instead of console output.
  - Add dedicated unauthorized unit/integration test coverage.
  - Add pagination/filtering utilities for future large outside-book datasets.

## Phase 6: Reservation, Policy, Circulation, Bulk Tools, and Analytics

- **What Was Built**:
  - Added a full Book Reservation and Waitlist feature with queue ordering, duplicate active reservation prevention, and admin status actions (`FULFILLED`, `CANCELLED`, `EXPIRED`).
  - Added centralized Library Policy/System Settings with admin-only read/update APIs and service-level consumption by circulation/reservation/outside-book workflows.
  - Added scanner-friendly circulation endpoints and UI for accession-based issue/return lookup, including simple barcode/QR label preview and print support.
  - Added Bulk Import/Export tools for admins with CSV-first book import validation and CSV exports for books, loans, outside-book logs, and members.
  - Added Advanced Analytics dashboard APIs and admin page for operational summaries: most borrowed books, active borrowers, monthly borrowing trend, overdue trend, outside-book usage summary, and department-wise borrowing summary.
  - Preserved existing outside-book and spine-label flows while integrating policy toggles and shared UI patterns.

- **What Files Were Created or Updated**:
  - `iict-library-server/prisma/schema.prisma` (updated)
  - `iict-library-server/src/index.ts` (updated)
  - `iict-library-server/src/services/outsideBook.service.ts` (updated)
  - `iict-library-server/src/utils/csv.ts` (created)
  - `iict-library-server/src/services/policy.service.ts` (created)
  - `iict-library-server/src/services/book.service.ts` (created)
  - `iict-library-server/src/services/reservation.service.ts` (created)
  - `iict-library-server/src/services/loan.service.ts` (created)
  - `iict-library-server/src/services/bulk.service.ts` (created)
  - `iict-library-server/src/services/analytics.service.ts` (created)
  - `iict-library-server/src/controllers/book.controller.ts` (created)
  - `iict-library-server/src/controllers/reservation.controller.ts` (created)
  - `iict-library-server/src/controllers/loan.controller.ts` (created)
  - `iict-library-server/src/controllers/policy.controller.ts` (created)
  - `iict-library-server/src/controllers/bulk.controller.ts` (created)
  - `iict-library-server/src/controllers/analytics.controller.ts` (created)
  - `iict-library-server/src/routes/book.routes.ts` (created)
  - `iict-library-server/src/routes/reservation.routes.ts` (created)
  - `iict-library-server/src/routes/loan.routes.ts` (created)
  - `iict-library-server/src/routes/policy.routes.ts` (created)
  - `iict-library-server/src/routes/bulk.routes.ts` (created)
  - `iict-library-server/src/routes/analytics.routes.ts` (created)
  - `iict-library-server/src/validators/book.validator.ts` (created)
  - `iict-library-server/src/validators/reservation.validator.ts` (created)
  - `iict-library-server/src/validators/loan.validator.ts` (created)
  - `iict-library-server/src/validators/policy.validator.ts` (created)
  - `iict-library-server/src/validators/bulk.validator.ts` (created)
  - `iict-library-server/src/validators/analytics.validator.ts` (created)
  - `iict-library-client/src/config/api.ts` (updated)
  - `iict-library-client/src/types/book.types.ts` (updated)
  - `iict-library-client/src/components/shared/Badge.tsx` (updated)
  - `iict-library-client/src/services/library.api.ts` (created)
  - `iict-library-client/src/layouts/Sidebar.tsx` (updated)
  - `iict-library-client/src/routes/AppRouter.tsx` (updated)
  - `iict-library-client/src/pages/books/BookCatalogPage.tsx` (created)
  - `iict-library-client/src/pages/books/BookDetailsPage.tsx` (created)
  - `iict-library-client/src/pages/shared/MyReservationsPage.tsx` (created)
  - `iict-library-client/src/pages/admin/AdminReservationsPage.tsx` (created)
  - `iict-library-client/src/pages/admin/AdminSettingsPage.tsx` (created)
  - `iict-library-client/src/pages/admin/AdminCirculationPage.tsx` (created)
  - `iict-library-client/src/pages/admin/AdminBulkToolsPage.tsx` (created)
  - `iict-library-client/src/pages/admin/AdminAnalyticsPage.tsx` (created)
  - `README.md` (updated)
  - `DEVELOPMENT_PROCESS.md` (updated)

- **What Commands Were Used**:
  - `npm run prisma:generate` (server)
  - `npm run build` (server)
  - `npm run build` (client)

- **What Remains Next**:
  - Add database migration file execution in all environments (`npm run prisma:migrate`).
  - Add focused API/integration tests for reservation queue behavior, policy updates, and bulk import validation.
  - Add optional robust multipart file-upload import path in addition to current CSV-text import endpoint.

## Phase 7: Inventory Audit and Stock Verification

- **What Was Built**:
  - Added a dedicated Inventory Audit module for admins with support for creating audit sessions, listing sessions, viewing session details, adding scans (single and bulk), listing computed audit results, and closing sessions.
  - Implemented result classification for practical stock verification statuses:
    - `FOUND`
    - `MISSING`
    - `EXTRA_OR_UNMATCHED`
    - `ISSUED_DURING_AUDIT`
    - `INACTIVE_OR_ARCHIVED`
  - Kept inventory-audit logic isolated from borrowing/return workflows and used accession number as the core physical identifier.
  - Added admin UI workflow for creating and operating audit sessions with scanner-friendly fast entry, summary cards, filterable result table, and close-session action.
  - Added audit logging for major inventory-audit actions (session create, scan add, session close).

- **What Files Were Created or Updated**:
  - `iict-library-server/prisma/schema.prisma` (updated)
  - `iict-library-server/prisma/migrations/20260418211814_inventory_audit_and_stock_verification/migration.sql` (created)
  - `iict-library-server/src/index.ts` (updated)
  - `iict-library-server/src/validators/inventoryAudit.validator.ts` (created)
  - `iict-library-server/src/services/inventoryAudit.service.ts` (created)
  - `iict-library-server/src/controllers/inventoryAudit.controller.ts` (created)
  - `iict-library-server/src/routes/inventoryAudit.routes.ts` (created)
  - `iict-library-client/src/types/book.types.ts` (updated)
  - `iict-library-client/src/config/api.ts` (updated)
  - `iict-library-client/src/services/library.api.ts` (updated)
  - `iict-library-client/src/pages/admin/AdminInventoryAuditPage.tsx` (created)
  - `iict-library-client/src/routes/AppRouter.tsx` (updated)
  - `iict-library-client/src/layouts/Sidebar.tsx` (updated)
  - `README.md` (updated)
  - `DEVELOPMENT_PROCESS.md` (updated)

- **What Commands Were Used**:
  - `npm run prisma:generate` (server)
  - `npm run prisma:migrate -- --name inventory_audit_and_stock_verification` (server)
  - `npm run build` (server)
  - `npm run build` (client)

- **What Remains Next**:
  - Add targeted integration tests for inventory audit status classification and close-session behavior.
  - Add optional duplicate-scan detection/flagging rules if stricter physical-count reconciliation is needed.
  - Resolve Windows file-lock issue for Prisma engine rename during `prisma generate` on some environments, if it appears outside local development.

## Phase 8: Fine Payment Tracking Without Online Gateway

- **What Was Built**:
  - Added a centralized fine tracking foundation using existing loan due dates and policy-driven `finePerDay` settings.
  - Added immutable manual payment records (`FinePayment`) with payment date, amount, optional note, borrower, loan transaction, and admin recorder.
  - Implemented partial and full payment support with strict overpayment prevention.
  - Added admin APIs for:
    - fine summary by user
    - transaction-level fine details
    - unpaid/partially paid transaction list
    - manual payment recording
    - payment history retrieval
  - Added borrower informational APIs/pages so student and teacher users can view only their own fine summary, transaction-level status, and payment history.
  - Kept fine calculations centralized in service layer and added audit logs for payment recording.

- **What Files Were Created or Updated**:
  - `iict-library-server/prisma/schema.prisma` (updated)
  - `iict-library-server/prisma/migrations/20260418213035_fine_payment_tracking_manual/migration.sql` (created)
  - `iict-library-server/src/index.ts` (updated)
  - `iict-library-server/src/validators/fine.validator.ts` (created)
  - `iict-library-server/src/repositories/fine.repository.ts` (created)
  - `iict-library-server/src/services/fine.service.ts` (created)
  - `iict-library-server/src/controllers/fine.controller.ts` (created)
  - `iict-library-server/src/routes/fine.routes.ts` (created)
  - `iict-library-client/src/types/book.types.ts` (updated)
  - `iict-library-client/src/config/api.ts` (updated)
  - `iict-library-client/src/services/library.api.ts` (updated)
  - `iict-library-client/src/pages/admin/AdminFineManagementPage.tsx` (created)
  - `iict-library-client/src/pages/shared/MyFinesPage.tsx` (created)
  - `iict-library-client/src/routes/AppRouter.tsx` (updated)
  - `iict-library-client/src/layouts/Sidebar.tsx` (updated)
  - `README.md` (updated)
  - `DEVELOPMENT_PROCESS.md` (updated)

- **What Commands Were Used**:
  - `npm run prisma:migrate -- --name fine_payment_tracking_manual` (server)
  - `npm run prisma:generate` (server)
  - `npm run build` (server)
  - `npm run build` (client)

- **What Remains Next**:
  - Add integration tests for overpayment prevention, partial/full payment transitions, and borrower data-access constraints.
  - Optionally expose payment receipt export/print in admin fine workflow.
  - Replace development auth bridge with production auth and claims-based checks.

## Phase 9: Implementation Audit (Current State)

- **Description**: An extensive audit against SRS, BRS, ER diagrams, and roadmap checkpoints revealed incomplete modules. See `IMPLEMENTATION_AUDIT_REPORT.md` for full details.
- **Key Findings**:
  - **No Real Authentication**: JWT, password hashing, and user registration/seeding flows are entirely absent. Development headers `x-user-role` and `x-user-id` remain in use.
  - **Incomplete Book Management**: Individual CRUD functionality for books (Adding single books, Editing metadata, Archiving/Deleting) is missing from the UI and backend logic.
  - **Circulation Blocker**: Teacher borrowing restricts API calls by requiring `facultySignatureText`, which the UI currently fails to provide.
  - **Zero Tests**: No automated tests (unit, integration, e2e) are implemented despite building and passing TS compilation.
  - **Missing Workflows**: Real Dashboards, search bars on Book Catalogs, Notifications, and Procurement are incomplete or missing.

- **Next Expected Actions**:
  - Build actual backend/frontend authentication and user management endpoints.
  - Complete the individual Book CRUD workflow and wire UI components.
  - Wire Dashboard components to API data feeds.
  - Introduce an Integration/E2E Testing framework.

## Phase 10: Requirements Traceability and Gap Closure

- **Description**: Focused on the inconsistencies flagged by the Phase 9 Audit, addressing targeted functional gaps without causing huge regression cascades.
- **What Was Improved**:
  - **Faculty Borrowing Issue:** Added `facultySignatureText` to the frontend `issueLoan` API interface and Admin Circulation page. Fixed the core blockage for Teacher borrowing.
  - **Requirements Mapping:** Established exactly what SRS topics mapped to current modules in `REQUIREMENT_TRACEABILITY.md`.
  - **Gap Closure Reporting:** Recorded the current progress and scoped priorities safely utilizing `GAP_CLOSURE_REPORT.md` while waiting to completely implement deep system functionalities like Auth and Procurement.

## Phase 11: Circulation Workflow Hardening

- **What Was Improved**:
  - Extended the existing unified `Loan` workflow instead of rebuilding circulation.
  - Added accession-based issuing directly through `POST /api/loans/issue` while preserving `bookId` compatibility.
  - Added borrower lookup by `userId`, `studentRegNumber`, or `teacherId`.
  - Hardened issue/return transactions against unavailable, archived, already-issued, and duplicate-return cases.
  - Added computed `effectiveStatus` and `isOverdue` fields in circulation responses without rewriting historical records.
  - Added admin loan listing, loan detail, borrower history, and book circulation history APIs.
  - Expanded the admin circulation page with active loan search, overdue filter, borrower history, and book history while keeping the existing design language.
  - Added Student/Teacher “My Borrowing” pages for current loans and full history.
  - Added focused Vitest coverage for backend circulation rules/RBAC and frontend circulation rendering/RBAC visibility.

- **Files Created or Updated**:
  - `iict-library-server/src/services/loan.service.ts`
  - `iict-library-server/src/controllers/loan.controller.ts`
  - `iict-library-server/src/routes/loan.routes.ts`
  - `iict-library-server/src/validators/loan.validator.ts`
  - `iict-library-server/src/services/loan.service.test.ts`
  - `iict-library-server/src/routes/loan.routes.test.ts`
  - `iict-library-client/src/pages/admin/AdminCirculationPage.tsx`
  - `iict-library-client/src/pages/shared/MyBorrowingHistoryPage.tsx`
  - `iict-library-client/src/services/library.api.ts`
  - `iict-library-client/src/types/book.types.ts`
  - `iict-library-client/src/routes/AppRouter.tsx`
  - `iict-library-client/src/layouts/Sidebar.tsx`
  - `README.md`
  - `REQUIREMENT_TRACEABILITY.md`
  - `CIRCULATION_IMPLEMENTATION_REPORT.md`

- **Commands Used**:
  - `npm run prisma:generate` (server)
  - `npm install -D vitest supertest @types/supertest` (server)
  - `npm install -D vitest@1.6.1` (server)
  - `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom happy-dom` (client)
  - `npm install -D vitest@1.6.1` (client)
  - `npm run build` (server)
  - `npm test` (server)
  - `npm run build` (client)
  - `npm test` (client)

- **What Was Tested**:
  - Backend TypeScript build passed.
  - Backend Vitest passed: 2 files, 9 tests.
  - Frontend TypeScript + Vite production build passed.
  - Frontend Vitest passed: 3 files, 7 tests.

- **Remaining Limitations**:
  - Temporary header-based auth remains in place.
  - Reservation precedence is documented but not enforced during admin issue.
  - No database migration was required.

## Phase 12: Authentication and Member Management Hardening

- **What Was Improved**:
  - Replaced default header-only auth with bcrypt password verification and JWT bearer tokens.
  - Added `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/bootstrap-admin`, `GET /api/auth/me`, and logout support.
  - Added admin-only member management APIs for listing, creating, updating, and activating/deactivating users.
  - Added `User.isActive` to support production account deactivation.
  - Kept development header auth only behind `ENABLE_DEV_AUTH=true` and disabled it in production.
  - Reworked frontend login/register flows to use backend auth APIs.
  - Added admin member-management UI at `/dashboard/admin/users`.

- **Files Created or Updated**:
  - `iict-library-server/prisma/schema.prisma`
  - `iict-library-server/prisma/migrations/20260427210508_production_auth_user_status/migration.sql`
  - `iict-library-server/src/middleware/auth.middleware.ts`
  - `iict-library-server/src/services/auth.service.ts`
  - `iict-library-server/src/controllers/auth.controller.ts`
  - `iict-library-server/src/routes/auth.routes.ts`
  - `iict-library-server/src/services/user.service.ts`
  - `iict-library-server/src/controllers/user.controller.ts`
  - `iict-library-server/src/routes/user.routes.ts`
  - `iict-library-client/src/pages/LoginPage.tsx`
  - `iict-library-client/src/pages/RegisterPage.tsx`
  - `iict-library-client/src/pages/admin/AdminUsersPage.tsx`
  - `iict-library-client/src/services/auth.api.ts`
  - `iict-library-client/src/services/user.api.ts`

- **Commands Used**:
  - `npm run prisma:migrate -- --name production_auth_user_status`
  - `npm run build` (server)
  - `npm test` (server)
  - `npm run build` (client)
  - `npm test` (client)

- **What Was Tested**:
  - Backend TypeScript build passed.
  - Backend Vitest passed.
  - Frontend TypeScript + Vite production build passed.
  - Frontend Vitest passed.

- **Remaining Limitations**:
  - Password reset, email verification, and MFA are not implemented.
  - Admin bootstrap requires `ADMIN_SETUP_TOKEN`; production deployments must set it and then use normal admin-created accounts afterward.

## Phase 13: Real Dashboard Data Wiring

- **What Was Improved**:
  - Replaced placeholder Admin, Student, and Teacher dashboards with real API-backed operational summaries.
  - Admin dashboard now shows active loans, overdue loans, pending reservations, unpaid fine rows, most borrowed books, and active borrowers.
  - Student dashboard now shows active loans, overdue loans, pending reservations, outstanding fines, current loans, and outside-book status.
  - Teacher dashboard now shows active loans, overdue loans, pending reservations, outstanding fines, and current loans.

- **Files Created or Updated**:
  - `iict-library-client/src/pages/admin/AdminDashboard.tsx`
  - `iict-library-client/src/pages/student/StudentDashboard.tsx`
  - `iict-library-client/src/pages/teacher/TeacherDashboard.tsx`

- **Commands Used**:
  - `npm run build` (client)
  - `npm test` (client)

- **What Was Tested**:
  - Frontend TypeScript + Vite production build passed.
  - Frontend Vitest passed.

## Phase 14: Procurement Workflow Implementation

- **What Was Improved**:
  - Implemented the SRS/UC-001 procurement workflow using the existing `ProcurementApplication`, `BookRequisition`, `Vendor`, and `Procurement` Prisma models.
  - Added admin-only backend APIs for procurement summaries, applications, requisitions, vendors, and procurement orders.
  - Added validation for unique procurement codes, existing application/requisition/vendor references, positive quantities, non-negative budgets/prices, enum values, pagination, and procurement date ordering.
  - Added requisition total-price calculation when quantity and unit price are supplied without an explicit total.
  - Added admin UI at `/dashboard/admin/procurement` for recording central library applications, book requisitions, vendor quotation details, procurement orders, delivery/handover dates, receiving records, procurement status, and shelving status.
  - Kept procurement additive and did not require a schema migration.

- **Files Created or Updated**:
  - `iict-library-server/src/validators/procurement.validator.ts`
  - `iict-library-server/src/services/procurement.service.ts`
  - `iict-library-server/src/controllers/procurement.controller.ts`
  - `iict-library-server/src/routes/procurement.routes.ts`
  - `iict-library-server/src/services/procurement.service.test.ts`
  - `iict-library-server/src/index.ts`
  - `iict-library-client/src/types/procurement.types.ts`
  - `iict-library-client/src/services/procurement.api.ts`
  - `iict-library-client/src/pages/admin/AdminProcurementPage.tsx`
  - `iict-library-client/src/pages/admin/AdminProcurementPage.test.tsx`
  - `iict-library-client/src/config/api.ts`
  - `iict-library-client/src/routes/AppRouter.tsx`
  - `iict-library-client/src/layouts/Sidebar.tsx`
  - `README.md`
  - `API_OVERVIEW.md`
  - `REQUIREMENT_TRACEABILITY.md`
  - `PROCUREMENT_IMPLEMENTATION_REPORT.md`

- **Commands Used**:
  - `npm run build` (server)
  - `npm test` (server)
  - `npm run build` (client)
  - `npm test` (client)

- **What Was Tested**:
  - Backend TypeScript build passed.
  - Backend Vitest passed, including procurement service tests for application uniqueness, requisition total calculation, order creation validation, order filtering, and summary totals.
  - Frontend TypeScript + Vite production build passed.
  - Frontend Vitest passed, including procurement admin page rendering.

- **Remaining Limitations**:
  - Procurement records are linked to catalog books through the existing optional `Book.procurementId`, but this phase does not auto-create catalog accessions from completed procurement orders.
  - Procurement deletion is intentionally not exposed; use status updates such as `CANCELLED` to preserve audit history.
  - End-to-end browser automation and deployment pipeline automation remain future hardening work.
