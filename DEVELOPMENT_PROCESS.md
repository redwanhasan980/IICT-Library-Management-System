# Development Process

This document tracks the development process of the IICT Library Management System.

## Phase 1: Project Setup

- **Description**: Initial project setup with a monorepo structure for the client and server.
- **Files Created/Updated**:
  - `iict-library-client/`
  - `iict-library-server/`
  - `package.json` (root)
- **Commands Used**:
  - `npm create vite@latest iict-library-client -- --template react-ts`
  - `npm init -y` (in `iict-library-server`)
- **Next Steps**: Implement the Outside Book module.

## Phase 2: Outside Book Module

- **Description**: Implemented the core functionality for students to register outside books and for admins to verify their entry and exit.
- **Files Created/Updated**:
  - `iict-library-server/prisma/schema.prisma`
  - `iict-library-server/src/controllers/outsideBook.controller.ts`
  - `iict-library-server/src/repositories/outsideBook.repository.ts`
  - `iict-library-server/src/routes/outsideBook.routes.ts`
  - `iict-library-server/src/services/outsideBook.service.ts`
  - `iict-library-server/src/validators/outsideBook.validator.ts`
  - `iict-library-client/src/components/outside-book/OutsideBookEntryForm.tsx`
  - `iict-library-client/src/pages/admin/ActiveOutsideBookLogPage.tsx`
  - `iict-library-client/src/pages/student/MyOutsideBooksPage.tsx`
  - `iict-library-client/src/services/outsideBook.api.ts`
- **Commands Used**:
  - `npx prisma migrate dev --name init_schema`
- **Next Steps**: Cleanup and refactor the project.

## Phase 3: Spine Label Generator

- **Description**: Added a feature for admins to generate printable spine labels for books.
- **Files Created/Updated**:
  - `iict-library-server/src/controllers/spineLabel.controller.ts`
  - `iict-library-server/src/validators/spineLabel.validator.ts`
  - `iict-library-server/src/services/spineLabel.service.ts`
  - `iict-library-server/src/routes/spineLabel.routes.ts`
  - `iict-library-client/src/services/spineLabel.api.ts`
  - `iict-library-client/src/types/spineLabel.types.ts`
  - `iict-library-client/src/components/spine-label/SpineLabelGeneratorForm.tsx`
  - `iict-library-client/src/components/spine-label/SpineLabelPreview.tsx`
  - `iict-library-client/src/pages/admin/SpineLabelGeneratorPage.tsx`
  - `iict-library-client/src/routes/AppRouter.tsx` (updated)
  - `iict-library-client/src/layouts/Sidebar.tsx` (updated)
- **Commands Used**: None
- **Next Steps**: Prepare the project for production deployment.
