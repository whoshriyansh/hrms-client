# HRMS Lite - Frontend Client

A modern, responsive Human Resource Management System (HRMS) frontend built with **Next.js**, **React**, and **TypeScript**. This client application provides an intuitive interface for managing employees, tracking attendance, and handling user authentication with role-based access control. The project implements the specifications outlined in the [Project Documentation](https://docs.google.com/document/d/1Bd-x8gzSIWXo7YLrViAszvmUZX3czDD55vBbib2aEtM/edit?tab=t.0).

## Features

### Backend-Integrated Features

- **User Authentication** — Secure login/logout with JWT token-based authentication
- **Employee Management** — View, search, and filter employee records (admin only)
- **Attendance Tracking** — Mark daily attendance, view attendance history with date range filters
- **Admin Dashboard** — Comprehensive admin panel for user and attendance management
- **Role-Based Access Control** — Different UI/workflows for admin, manager, and employee roles

### Frontend Features

- **Responsive Design** — Mobile-first approach using Tailwind CSS and Shadcn/UI components
- **Modern UI Components** — Reusable component library including modals, forms, tables, and navigation
- **Form Validation** — Client-side validation using Zod schemas for data integrity
- **Next.js App Router** — Latest Next.js 14+ with server and client components
- **Icons & Customization** — Lucide React icons and theme customization support
- **Loading States & Skeletons** — Enhanced UX with skeleton screens and loading indicators
- **Toast Notifications** — Sonner for elegant toast notifications and feedback

## Run Locally

Clone the project

```bash
  git clone https://github.com/whoshriyansh/hrms-client.git
```

Go to the project directory

```bash
  cd hrms-client
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

## AI Usage & Project Methodology

I leveraged **AI assistance strategically** in this project to demonstrate modern development practices and efficiency:

### 🤖 AI-Assisted Components

- **UI Component Library** — The base Shadcn/UI components (forms, tables, dialogs, modals, etc.) were generated using AI to ensure consistency and best practices
- **Component Integration** — AI helped in creating styled, accessible, and responsive component wrappers

### 👨‍💻 Manually Built (Without AI)

- **Authentication Services** — Complete JWT token management and API authentication logic
- **Data Schemas** — Zod validation schemas for attendance, user, and authentication data
- **Axios Configuration** — Custom API instance setup with interceptors and error handling
- **Business Logic** — Dashboard workflows, attendance marking logic, and user filtering
- **State Management** — Auth context and custom hooks for application state
- **API Integrations** — Service layer for all API endpoints and data transformations

This approach showcases **practical AI usage** — using AI to accelerate repetitive UI work while maintaining full control over critical business logic and architecture.

## Tech Stack

**Frontend:**

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Zod (Schema Validation)
- Axios

**Styling & Components:**

- Tailwind CSS
- Radix UI (via Shadcn/UI)
- Lucide React Icons
- Sonner (Toast Notifications)

## Best Practices

The project follows industry best practices including:

- ✅ Modular component architecture
- ✅ Type-safe validation with Zod schemas
- ✅ Clean service layer for API communication
- ✅ Proper input validation and error handling
- ✅ Responsive and accessible UI design
- ✅ Security considerations (JWT auth, secure token storage)
- ✅ RESTful API consumption principles
- ✅ Environment-based configuration

**Check out the live deployment:**

[Live Link](https://hrms-seven-murex.vercel.app/)
[Backend Link](https://hrms-server-eight.vercel.app/)

## 🔗 Links

[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://whoshriyansh.netlify.app/)

[![linkedin](https://img.shields.io/badge/linkedin-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/whoshriyansh/)
