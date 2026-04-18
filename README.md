# IICT Library Management System

This is a monorepo for the IICT Library Management System, containing the client and server applications.

## Project Structure

- `iict-library-client`: Frontend application built with React, TypeScript, and Vite.
- `iict-library-server`: Backend application built with Node.js, Express, and Prisma.
- `Requirements Documents`: Contains the requirements for the project.

## Tech Stack

### Backend

- Node.js
- Express
- Prisma
- MariaDB

### Frontend

- React
- TypeScript
- Vite
- Redux Toolkit (RTK Query)
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Docker (for MariaDB)

### Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd iict-library-management-system
    ```

2.  **Install dependencies for the server:**

    ```bash
    cd iict-library-server
    npm install
    ```

3.  **Install dependencies for the client:**

    ```bash
    cd ../iict-library-client
    npm install
    ```

4.  **Setup the database:**
    - Create a `.env` file in the `iict-library-server` directory.
    - Add the `DATABASE_URL` environment variable:
      ```
      DATABASE_URL="mysql://user:password@localhost:3306/iict_library"
      ```
    - Run the Prisma migrations:
      ```bash
      npx prisma migrate dev
      ```

### Running the Application

1.  **Start the server:**

    ```bash
    cd iict-library-server
    npm run dev
    ```

2.  **Start the client:**
    ```bash
    cd ../iict-library-client
    npm run dev
    ```

The client will be available at `http://localhost:5173` and the server at `http://localhost:5000`.
