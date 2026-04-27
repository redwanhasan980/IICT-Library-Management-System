# Requirement Traceability Matrix

**Project:** IICT Library Management System

This document maps the implemented features to the expectations defined in the original SRS, use case documents, ER diagrams, and process workflows.

| Feature / Module         | SRS / Use Case Expectation     | Implementation Status | Notes                                                                            |
| :----------------------- | :----------------------------- | :-------------------- | :------------------------------------------------------------------------------- |
| **Authentication**       | Secure login, logout, roles    | Partial               | Uses a mock header bridge (`x-user-role`, `x-user-id`). True JWT is missing.     |
| **Role-Based Access**    | Restrict Student vs Admin      | Fully Satisfied       | Front-end and back-end strictly separate logic across domains.                   |
| **Student Registration** | Self-signup flow               | Missing               | No UI or routes exist for single user creation.                                  |
| **Book Catalog Data**    | ISBN, Accession, Subject       | Fully Satisfied       | `Book` Prisma entity matches ER fields perfectly.                                |
| **Add Single Book**      | Admin adds one book at a time  | Missing               | Only implemented by Bulk CSV Import. No single-book form exists.                 |
| **Edit/Delete Book**     | Modify metadata or soft-delete | Missing               | API has archive flag, but no UI supports this yet.                               |
| **Search/Filter Books**  | Find books dynamically         | Partial               | Backend supports `q` parameter, frontend uses static fetching.                   |
| **Spine Labels**         | Print format, classification   | Fully Satisfied       | Supports Dewey/Cutter codes mapping efficiently.                                 |
| **Outside Book Logging** | Entry/Exit logs, Verification  | Fully Satisfied       | Implemented with admin cross-verification exactly matching process documents.    |
| **Teacher Borrowing**    | Include faculty signatures     | Fully Satisfied       | Forms pass `facultySignatureText` back successfully.                             |
| **Student Borrowing**    | Reg Num and limits logic       | Fully Satisfied       | Limits accurately restrict active loans through `policy.service`.                |
| **Fines Management**     | Manual fine recording          | Fully Satisfied       | Supports split manual payments and full payoffs.                                 |
| **Reservations**         | Queue books when out of stock  | Fully Satisfied       | Enforces expiry limitations effectively.                                         |
| **Inventory Audit**      | Scan and determine missing     | Fully Satisfied       | Complex status calculation for stock verification via accessions works properly. |
| **Procurement/Vendor**   | Managing book requisitions     | Missing               | Exists in ER and Prisma schema but 0% implemented in the application layer.      |
| **Analytics Dashboard**  | Trends and total metrics       | Partial               | Specific analytics page works. Main dashboards use dummy descriptions.           |
| **Testing**              | Automated verification         | Missing               | No tests authored.                                                               |

_This document was last updated after the Gap Closure implementation pass (April 2026)._
