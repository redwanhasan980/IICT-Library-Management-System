# Schema and Workflow Reconciliation Decision Log

Date: 2026-04-19

This log records decisions made while reconciling implementation with the SRS, use-case tables, process descriptions, ER diagram, and attribute lists.

## Source-of-Truth Inputs Reviewed

- ../../Requirements Documents/IICT LIBRARY MANAGEMENT SYSTEM SRS.pdf
- ../../Requirements Documents/IICT Library Management System.pdf
- ../../Requirements Documents/IICT_Library_Use_Cases.pdf
- ../../Requirements Documents/IICT_Library_Use_Cases_Tables.pdf
- ../../Requirements Documents/IICT_Library_Use_Case_Tables.pdf
- ../../Requirements Documents/library management ER digram (2).pdf
- ../../Requirements Documents/Library_Attribute_Lists.pdf

## Decision 1: Borrowing Model (Unified vs Separate Student/Faculty Borrow Tables)

Decision:
- Keep one unified `Loan` transaction table.

Rationale:
- Current running workflows already depend on one loan service and one return flow.
- Use-case documents require different student/faculty workflows, not necessarily different physical tables.
- A single table preserves stable functionality and avoids risky rewrites while still supporting role-specific logic.

How role-specific behavior is represented:
- Added `Loan.borrowerRole` for explicit role snapshot at issue time.
- Added faculty-only signature capture fields:
  - `Loan.facultySignatureText`
  - `Loan.facultySignatureRecordedAt`
- Enforced in service layer:
  - Teacher loans now require signature information.
  - Student and teacher borrowers must have corresponding profiles and departments.

## Decision 2: Faculty Signature Representation

Decision:
- Store faculty signature in two places:
  - `TeacherProfile.signatureData` as reusable profile-level signature data.
  - `Loan.facultySignatureText` as transaction-level immutable snapshot.

Rationale:
- Profile-level data supports repeat usage.
- Loan-level snapshot preserves auditability of what was recorded for a specific borrowing event.

## Decision 3: Outside-Book Entry/Exit and Real Strike-Through Workflow

Decision:
- Preserve the existing outside-book lifecycle and add explicit digital state for physical strike-through semantics.

Representation:
- Added `OutsideBookEntry.entryStatus` (`ENTERED`, `EXITED`).
- Added snapshot fields for manual-log parity:
  - `studentRegNumberSnapshot`
  - `studentDepartmentSnapshot`
- Added digital strike/verification timestamps:
  - `studentStrikeMarkedAt`
  - `exitVerifiedAt`
- Existing verification booleans are retained for backward compatibility:
  - `isVerifiedEntry`, `isVerifiedExit`

Rationale:
- Matches documented requirement that entries are struck through at exit while keeping current endpoints and screens functional.

## Decision 4: Department Restriction to CSE/SWE/EEE

Decision:
- Introduced strict enum-based department model:
  - `Department` enum with `CSE`, `SWE`, `EEE`.

Where applied:
- `StudentProfile.department`
- `TeacherProfile.department`
- `Book.department`
- `OutsideBookEntry.studentDepartmentSnapshot`
- `ProcurementApplication.department`

Service enforcement:
- Borrowing and outside-book services now require profile + department presence for relevant role workflows.
- Bulk import validates department values (`CSE`, `SWE`, `EEE`) before write.

## Decision 5: Book Metadata and Classification Fields

Decision:
- Extend `Book` model to include missing documented metadata/classification fields.

Added metadata fields:
- `authorEditor`, `edition`, `volume`, `placeOfPublication`, `publisher`
- `dateOfPublication`, `source`, `binding`, `pagination`
- `billNumber`, `billDate`, `isbn`

Added classification/cataloging fields:
- `subjectCategory`, `deweyDecimalNumber`, `cutterCode`, `callNumber`, `locationCode`
- `catalogEntryDate`, `catalogedById`, `barcode`

Rationale:
- Aligns with SRS + attribute list + process docs for book list entry and catalog classification.
- Kept additive and nullable where appropriate to preserve existing records.

## Decision 6: Procurement-to-Book Handover Relationship

Decision:
- Add procurement entities and connect them to books after handover.

Added entities:
- `ProcurementApplication`
- `BookRequisition`
- `Vendor`
- `Procurement`

Book linkage:
- `Book.procurementId -> Procurement`

Rationale:
- Use cases and ER/attribute documents define procurement as upstream of book entry.
- This relation makes post-handover tracing explicit without forcing immediate UI rollout.

## Decision 7: Migration and Safety Strategy

Decision:
- Use additive, backward-compatible schema changes; avoid destructive rewrites.

Applied safeguards:
- Most new fields are nullable.
- Existing workflows/endpoints retained.
- Added indexes for documented query patterns and admin operations.

Operational note:
- Migration warnings were acknowledged for new unique constraints on `Book.barcode`, `StudentProfile.studentRegNumber`, and `TeacherProfile.teacherId`.
- These fields are nullable, minimizing immediate risk for existing data.

## Decision 8: What Was Deliberately Deferred

Deferred for a later phase to avoid breaking stable flows:
- New procurement UI modules and full procurement service API.
- Dedicated student/faculty borrowing tables (not needed after unified-model decision).
- Signature image/blob storage and verification workflow (beyond current text-based capture).

## Summary of Reconciliation Outcome

The implementation now aligns more closely with documented workflows while preserving working behavior:
- Unified borrowing with role-specific constraints and faculty signature capture.
- Department restrictions formalized via enum constraints.
- Book metadata and classification coverage aligned with attribute definitions.
- Outside-book digital status now models strike-through semantics.
- Procurement lineage is represented in schema and linked to books.
