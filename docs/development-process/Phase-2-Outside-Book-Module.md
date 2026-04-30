# IICT Library Management System - Development Process

This document outlines the development process and key decisions made during the creation of the IICT Library Management System.

## Prompt 2: Outside Book Module Implementation

### Goal
Implement the "Outside Book" module, allowing students to bring their own books into the library and have them tracked by the system. This involves creating a record upon entry and verifying the exit.

### Backend Implementation (`iict-library-server`)

1.  **Database Schema (`prisma/schema.prisma`):**
    *   An `OutsideBookEntry` model was added to the schema.
    *   Fields include `id`, `studentId`, `bookTitle`, `bookAuthor`, `entryTime`, `exitTime`, `status` (enum: `ENTERED`, `EXITED`), `verifiedBy` (admin relation), `createdAt`, and `updatedAt`.
    *   A `status` index was added for efficient querying of active entries.

2.  **Repository (`src/repositories/outsideBook.repository.ts`):**
    *   Created a repository to handle all direct database interactions for the `OutsideBookEntry` model.
    *   Methods implemented: `createEntry`, `findActiveEntries`, `findMyEntries`, `verifyEntry`, `verifyExit`.

3.  **Service (`src/services/outsideBook.service.ts`):**
    *   Created a service layer to contain the business logic.
    *   It uses the repository to perform operations and includes logic for checking user roles and entry status before performing actions.

4.  **Controller (`src/controllers/outsideBook.controller.ts`):**
    *   Developed a controller to handle incoming HTTP requests.
    *   It validates request data, calls the appropriate service methods, and formats the HTTP response.
    *   Includes handlers for `createOutsideBookEntry`, `getActiveOutsideBookEntries`, `getMyOutsideBookEntries`, `verifyOutsideBookEntry`, and `verifyOutsideBookExit`.

5.  **Routes (`src/routes/outsideBook.routes.ts`):**
    *   Defined the API endpoints for the module.
    *   Routes are protected using `protect` middleware to ensure authentication.
    *   Role-based access control is enforced using `restrictTo` middleware (e.g., only admins can verify entries/exits).
    *   Endpoints:
        *   `POST /` - Create a new entry (Student)
        *   `GET /active` - Get all active entries (Admin)
        *   `GET /my-entries` - Get personal entry history (Student)
        *   `PATCH /:id/verify-entry` - Mark an entry as verified (Admin)
        *   `PATCH /:id/verify-exit` - Mark an entry as exited (Admin)

6.  **Main Router (`src/app.ts`):**
    *   The new `outsideBookRouter` was mounted at the `/api/v1/outside-books` path.

### Frontend Implementation (`iict-library-client`)

1.  **API Service (`src/services/outsideBook.api.ts`):**
    *   Created an RTK Query API slice to interact with the backend endpoints.
    *   Defined mutations (`createOutsideBookEntry`, `verifyOutsideBookEntry`, `verifyOutsideBookExit`) and queries (`getActiveOutsideBookEntries`, `getMyOutsideBookEntries`).
    *   These hooks provide automatic caching, loading state management, and data fetching.

2.  **Entry Form Component (`src/components/outside-book/OutsideBookEntryForm.tsx`):**
    *   A reusable React Hook Form component for creating a new outside book entry.
    *   Handles form state, validation, and submission by calling the `createOutsideBookEntry` mutation.
    *   Provides user feedback with `react-hot-toast`.

3.  **Student Page (`src/pages/student/MyOutsideBooksPage.tsx`):**
    *   A new page for students to view their personal history of outside book entries.
    *   Uses the `useGetMyOutsideBookEntriesQuery` hook to fetch data.
    *   Displays the entries in a formatted table, showing book details and entry/exit status.

4.  **Admin Page (`src/pages/admin/ActiveOutsideBookLogPage.tsx`):**
    *   A new page for administrators to manage currently active book entries.
    *   Uses the `useGetActiveOutsideBookEntriesQuery` hook.
    *   Displays a table of active entries with buttons to "Verify Entry" and "Verify Exit".
    *   These buttons trigger the corresponding mutations from the API service.

5.  **Routing (`src/routes/AppRouter.tsx`):**
    *   Created the main router file for the application.
    *   Added the new pages (`MyOutsideBooksPage`, `ActiveOutsideBookLogPage`, and the entry form) as protected routes.
    *   Routing is configured to only allow access based on user roles (e.g., `STUDENT` or `ADMIN`).

6.  **Sidebar Navigation (`src/layouts/Sidebar.tsx`):**
    *   Created the main sidebar component.
    *   Dynamically renders navigation links based on the logged-in user's role.
    *   Added links to "My Outside Books" and "Add Outside Book" for students.
    *   Added a link to "Outside Book Log" for admins.
