# Audit Log Implementation Report

## Summary

Persistent audit logging is now implemented with MariaDB + Prisma storage and an admin review UI.

## Backend Changes

- Added `AuditLog` Prisma model and migration.
- Added `GET /api/audit-logs` as an admin-only paginated/filterable endpoint.
- Replaced console-only audit helper with persistent audit writes.
- Added recursive metadata redaction for password, token, secret, credential, authorization, and cookie keys.
- Logged login success/failure, report generation, and member activation/deactivation in addition to existing catalog, circulation, reservation, outside-book, inventory-audit, fine, procurement, and bulk audit calls.

## Frontend Changes

- Added `/dashboard/admin/audit-logs`.
- Added filters for search, actor, action, entity, entity ID, and date range.
- Added loading, error, empty, table, pagination, and visible-row CSV export states.
- Added admin sidebar navigation entry.

## Tests Added

- Backend audit helper redaction/persistence tests.
- Backend audit service filter/pagination test.
- Backend audit route RBAC tests.
- Backend auth service login audit tests.
- Frontend audit log page render test.

## Verification

- `npm run prisma:generate`: passed.
- `npm --prefix iict-library-server test -- src/utils/auditLog.test.ts src/services/auditLog.service.test.ts src/routes/auditLog.routes.test.ts`: passed.
- `npm --prefix iict-library-server test -- src/services/auth.service.test.ts`: passed.
- `npm --prefix iict-library-client test -- src/pages/admin/AdminAuditLogsPage.test.tsx`: passed.
- `npm run build`: passed.

## Manual Test Steps

1. Apply migrations and start server/client.
2. Log in successfully and attempt one failed login.
3. As Admin, open `/dashboard/admin/audit-logs`.
4. Filter by `auth.login_success`, `auth.login_failure`, actor ID, entity, and date range.
5. Perform a circulation issue/return and verify new audit rows appear.
6. Use Export CSV and verify the visible rows are exported.

## Remaining Limitations

- Audit writes are intentionally non-blocking; if an audit write fails, the main business operation still completes and the server logs the audit write failure.
- Full browser E2E coverage for the audit page is not yet added.
