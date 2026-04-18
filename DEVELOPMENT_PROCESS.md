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

## Phase 4: Full-System Polish and Stabilization

- **What Was Improved**:
  - Standardized backend API success/error response envelopes.
  - Added centralized not-found and error middleware.
  - Strengthened backend validation integration and route consistency.
  - Aligned Prisma schema with implemented outside-book workflow models and relations.
  - Completed missing frontend routing/layout/shared-component scaffolding.
  - Fixed strict TypeScript issues (type-only imports, selector typing, role typing).
  - Added frontend session bridge to align with temporary backend header-based auth.
  - Added and updated environment examples and expanded handoff documentation.

- **Files Created or Updated**:
  - `iict-library-server/prisma/schema.prisma` (updated)
  - `iict-library-server/tsconfig.json` (updated)
  - `iict-library-server/.env.example` (updated)
  - `iict-library-server/src/index.ts` (updated)
  - `iict-library-server/src/controllers/outsideBook.controller.ts` (updated)
  - `iict-library-server/src/controllers/spineLabel.controller.ts` (updated)
  - `iict-library-server/src/repositories/outsideBook.repository.ts` (updated)
  - `iict-library-server/src/routes/spineLabel.routes.ts` (updated)
  - `iict-library-server/src/validators/outsideBook.validator.ts` (updated)
  - `iict-library-server/src/middleware/auth.middleware.ts` (updated)
  - `iict-library-server/src/middleware/validate.middleware.ts` (updated)
  - `iict-library-server/src/middleware/error.middleware.ts` (created)
  - `iict-library-server/src/utils/apiResponse.ts` (created)
  - `iict-library-client/.env.example` (updated)
  - `iict-library-client/src/main.tsx` (updated)
  - `iict-library-client/src/App.tsx` (updated)
  - `iict-library-client/src/store.ts` (updated)
  - `iict-library-client/src/types/user.types.ts` (updated)
  - `iict-library-client/src/types/book.types.ts` (updated)
  - `iict-library-client/src/types/api.types.ts` (created)
  - `iict-library-client/src/config/api.ts` (updated)
  - `iict-library-client/src/services/auth.api.ts` (updated)
  - `iict-library-client/src/services/auth.slice.ts` (updated)
  - `iict-library-client/src/services/outsideBook.api.ts` (updated)
  - `iict-library-client/src/services/spineLabel.api.ts` (updated)
  - `iict-library-client/src/layouts/Sidebar.tsx` (updated)
  - `iict-library-client/src/components/outside-book/OutsideBookEntryForm.tsx` (updated)
  - `iict-library-client/src/components/spine-label/SpineLabelGeneratorForm.tsx` (updated)
  - `iict-library-client/src/components/spine-label/SpineLabelPreview.tsx` (updated)
  - `iict-library-client/src/pages/admin/ActiveOutsideBookLogPage.tsx` (updated)
  - `iict-library-client/src/pages/student/MyOutsideBooksPage.tsx` (updated)
  - `iict-library-client/src/components/shared/Button.tsx` (created)
  - `iict-library-client/src/components/shared/Card.tsx` (created)
  - `iict-library-client/src/components/shared/Input.tsx` (created)
  - `iict-library-client/src/components/shared/Table.tsx` (created)
  - `iict-library-client/src/components/shared/Badge.tsx` (created)
  - `iict-library-client/src/hooks/store.ts` (created)
  - `iict-library-client/src/layouts/PublicLayout.tsx` (created)
  - `iict-library-client/src/layouts/DashboardLayout.tsx` (created)
  - `iict-library-client/src/routes/ProtectedRoute.tsx` (created)
  - `iict-library-client/src/pages/HomePage.tsx` (created)
  - `iict-library-client/src/pages/LoginPage.tsx` (created)
  - `iict-library-client/src/pages/RegisterPage.tsx` (created)
  - `iict-library-client/src/pages/DashboardHomePage.tsx` (created)
  - `iict-library-client/src/pages/NotFoundPage.tsx` (created)
  - `iict-library-client/src/pages/admin/AdminDashboard.tsx` (created)
  - `iict-library-client/src/pages/student/StudentDashboard.tsx` (created)
  - `iict-library-client/src/pages/teacher/TeacherDashboard.tsx` (created)
  - `README.md` (updated)
  - `ARCHITECTURE.md` (created)
  - `API_OVERVIEW.md` (created)
  - `DATABASE_SCHEMA.md` (created)

- **What Commands Were Used**:
  - `npm install react-router-dom react-hook-form @hookform/resolvers zod react-hot-toast date-fns` (client)
  - `npx prisma format` (server)
  - `npx prisma generate` (server)
  - `npm run build` (server)
  - `npm run build` (client)
  - `npm run dev` (server smoke run)
  - `npm run dev` (client smoke run)

- **What Was Tested**:
  - Backend TypeScript compilation (`npm run build` in server) passed.
  - Frontend TypeScript + Vite production build (`npm run build` in client) passed.
  - Backend startup confirmed with health endpoint route available.
  - Frontend startup confirmed with Vite dev server running.

- **What Still Remains Optional**:
  - Replace temporary header-based auth bridge with real JWT/cookie authentication.
  - Add Prisma seed script and demo dataset.
  - Add automated integration tests for role-protected flows.
  - Add deployment automation (CI pipeline) for build + migrate + deploy sequence.

## Phase 5: Consistency and UX Safety Pass

- **What Was Improved**:
  - Added route param validation for verify-entry and verify-exit endpoints.
  - Added safer backend startup behavior (port-in-use handling, graceful shutdown signals).
  - Reduced production error detail leakage in centralized error handler.
  - Added lightweight audit log helper for outside-book create/verify actions.
  - Added reusable frontend loading/error/empty feedback components with retry support.
  - Added dedicated unauthorized page and routed RBAC denials there.
  - Added sidebar sign-out action to keep session handling explicit.

- **What Files Were Created or Updated**:
  - `iict-library-server/src/index.ts` (updated)
  - `iict-library-server/src/middleware/error.middleware.ts` (updated)
  - `iict-library-server/src/routes/outsideBook.routes.ts` (updated)
  - `iict-library-server/src/validators/outsideBook.validator.ts` (updated)
  - `iict-library-server/src/services/outsideBook.service.ts` (updated)
  - `iict-library-server/src/utils/auditLog.ts` (created)
  - `iict-library-client/src/components/shared/FeedbackState.tsx` (created)
  - `iict-library-client/src/pages/admin/ActiveOutsideBookLogPage.tsx` (updated)
  - `iict-library-client/src/pages/student/MyOutsideBooksPage.tsx` (updated)
  - `iict-library-client/src/pages/UnauthorizedPage.tsx` (created)
  - `iict-library-client/src/routes/ProtectedRoute.tsx` (updated)
  - `iict-library-client/src/routes/AppRouter.tsx` (updated)
  - `iict-library-client/src/layouts/Sidebar.tsx` (updated)
  - `README.md` (updated)
  - `DEVELOPMENT_PROCESS.md` (updated)

- **What Commands Were Used**:
  - `npm run build` (server)
  - `npm run build` (client)

- **What Was Tested**:
  - Backend TypeScript build passed after route/validation/startup updates.
  - Frontend TypeScript + Vite production build passed after UX and RBAC updates.
  - Unauthorized routing path behavior validated in route guard logic.

- **What Still Remains Optional**:
  - Persist audit events to database instead of console output.
  - Add dedicated unauthorized unit/integration test coverage.
  - Add pagination/filtering utilities for future large outside-book datasets.
