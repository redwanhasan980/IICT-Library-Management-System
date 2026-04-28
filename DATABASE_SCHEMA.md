# Database Schema Notes (MariaDB + Prisma)

## Datasource

Prisma datasource:

- provider: mysql
- `DATABASE_URL`: MariaDB-compatible connection string

## Core Identity Models

- `User`: email, hashed password, name, role, active status, auth owner for loans/fines/reservations.
- `StudentProfile`: registration number, phone number, department, current semester.
- `TeacherProfile`: teacher ID, department, designation, optional signature data.
- `AdminProfile`: admin profile relation for administrative workflows.

## Catalog And Classification

- `Book`: accession number, title, author/editor, edition/volume, publication details, source, binding, pagination, bill data, ISBN, department, subject category, DDC number, Cutter code, call number, location, barcode, copy counts, archive status, and optional `procurementId`.
- `SystemSetting`: borrowing duration, max active loans, fine rate, reservation expiry, outside-book toggle, updater.
- Enums: `Department`, `BookSource`, `BindingType`.

## Circulation, Reservations, And Fines

- `Loan`: book, borrower, borrower role snapshot, faculty signature text, issuing/returning admins, issue/due/return dates, and loan status.
- `Reservation`: book, user, queue number, status, expiry, fulfilled/cancelled/expired timestamps.
- `FinePayment`: loan, borrower, recording admin, amount, payment date, and note.
- Enums: `LoanStatus`, `ReservationStatus`.

## Outside Book Monitoring

- `OutsideBookEntry`: student, title, author, entry/exit timestamps, verification flags, entry/exit verifying admins, and student snapshot fields.
- Enum: `OutsideBookEntryStatus`.

## Inventory Audit

- `InventoryAuditSession`: title, notes, status, creator/closer, start/close timestamps.
- `InventoryAuditScan`: audit session, accession number, optional matched book, scanner, scan time, matched flag.
- Enum: `InventoryAuditSessionStatus`.

## Procurement

- `ProcurementApplication`: application code, budget year, allocated budget, department.
- `BookRequisition`: requisition code, application, requested book title/author/publisher/edition/ISBN, quantity, unit price, total price.
- `Vendor`: vendor code, name, quotation details.
- `Procurement`: procurement code, requisition, vendor, approval/delivery/handover dates, receiving record, shelving status, procurement status.
- Enums: `ShelvingStatus`, `ProcurementStatus`.

## Migration Flow

Recommended workflow:

1. Update `schema.prisma`.
2. Run `npm run prisma:generate`.
3. Run `npm run prisma:migrate` in development or `prisma migrate deploy` in deployment.

## Seed Flow

- No seed script is currently registered.
- First admin is created through `POST /api/auth/bootstrap-admin` using `ADMIN_SETUP_TOKEN`.
- Demo users/books can be created through the admin UI or API after bootstrap.

## Compatibility Notes

- Schema and connection URL are MariaDB-compatible.
- Use `mysql://` in `DATABASE_URL` for MariaDB with Prisma.
- Procurement and reports implementation did not require schema changes because the needed models/relations already existed.
