# Circulation Implementation Report

## Current Circulation Gaps Found

- Backend only had issue, return, my-loans, and accession lookup routes.
- Admin active/all loan list, loan-by-id, borrower history, and book circulation history APIs were missing.
- Issue required `bookId`; issuing by accession number was only possible through frontend lookup.
- Return rejected non-active loans but was not transactionally guarded against duplicate availability increments.
- Overdue state existed in analytics/fines calculations but was not surfaced in circulation responses.
- Admin circulation UI lacked active loans, overdue filter, borrower history, and book history views.
- Student/Teacher users lacked a dedicated “My Borrowing” current/history page.
- Automated tests were absent.
- Pre-existing TypeScript build blockers existed in outside-book/catalog code and were fixed minimally.

## Backend Routes Added or Fixed

- `POST /api/loans/issue` now accepts `accessionNumber` or `bookId`, plus `userId`, `studentRegNumber`, or `teacherId`.
- `PATCH /api/loans/:id/return` now uses a duplicate-return-safe transaction.
- `GET /api/loans` added for admin paginated lists with status, overdue, role, and search filters.
- `GET /api/loans/:id` added for admin or owning borrower access.
- `GET /api/loans/history/me` added for Student/Teacher own history.
- `GET /api/loans/borrowers/:userId/history` added for admin borrower history.
- `GET /api/loans/books/:bookId/history` added for admin book circulation history.

## Services, Controllers, and Repositories Changed

- `loan.service.ts`: added borrower lookup, accession issuing, policy-limit enforcement reuse, computed overdue status, admin list/history APIs, issue transaction hardening, and duplicate-return protection.
- `loan.controller.ts`: added handlers for list, detail, own history, borrower history, and book history.
- `loan.routes.ts`: added admin/borrower route wiring and RBAC protection.
- `loan.validator.ts`: added Zod schemas for extended issue payloads, list filters, and history/detail params.
- `outsideBook.repository.ts`: removed unsupported Prisma MySQL `mode: insensitive` filters to restore build compatibility.

## Frontend Pages and Components Changed

- `AdminCirculationPage.tsx`: expanded scanner workflow with accession issue, borrower identifier modes, due-date override, faculty signature input, active loan table, overdue filter, borrower history, and book circulation history.
- `MyBorrowingHistoryPage.tsx`: added Student/Teacher current borrowed books and full history view.
- `library.api.ts`: added loan list/detail/history endpoints and extended issue payload typing.
- `book.types.ts`: added circulation response fields such as `effectiveStatus`, `isOverdue`, borrower role, and profile snapshots.
- `AppRouter.tsx` and `Sidebar.tsx`: added `/dashboard/student/borrowing` and `/dashboard/teacher/borrowing`.
- Shared Button/Badge types were minimally extended to match existing catalog usage.

## Borrowing Policy Implemented or Preserved

- Existing `SystemSetting` policy remains the source of truth.
- Student max active loans default: `3`.
- Teacher max active loans default: `5`.
- Student duration default: `14` days.
- Teacher duration default: `30` days.
- These are not hard-coded in multiple places; circulation reads through `policy.service`.

## Archive and Availability Blocking

- Archived books are rejected during issue.
- Books with `availableCopies < 1` are rejected.
- Accessions with an active loan are rejected as already issued.
- Issue decrements availability only after a conditional transactional availability check.
- Return increments availability only after a conditional active-loan update succeeds.

## Tests Added

- Backend:
  - student issue success.
  - faculty issue success with signature.
  - archived/unavailable rejection.
  - non-admin issue rejection through route RBAC.
  - return success.
  - duplicate return rejection without availability increment.
  - borrower history.
  - overdue list filter and pagination metadata.
- Frontend:
  - admin issue/return controls render.
  - issue validation feedback.
  - active loans table and overdue status render.
  - borrower/book history sections render.
  - Student/Teacher sidebar does not expose admin circulation controls.
  - borrower self-history page renders current/history data.

## Commands Run and Results

- `npm run prisma:generate` in server: passed.
- `npm run build` in server: passed.
- `npm test` in server: passed, 2 files and 9 tests.
- `npm run build` in client: passed.
- `npm test` in client: passed, 3 files and 7 tests.

## Manual Test Steps

1. Start server and client.
2. Log in as Admin and open `/dashboard/admin/circulation`.
3. Scan/type an accession number and verify book lookup shows accession, availability, due date/status if issued.
4. Issue to a student using Student Reg No. or User ID.
5. Issue to a teacher using Teacher ID and Faculty Signature Text.
6. Confirm unavailable, archived, already-issued, and duplicate-return attempts show clear errors.
7. Use the active loans search and overdue-only filter.
8. Select borrower/book actions from loan rows and verify history panels update.
9. Return an active loan and confirm status changes to returned and availability is restored.
10. Log in as Student or Teacher and open `/dashboard/student/borrowing` or `/dashboard/teacher/borrowing`.

## Remaining Limitations

- Temporary header-based auth remains unchanged.
- Reservation precedence is documented but not enforced during admin issue.
- No schema migration was required or added.
- Test dependency install reported moderate npm audit warnings in dev dependencies; no production dependency fix was applied because that would require broader package upgrades.
