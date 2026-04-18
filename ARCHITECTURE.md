# Architecture Overview

## High-Level Structure

The repository is organized as a practical full-stack monorepo:

- iict-library-client: React + TypeScript application for user interface and role-based navigation.
- iict-library-server: Express + Prisma API for business logic and data access.
- Requirements Documents: Requirement and analysis artifacts in PDF format.

## Backend Architecture

### Layering

The server follows a controller -> service -> repository pattern:

- Routes: define endpoints, attach auth/RBAC and validation middleware.
- Controllers: orchestrate request/response and call service methods.
- Services: contain business rules and transition checks.
- Repositories: contain Prisma data access queries.
- Middleware: auth bridge, validation, centralized error handling.
- Utils: shared AppError and API response envelope helpers.

### Current Modules

- Outside Book module
  - Student creates outside book entry.
  - Admin verifies entry and exit transitions.
- Spine Label module
  - Admin generates single-book spine label preview data.

## Frontend Architecture

### State and API

- Redux Toolkit store with auth slice.
- RTK Query API layer for backend integration.
- API base URL from environment variable.
- Temporary session persistence in localStorage for development mode.

### UI Composition

- Routes:
  - Public routes (home/login/register)
  - Protected dashboard routes with role checks
- Layouts:
  - PublicLayout
  - DashboardLayout with Sidebar
- Shared components:
  - Button, Card, Input, Table, Badge
- Feature components/pages:
  - Outside book forms and logs
  - Spine label generator

## Request/Response Contract

API responses are standardized using a common envelope:

- Success: success=true, optional message, data payload
- Error: success=false, message, optional errors list

## Security Notes

- Current backend auth middleware is a temporary bridge based on request headers:
  - x-user-id
  - x-user-role
- RBAC checks are active for route-level authorization.
- Production hardening should replace the temporary bridge with JWT/cookie-based auth.

## Extension Points

- Add full auth module and token/cookie lifecycle.
- Add borrowing/return/reporting modules when implemented.
- Add integration tests and CI deployment pipeline.
