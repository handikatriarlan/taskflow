# Taskflow - Modern Task Management Application

Taskflow is a powerful, yet simple task management application built with React, Node.js, and PostgreSQL. It features a beautiful UI, drag-and-drop functionality, and real-time updates.

## Features

-   🔐 Secure authentication system
-   📱 Responsive design
-   🎯 Intuitive task management
-   🔄 Drag and drop interface
-   📋 Multiple task lists
-   ⚡ Real-time updates
-   🎨 Modern UI/UX

## Tech Stack

-   **Frontend:**

    -   React
    -   TypeScript
    -   Tailwind CSS
    -   DND Kit (drag and drop)
    -   Axios
    -   React Router DOM

-   **Backend:**
    -   Node.js
    -   Express
    -   PostgreSQL (Neon.tech)
    -   Prisma ORM
    -   JWT Authentication
    -   Zod (validation)

## Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/handikatriarlan/taskflow.git
    cd taskflow
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following:

    ```
    DATABASE_URL="your_postgresql_url"
    JWT_SECRET="your_jwt_secret"
    ```

4. Set up the database:

    ```bash
    npx prisma generate
    npx prisma db push
    ```

5. Start the development server:

    ```bash
    npm run dev
    ```

6. In a separate terminal, start the backend server:
    ```bash
    npm run server
    ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

-   [React](https://reactjs.org/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [DND Kit](https://dndkit.com/)
-   [Prisma](https://www.prisma.io/)
-   [Neon.tech](https://neon.tech/)
