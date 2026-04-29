# API Overview

Base URL (development):

- http://localhost:5000/api

## Health

### GET /api/health

Returns service status.

## Dashboard And Public Discovery Routes

### GET /api/dashboard/home

Auth: Public.

Behavior:

- Returns safe aggregate home stats: total books, available books, issued books, overdue loans, and active outside-book entries.
- Returns recent books, popular books ordered by loan count, and featured books from active available catalog records.
- Does not expose borrower/member private records.

### GET /api/dashboard/summary

Auth: Bearer token or auth cookie.

Behavior:

- Admin users receive operational stats including total books, available books, issued books, overdue loans, active outside-book entries, student/teacher counts, pending procurement, and recent activity.
- Student/Teacher users receive personal stats for current borrowed books, returned books, overdue books, active outside-book entries where applicable, and recent own borrowing activity.

### GET /api/books/public

Auth: Public.

Query:

- q: optional search over title, author, accession, call number, and subject category
- page, pageSize

Behavior:

- Returns active, non-archived catalog metadata suitable for unauthenticated browsing.

### GET /api/books/recent

Auth: Public.

Query:

- limit: optional number, max 20

Behavior:

- Returns recently added active catalog records ordered by creation date.

### GET /api/books/popular

Auth: Public.

Query:

- limit: optional number, max 20

Behavior:

- Returns active books ordered by recorded loan count. Returns an empty list if no loan history exists.

### GET /api/books/recommended

Auth: Bearer token or auth cookie.

Query:

- limit: optional number, max 20

Behavior:

- Uses transparent non-AI logic. If borrowing history exists, recommends active books with matching department, subject category, author, or broad DDC range and excludes already borrowed books.
- Falls back to recent active books when there is no usable history.

## Book Image Routes

Book image metadata is included in book responses as `primaryImage` for list/card views and `images` for detail views. Image bytes are stored and delivered by Cloudinary; MariaDB stores only metadata.

### POST /api/books/:bookId/images

Auth: ADMIN.

Content type: `multipart/form-data`

Fields:

- `images`: one or more JPEG, PNG, or WebP files

Behavior:

- Uploads images to Cloudinary under a book-specific folder.
- Adds image metadata records to MariaDB.
- Makes the first uploaded image primary when the book has no primary image.
- Does not enforce a custom LMS MB limit; Cloudinary account limits still apply.

### PATCH /api/books/:bookId/images/order

Auth: ADMIN.

Body:

- `imageIds`: ordered image IDs
- `primaryImageId`: optional image ID to mark primary

Behavior:

- Updates display order and primary-image state for the selected book.

### DELETE /api/books/:bookId/images/:imageId

Auth: ADMIN.

Behavior:

- Deletes the Cloudinary asset and removes the metadata row.
- Promotes the next image as primary if the deleted image was primary.

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

### GET /api/reports/returned-books

Behavior:

- Generates the returned-book circulation report with the same date, borrower role, search, and pagination filters as issued books.

### GET /api/reports/overdue-loans

Behavior:

- Generates active loan rows where `dueAt` is before the current server time and `returnedAt` is null.

### GET /api/reports/outside-books

Query:

- from, to, status: ALL | ENTERED | EXITED
- department: CSE | SWE | EEE
- q, page, pageSize

Behavior:

- Returns outside-book entry/exit rows, student snapshots, verification flags, and summary totals.

### GET /api/reports/catalog-inventory

Query:

- q, department, includeArchived, page, pageSize

Behavior:

- Returns catalog rows with accession, call number, barcode, copy counts, archive status, and inventory summary totals.

### GET /api/reports/procurement-summary

Query:

- q, procurementStatus, shelvingStatus, page, pageSize

Behavior:

- Returns procurement order rows with requisition/vendor/application context, cataloged-book counts, status totals, and estimated value.

### GET /api/reports/audit-logs

Query:

- q, actorId, action, entityType, entityId, from, to, page, pageSize

Behavior:

- Returns paginated persistent audit events with actor/action/entity metadata and summary counts.

## Audit Log Routes

Base path: /api/audit-logs

Auth requirement:

- Bearer token or auth cookie
- Role: ADMIN

### GET /api/audit-logs

Query:

- q: optional search across action, actor ID, entity type, and entity ID
- actorId: optional user ID
- action: optional exact action
- entityType: optional entity type
- entityId: optional entity ID
- from, to: optional ISO datetime range
- page, pageSize

Behavior:

- Returns paginated persistent audit log rows with actor, role, action, entity, sanitized metadata, IP address, user-agent, and timestamp.

## Standard Response Contract

Success:

- success: true
- message: optional string
- data: payload

Error:

- success: false
- message: string
- errors: optional details
