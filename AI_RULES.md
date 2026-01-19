# AI Rules for this Project

This document outlines the core technologies and best practices for developing this application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen tech stack.

## Tech Stack Overview

*   **Frontend Framework:** React.js with TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (utility-first CSS framework)
*   **UI Components:** shadcn/ui (built on Radix UI and Tailwind CSS)
*   **Routing:** React Router DOM
*   **State Management:** React's built-in hooks (`useState`, `useContext`) for local state, and Tanstack Query for server state management.
*   **Backend & Database:** Supabase (PostgreSQL database, authentication, and Edge Functions)
*   **Form Management:** React Hook Form with Zod for schema validation
*   **Icons:** Lucide React
*   **Notifications:** Sonner for toast notifications
*   **PDF Generation:** jspdf for client-side PDF generation
*   **Scheduling:** React Calendly for embedding Calendly widgets

## Library Usage Guidelines

To maintain a clean and efficient codebase, please follow these guidelines for library usage:

*   **UI Components:**
    *   **Always** prioritize `shadcn/ui` components for all UI elements (e.g., `Button`, `Input`, `Dialog`, `Tabs`).
    *   If a specific component is not available in `shadcn/ui`, create a new, small, and focused component in `src/components/` using Tailwind CSS for styling. Do not modify existing `shadcn/ui` component files.
*   **Styling:**
    *   **Exclusively** use Tailwind CSS classes for all styling. Avoid inline styles or custom CSS files unless absolutely necessary for global styles (e.g., `index.css`).
    *   Ensure designs are responsive by utilizing Tailwind's responsive utility classes.
*   **Routing:**
    *   Use `react-router-dom` for all client-side navigation. Define routes in `src/App.tsx`.
*   **State Management:**
    *   For local component state, use React's `useState` and `useReducer`.
    *   For global application state that doesn't involve server data, use React's `useContext`.
    *   For fetching, caching, and synchronizing server state, use `@tanstack/react-query`.
*   **Forms:**
    *   Implement all forms using `react-hook-form` for robust validation and state management.
    *   Use `zod` for defining form schemas and validation rules.
*   **Icons:**
    *   Use icons from the `lucide-react` library.
*   **Notifications:**
    *   For user feedback and notifications, use `sonner` (e.g., `toast.success()`, `toast.error()`).
*   **Backend Interactions:**
    *   Interact with the Supabase database and authentication services using the `@supabase/supabase-js` client.
    *   For server-side logic, use Supabase Edge Functions (written in Deno/TypeScript).
*   **PDF Generation:**
    *   Use `jspdf` for generating PDF documents on the client-side.
*   **Scheduling:**
    *   Use `react-calendly` for embedding Calendly scheduling functionalities.

By adhering to these rules, we ensure a consistent, high-quality, and maintainable application.