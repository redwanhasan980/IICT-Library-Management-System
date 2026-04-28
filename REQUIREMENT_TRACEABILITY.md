# Requirement Traceability Matrix

**Project:** IICT Library Management System

This document maps the implemented features to the expectations defined in the original SRS, use case documents, ER diagrams, and process workflows.

| Feature / Module         | SRS / Use Case Expectation     | Implementation Status | Notes                                                                            |
| :----------------------- | :----------------------------- | :-------------------- | :------------------------------------------------------------------------------- |
| **Authentication**       | Secure login, logout, roles    | Fully Satisfied       | JWT login, bcrypt password hashing, logout, `/me`, and first-admin bootstrap are implemented. |
| **Role-Based Access**    | Restrict Student vs Admin      | Fully Satisfied       | Front-end and back-end strictly separate logic across domains.                   |
| **Student Registration** | Self-signup flow               | Fully Satisfied       | Student/Teacher registration creates matching profile records; Student records include registration number, phone number, department, and semester data. |
| **Member Management**    | Manage Students/Faculty/Admins | Fully Satisfied       | Admin member screen and `/api/users` routes support creation, lookup, and active status. |
| **Book Catalog Data**    | ISBN, Accession, Subject       | Fully Satisfied       | `Book` Prisma entity matches ER fields perfectly.                                |
| **Add Single Book**      | Admin adds one book at a time  | Fully Satisfied       | Admin catalog form supports single-book creation with accession metadata.         |
| **Edit/Delete Book**     | Modify metadata or soft-delete | Fully Satisfied       | Admin catalog supports editing and archive/reactivation through the API.          |
| **Search/Filter Books**  | Find books dynamically         | Fully Satisfied       | Catalog and admin book views use backend `q` and pagination support.              |
| **Spine Labels**         | Print format, classification   | Fully Satisfied       | Supports Dewey/Cutter codes mapping efficiently.                                 |
| **Outside Book Logging** | Entry/Exit logs, Verification  | Fully Satisfied       | Implemented with admin cross-verification exactly matching process documents.    |
| **LMS-FR8 Book Issuing** | Admin issues by accession      | Fully Satisfied       | `POST /api/loans/issue` accepts accession/book ID and borrower user/reg/teacher IDs. |
| **LMS-FR9 Book Return**  | Return and mark available      | Fully Satisfied       | Return is admin-only and duplicate-return safe before availability increment.    |
| **LMS-FR10 Student Borrower Records / UC-05** | Student borrower list/history | Fully Satisfied | Student profile validation, reg-number lookup, phone number capture, active loan limits, and history are implemented. |
| **LMS-FR11 Faculty Borrower Records / UC-06** | Faculty records and signature | Fully Satisfied | Teacher ID lookup, department/profile validation, designation data, and signature capture are supported. |
| **LMS-FR14 Borrowing History View** | Borrower and admin history views | Fully Satisfied | Student/Teacher own history plus admin borrower/book circulation histories are available. |
| **Teacher Borrowing**    | Include faculty signatures     | Fully Satisfied       | Forms pass `facultySignatureText` back successfully and backend validates it for Teacher loans. |
| **Student Borrowing**    | Reg Num and limits logic       | Fully Satisfied       | Limits accurately restrict active loans through `policy.service`; reg-number issue is supported. |
| **Fines Management**     | Manual fine recording          | Fully Satisfied       | Supports split manual payments and full payoffs.                                 |
| **Reservations**         | Queue books when out of stock  | Fully Satisfied       | Enforces expiry limitations effectively.                                         |
| **Inventory Audit**      | Scan and determine missing     | Fully Satisfied       | Complex status calculation for stock verification via accessions works properly. |
| **Procurement/Vendor / UC-001** | Applications, requisitions, vendor selection, approval, delivery, handover, shelving | Fully Satisfied | Admin procurement workflow covers central library applications, requisitions, vendors, procurement orders, delivery/handover dates, receiving records, procurement status, and shelving status. |
| **LMS-FR15 Report Generation** | Admin issued-book reports | Fully Satisfied | `/api/reports/issued-books` and `/dashboard/admin/reports` generate filterable issued-book reports with summary totals, computed overdue status, and CSV download. |
| **Analytics Dashboard**  | Trends and total metrics       | Fully Satisfied       | Admin, Student, and Teacher dashboards now render API-backed operational data.   |
| **Testing**              | Automated verification         | Partial               | Focused Vitest coverage exists for circulation, procurement, reports, borrower pages, and RBAC visibility; full e2e coverage remains future work. |

_This document was last updated after the administrative reports implementation pass (April 2026)._
