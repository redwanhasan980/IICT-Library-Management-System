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
- studentRegNumber/currentSemester for students
- teacherId/designation/signatureData for teachers

Behavior:

- Creates a borrower account and matching profile.

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
- `PUT /api/users/:id` updates identity/profile fields.
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

Behavior:

- Issues an active loan, decrements availability, blocks archived/unavailable/already-issued accessions, and applies policy limits.

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

### GET /api/loans/borrowers/:userId/history

Role: ADMIN

Behavior:

- Returns all circulation records for a borrower.

### GET /api/loans/books/:bookId/history

Role: ADMIN

Behavior:

- Returns circulation history for a specific book/accession record.

## Standard Response Contract

Success:

- success: true
- message: optional string
- data: payload

Error:

- success: false
- message: string
- errors: optional details
