# Reports Implementation Report

## Scope

This phase implements and expands SRS LMS-FR15: Report Generation. The workflow now includes issued, returned, overdue, outside-book, catalog inventory, procurement, and audit-log reports backed by database queries.

## Current Report Gaps Found

- Analytics summaries and CSV bulk exports already existed.
- No dedicated report-generation API existed for the SRS issued-book report scenario.
- No admin reports page existed in the frontend navigation.
- Circulation data already contained the needed issue, due, return, borrower, and accession fields, so no schema migration was required.
- Later readiness work expanded the report module beyond issued books without adding fake data.

## Backend Routes Added

Base path: `/api/reports`

- `GET /issued-books`
- `GET /returned-books`
- `GET /overdue-loans`
- `GET /outside-books`
- `GET /catalog-inventory`
- `GET /procurement-summary`
- `GET /audit-logs`

Filters:

- `from`
- `to`
- `status=ALL|ACTIVE|RETURNED|OVERDUE`
- `borrowerRole=STUDENT|TEACHER`
- `q`
- `page`
- `pageSize`

## Backend Files Changed

- `iict-library-server/src/validators/report.validator.ts`
- `iict-library-server/src/services/report.service.ts`
- `iict-library-server/src/controllers/report.controller.ts`
- `iict-library-server/src/routes/report.routes.ts`
- `iict-library-server/src/services/report.service.test.ts`
- `iict-library-server/src/index.ts`

## Frontend Files Changed

- `iict-library-client/src/types/report.types.ts`
- `iict-library-client/src/services/report.api.ts`
- `iict-library-client/src/pages/admin/AdminReportsPage.tsx`
- `iict-library-client/src/pages/admin/AdminReportsPage.test.tsx`
- `iict-library-client/src/config/api.ts`
- `iict-library-client/src/routes/AppRouter.tsx`
- `iict-library-client/src/layouts/Sidebar.tsx`

The admin reports page is available at `/dashboard/admin/reports`.

## Report Behavior

- Admin-only access.
- Date range filter on `issuedAt`.
- Status filter supports all, active, returned, and computed overdue records for circulation reports.
- Borrower-role filter supports student and teacher.
- Search covers book title, author, accession number, borrower name/email, student registration number, and teacher ID.
- Summary includes total issued, active, returned, overdue, and unique borrowers.
- Rows include accession number, book title, author, borrower identity, issue/due/return dates, effective status, overdue days, and issuing/returning admin references.
- Outside-book reports include entry/exit status, student snapshots, verification totals, and unique student counts.
- Catalog inventory reports include copy totals, available copies, issued/unavailable estimates, and archive totals.
- Procurement reports include order status totals, shelving status, cataloged-book counts, vendor/requisition context, and estimated value.
- Audit-log reports include actor/action/entity filters and summary counts from persistent audit data.
- Frontend provides CSV download for visible report rows.

## Tests Added

Backend:

- `iict-library-server/src/services/report.service.test.ts`
  - issued-book report rows include computed overdue status
  - overdue filter maps to active loans past due date
  - catalog inventory summary uses real book fields
  - procurement summary totals use real procurement/requisition fields

Frontend:

- `iict-library-client/src/pages/admin/AdminReportsPage.test.tsx`
  - report filters, summary, rows, status, and CSV action render

## Verification Results

- Server build: `npm run build` passed.
- Server tests: `npm test` passed.
- Client build: `npm run build` passed.
- Client tests: `npm test` passed.

## Manual Test Steps

1. Log in as Admin.
2. Open `/dashboard/admin/reports`.
3. Apply no filters and generate the issued-book report.
4. Apply a date range and verify totals/table rows update.
5. Filter by `OVERDUE` and verify overdue rows display with overdue-day counts.
6. Filter by `STUDENT` or `TEACHER`.
7. Search by accession number, title, borrower name, student registration number, or teacher ID.
8. Switch between returned, overdue, outside-book, catalog inventory, procurement, and audit-log report views.
9. Download CSV and confirm the visible rows are included.

## Remaining Limitations

- CSV export downloads the currently visible page of rows.
- No scheduled/email report delivery exists.
- No charting was added to this page; trend analytics remain in the existing Analytics module.
