# Phase 1: Project Foundation & Scaffolding

This document outlines the initial setup and foundational work for the IICT Library Management System. The goal of this phase was to establish a clean, scalable, and production-ready architecture for both the frontend and backend applications.

## 1. Project Initialization

- **Version Control:** Initialized a `git` repository to track all changes.
- **Requirements Gathering:** Created a `Requirements Documents` folder and committed the initial set of SRS, ER diagrams, and use case documents.

## 2. Backend Setup (`iict-library-server`)

We established a robust backend using Express.js and TypeScript, focusing on a layered architecture.

### Key Architectural Decisions:

- **Separation of Concerns:** The Express `app` logic (middleware, routes) is separated from the HTTP `server` bootstrap logic. This improves testability.
- **Centralized Configuration:** Environment variables are managed in a single `config` module, loaded via `dotenv`. An `.env.example` file is provided for guidance.
- **Layered Structure:** Created a standard layered architecture to separate responsibilities:
  - `controllers`: Handle incoming requests and responses.
  - `routes`: Define API endpoints and link them to controllers.
  - `services`: Contain the core business logic.
  - `repositories`: Abstract data access logic (to be used with Prisma).
  - `middleware`: For cross-cutting concerns like authentication, logging, and error handling.
- **API Versioning:** All API routes are prefixed with `/api/v1` to allow for future versions without breaking changes.

### Core Features Implemented:

- **Express App Bootstrap:** Created the main `app.ts` file.
- **Server Bootstrap:** Created `index.ts` to start the server.
- **Essential Middleware:**
  - `helmet`: For securing HTTP headers.
  - `cors`: To handle cross-origin requests from the frontend.
  - `cookie-parser`: For parsing JWT cookies later.
  - `morgan`: For detailed HTTP request logging.
- **Error Handling:**
  - A `notFoundHandler` to catch requests to non-existent routes.
  - A centralized `errorHandler` to format and send error responses consistently.
  - A custom `AppError` class for handling operational errors.
- **Health Check:** A `/api/v1/health` endpoint was created to easily verify that the server is running.
- **Database ORM:** `Prisma` was installed and configured with a basic `User` model and a connection to a PostgreSQL database.

## 3. Frontend Setup (`iict-library-client`)

We scaffolded the client application using Vite, React, and TypeScript, with a strong focus on a reusable component-based architecture.

### Key Architectural Decisions:

- **Modern Tooling:** Used Vite for a fast development experience.
- **Strong Typing:** TypeScript is enforced throughout the application.
- **Component-Based UI:** The structure is designed around reusable components.
- **Styling:** Tailwind CSS was chosen for a utility-first styling approach. Theme colors and fonts are defined in `tailwind.config.js` for consistency.
- **Routing:** `React Router` is used to manage all application routes.

### Core Features Implemented:

- **Project Scaffolding:** Created the project using `Vite` with the `react-ts` template.
- **Folder Structure:** Established a feature-based folder structure (`components`, `pages`, `layouts`, `routes`, `hooks`, etc.) for scalability.
- **Layout System:**
  - `PublicLayout`: A wrapper for pages accessible to unauthenticated users.
  - `DashboardLayout`: A primary layout for authenticated users, featuring a persistent `Sidebar` and a top `Navbar`.
- **Routing Structure:**
  - Implemented `AppRouter.tsx` to define all public and protected routes.
  - Created placeholder pages (`HomePage`, `LoginPage`, `DashboardHomePage`, `NotFoundPage`) to make the application navigable.
- **Reusable UI Components:**
  - Built a foundational set of shared components in `src/components/shared`, including `Button`, `Card`, `Input`, `Badge`, and `Table`.
  - These components are styled according to the project's theme and can be used across the entire application.
- **Styling & Theme:**
  - Configured Tailwind CSS with the project's official color palette (`dark-brown`, `warm-taupe`, etc.).
  - Set up a global stylesheet (`index.css`) to import a professional font (`Inter`) and apply base styles.

This foundational setup ensures that both the client and server are ready for the incremental development of features as we move into the next phases.
