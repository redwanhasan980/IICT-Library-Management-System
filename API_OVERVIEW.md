# API Overview

Base URL (development):

- http://localhost:5000/api

## Health

### GET /api/health

Returns service status.

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

## Standard Response Contract

Success:

- success: true
- message: optional string
- data: payload

Error:

- success: false
- message: string
- errors: optional details
