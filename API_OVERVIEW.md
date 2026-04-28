# API Overview

Base URL (development):

- http://localhost:5000/api

## Health

### GET /api/health

Returns service status.

## Auth Routes

Base path: /api/auth

### POST /api/auth/login

Body:

- email: string
- password: string

Behavior:

- Verifies password hash and returns the authenticated user plus JWT token.

### POST /api/auth/register

Body:

- name, email, password
- role: STUDENT or TEACHER
- department
- studentRegNumber/phoneNumber/currentSemester for students
- teacherId/designation/signatureData for teachers

Behavior:

- Creates a borrower account and matching profile.
- Student registration requires a phone number, matching the borrower-list process record.

### POST /api/auth/bootstrap-admin

Body:

- setupToken
- name, email, password

Behavior:

- Creates the first admin only when `ADMIN_SETUP_TOKEN` matches and no admin exists.

### GET /api/auth/me

Auth: Bearer token or auth cookie.

Behavior:

- Returns current user and profile data.

## User Management Routes

Base path: /api/users

Auth: ADMIN

- `GET /api/users` lists members with q, role, isActive, page, and pageSize filters.
- `POST /api/users` creates a member and profile.
- `GET /api/users/:id` returns a member.
- `PUT /api/users/:id` updates identity/profile fields, including Student phone number.
- `PATCH /api/users/:id/status` activates or deactivates a member.

Response shape:

- success: true
- message: string
- data.status: ok
- data.timestamp: ISO string

## Outside Book Routes

Base path: /api/outside-books

Auth requirement:

- x-user-id header
- x-user-role header

### POST /api/outside-books

Role: STUDENT

Body:

- title: string
- author: string

Behavior:

- Creates outside book entry with pending verification.

### GET /api/outside-books/my-entries

Role: STUDENT

Behavior:

- Returns student-specific outside book entries ordered by latest entry time.

### GET /api/outside-books/active

Role: ADMIN

Behavior:

- Returns active entries (without verified exit) including student relation data.

### PATCH /api/outside-books/:id/verify-entry

Role: ADMIN

Behavior:

- Verifies entry transition if not already verified.

### PATCH /api/outside-books/:id/verify-exit

Role: ADMIN

Behavior:

- Verifies exit transition only after entry verification.

## Spine Label Routes

Base path: /api/spine-labels

Auth requirement:

- x-user-id header
- x-user-role header (ADMIN)

### POST /api/spine-labels/generate

Role: ADMIN

Body:

- accessionNumber: string
- authorCode: string
- classificationNumber: string

Behavior:

- Returns normalized label preview payload.

## Circulation / Loan Routes

Base path: /api/loans

Auth requirement:

- x-user-id header
- x-user-role header

### POST /api/loans/issue

Role: ADMIN

Body:

- accessionNumber or bookId
- userId or studentRegNumber or teacherId
- dueAt optional ISO datetime
- facultySignatureText optional, required for Teacher if profile has no signature
- overrideReservation optional boolean
- reservationOverrideReason required when overrideReservation is true

Behavior:

- Issues an active loan, decrements availability, blocks archived/unavailable/already-issued accessions, applies policy limits, and enforces reservation precedence.
- If the borrower is the current reservation holder, the matching reservation is marked `FULFILLED`.
- If another borrower holds the reservation, the route returns `409` unless an admin override reason is supplied.

### PATCH /api/loans/:id/return

Role: ADMIN

Behavior:

- Returns an active loan, increments availability once, rejects duplicate returns, and triggers existing reservation auto-fulfillment.

### GET /api/loans

Role: ADMIN

Query:

- status: ACTIVE | RETURNED | OVERDUE
- overdue: true | false
- borrowerRole: STUDENT | TEACHER
- q: string
- page, pageSize

Behavior:

- Returns paginated circulation records with computed `effectiveStatus` and `isOverdue`.

### GET /api/loans/:id

Role: ADMIN or owning STUDENT/TEACHER

Behavior:

- Returns one loan transaction.

### GET /api/loans/history/me

Role: STUDENT or TEACHER

Behavior:

- Returns the authenticated borrower’s current and historical loans.

### GET /api/loans/lookup/:accessionNumber

Role: ADMIN

Behavior:

- Returns book lookup data, active loan data when the accession is issued, and the current reservation hold when one exists.

### GET /api/loans/borrowers/:userId/history

Role: ADMIN

Behavior:

- Returns all circulation records for a borrower.

### GET /api/loans/books/:bookId/history

Role: ADMIN

Behavior:

- Returns circulation history for a specific book/accession record.

## Procurement Routes

Base path: /api/procurements

Auth requirement:

- Bearer token or auth cookie
- Role: ADMIN

### GET /api/procurements/summary

Behavior:

- Returns counts and totals for applications, requisitions, vendors, orders, allocated budget, requested quantity, and estimated cost.

### GET /api/procurements/applications

Query:

- q: string
- department: CSE | SWE | EEE
- budgetYear: number
- page, pageSize

Behavior:

- Lists central library procurement applications with their requisition summaries.

### POST /api/procurements/applications

Body:

- applicationCode: string
- budgetYear: number
- allocatedBudget: number
- department: CSE | SWE | EEE

Behavior:

- Creates a procurement application and rejects duplicate application codes.

### PUT /api/procurements/applications/:id

Behavior:

- Updates procurement application metadata and keeps application code unique.

### GET /api/procurements/requisitions

Query:

- q: string
- applicationId: string
- page, pageSize

Behavior:

- Lists book requisitions with application and procurement-order summary data.

### POST /api/procurements/requisitions

Body:

- requisitionCode: string
- applicationId: string
- bookTitle: string
- authorName: string
- publisher, edition, isbn: optional string
- quantity: number
- pricePerUnit: optional number
- totalPrice: optional number

Behavior:

- Creates a requisition after validating the application. When `totalPrice` is omitted and `pricePerUnit` is present, the service calculates `quantity * pricePerUnit`.

### PUT /api/procurements/requisitions/:id

Behavior:

- Updates a requisition, validates application changes, and recalculates total price when quantity or unit price changes without an explicit total.

### GET /api/procurements/vendors

Query:

- q: string
- page, pageSize

Behavior:

- Lists vendors with procurement-order counts.

### POST /api/procurements/vendors

Body:

- vendorCode: string
- vendorName: string
- quotationDetails: optional string

Behavior:

- Creates a vendor and rejects duplicate vendor codes.

### PUT /api/procurements/vendors/:id

Behavior:

- Updates vendor metadata and keeps vendor code unique.

### GET /api/procurements/orders

Query:

- q: string
- requisitionId: string
- vendorId: string
- procurementStatus: NOT_STARTED | ONGOING | COMPLETED | CANCELLED
- shelvingStatus: PENDING | IN_PROGRESS | SHELVED
- page, pageSize

Behavior:

- Lists procurement orders with requisition, application, vendor, and cataloged-book data.

### POST /api/procurements/orders

Body:

- procurementCode: string
- requisitionId: string
- vendorId: string
- procurementApprovalDate, deliveryDate, handoverDateToIICT: optional date string
- bookReceivingRecord: optional string
- shelvingStatus: optional PENDING | IN_PROGRESS | SHELVED
- procurementStatus: optional NOT_STARTED | ONGOING | COMPLETED | CANCELLED

Behavior:

- Creates a procurement order after validating requisition, vendor, unique code, and date ordering.

### PUT /api/procurements/orders/:id

Behavior:

- Updates procurement status, shelving status, dates, receiving record, requisition, or vendor. Date ordering validation is preserved.

## Report Routes

Base path: /api/reports

Auth requirement:

- Bearer token or auth cookie
- Role: ADMIN

### GET /api/reports/issued-books

Query:

- from: optional date string
- to: optional date string
- status: ALL | ACTIVE | RETURNED | OVERDUE
- borrowerRole: STUDENT | TEACHER
- q: string
- page, pageSize

Behavior:

- Generates the LMS-FR15 issued-book administrative report.
- Returns summary totals for total issued, active, returned, overdue, and unique borrowers.
- Returns paginated rows with accession number, book title, author, borrower identity, issue/due/return dates, persisted status, computed effective status, overdue days, issuing admin, and returning admin.

## Standard Response Contract

Success:

- success: true
- message: optional string
- data: payload

Error:

- success: false
- message: string
- errors: optional details
