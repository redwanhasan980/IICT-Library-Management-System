# Final QA Report

Date: April 28, 2026

## Automated Verification

Commands run from repository root:

```bash
npm run prisma:generate
npm run build
npm test
npm --prefix iict-library-client run lint
```

Results:

- Prisma Client generation: passed.
- Root build: passed.
- Root test suite: passed.
- Client lint: passed.

Latest observed test totals:

- Backend: 9 test files, 32 tests passed.
- Frontend: 8 test files, 13 tests passed.

Build note:

- Vite reports a chunk-size warning for the client bundle. This is a warning only and does not fail the production build.

## Focus Areas Verified

- Registration validation and login error UX.
- Circulation issue/return, reservation precedence, borrower history, overdue state.
- Audit persistence, audit route RBAC, metadata redaction, audit UI.
- Report service logic and expanded admin report UI.
- Procurement service summaries.
- Sidebar role visibility for borrower/admin workflows.

## Manual QA Steps Recommended Before Production

1. Apply migrations to a staging MariaDB database.
2. Bootstrap the first admin.
3. Create Student and Teacher accounts with complete profile fields.
4. Create catalog books with accession and barcode values.
5. Issue and return a book by accession.
6. Place a reservation and verify wrong-borrower issue blocks without override.
7. Verify outside-book entry and exit flows.
8. Run inventory audit scan scenarios.
9. Record a fine payment.
10. Create procurement records through application, requisition, vendor, and order steps.
11. Generate each report view.
12. Review audit logs for the actions above.

## QA Limitations

- No full browser E2E automation was added in this pass.
- No load testing was performed.
- No production hosting environment was available in this workspace, so deployment was documented but not executed.
