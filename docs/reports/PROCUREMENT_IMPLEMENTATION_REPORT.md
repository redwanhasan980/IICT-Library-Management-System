# Procurement Implementation Report

## Scope

This phase implemented the SRS/UC-001 procurement workflow without rebuilding the project or changing the existing design system. The work uses the existing MariaDB + Prisma procurement schema and adds backend APIs, admin UI, tests, and documentation.

## Current Procurement Gaps Found

- Procurement models existed in Prisma: `ProcurementApplication`, `BookRequisition`, `Vendor`, and `Procurement`.
- No backend procurement routes, controllers, services, validators, or API overview entries existed.
- No frontend procurement API client, types, admin route, sidebar link, or admin workflow page existed.
- `Book.procurementId` already existed, so procurement can be linked to catalog records without schema changes.
- No migration was required because required procurement fields already matched the SRS/ER attributes.

## Backend Routes Added

Base path: `/api/procurements`

- `GET /summary`
- `GET /applications`
- `POST /applications`
- `PUT /applications/:id`
- `GET /requisitions`
- `POST /requisitions`
- `PUT /requisitions/:id`
- `GET /vendors`
- `POST /vendors`
- `PUT /vendors/:id`
- `GET /orders`
- `POST /orders`
- `PUT /orders/:id`

All procurement routes are protected and admin-only.

## Backend Files Changed

- `iict-library-server/src/validators/procurement.validator.ts`
- `iict-library-server/src/services/procurement.service.ts`
- `iict-library-server/src/controllers/procurement.controller.ts`
- `iict-library-server/src/routes/procurement.routes.ts`
- `iict-library-server/src/services/procurement.service.test.ts`
- `iict-library-server/src/index.ts`

## Frontend Pages And Components Changed

- `iict-library-client/src/types/procurement.types.ts`
- `iict-library-client/src/services/procurement.api.ts`
- `iict-library-client/src/pages/admin/AdminProcurementPage.tsx`
- `iict-library-client/src/pages/admin/AdminProcurementPage.test.tsx`
- `iict-library-client/src/config/api.ts`
- `iict-library-client/src/routes/AppRouter.tsx`
- `iict-library-client/src/layouts/Sidebar.tsx`

The new admin page is available at `/dashboard/admin/procurement`.

## Policy And Validation Behavior

- Only admins can use procurement APIs or UI.
- Application codes, requisition codes, vendor codes, and procurement codes are kept unique.
- Requisitions validate an existing application.
- Procurement orders validate existing requisition and vendor records.
- Quantities must be positive.
- Budgets and prices must be non-negative.
- Procurement date validation blocks delivery before approval and handover before delivery.
- Requisition `totalPrice` is calculated from `quantity * pricePerUnit` when omitted.

## Tests Added

Backend:

- `iict-library-server/src/services/procurement.service.test.ts`
  - application creation and duplicate-code rejection
  - requisition total-price calculation
  - procurement order creation with validated references
  - procurement order search/status filters
  - summary total aggregation

Frontend:

- `iict-library-client/src/pages/admin/AdminProcurementPage.test.tsx`
  - admin procurement page renders workflow sections, records, status, and order controls

## Verification Results

- Server build: `npm run build` passed.
- Server tests: `npm test` passed.
- Client build: `npm run build` passed.
- Client tests: `npm test` passed.

## Manual Test Steps

1. Log in as Admin.
2. Open `/dashboard/admin/procurement`.
3. Create a procurement application with application code, budget year, allocated budget, and department.
4. Create a book requisition under that application with title, author, quantity, and unit price.
5. Confirm the requisition total is calculated and appears in the table.
6. Create a vendor with quotation details.
7. Create a procurement order using the requisition and vendor.
8. Set approval, delivery, and handover dates.
9. Mark the order as ongoing, then completed.
10. Mark shelving as shelved.
11. Confirm summary cards and order table update.

## Remaining Limitations

- Completed procurement orders do not automatically create catalog accession records. Catalog entries can still be linked manually through the existing `Book.procurementId`.
- Procurement deletion is intentionally not exposed to preserve historical records; use `CANCELLED` status instead.
- No browser e2e test was added in this phase.
