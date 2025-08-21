# Overview

This is Bookli.cz - a Czech-localized booking system SaaS MVP designed for small businesses to streamline service scheduling and customer management. The application features a complete landing page showcasing the service, followed by a comprehensive admin booking system with flexible payment processing. The system includes both public-facing marketing pages and a full-featured reservation management dashboard with configurable payment modes (OFF/OPTIONAL/REQUIRED) and Stripe integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server with hot module replacement
- **Wouter** for client-side routing instead of React Router
- **TailwindCSS** with **shadcn/ui** component library for styling
- **Tanstack React Query** for server state management and caching
- **React Hook Form** with **Zod** validation for form handling
- **Luxon** for date/time manipulation

## Backend Architecture
- **Fastify** web framework instead of Express for better performance
- **Node.js** with TypeScript and ES modules
- **Drizzle ORM** for database operations with type-safe queries
- **Neon Database** (PostgreSQL) for data persistence
- **Argon2** for password hashing
- **JWT** tokens stored in httpOnly cookies for authentication
- **Nodemailer** for email notifications

## Database Design
The PostgreSQL schema includes:
- **Organizations** - Multi-tenant architecture with organization isolation
- **Users** - Admin users tied to organizations
- **Services** - Bookable services with duration and pricing
- **Availability Templates** - Weekly recurring availability patterns
- **Blackouts** - Temporary unavailable periods
- **Bookings** - Customer reservations with status tracking

## Authentication & Security
- Cookie-based authentication using httpOnly cookies
- JWT tokens for session management
- Rate limiting on public booking endpoints
- CORS configuration for cross-origin requests
- Password hashing with Argon2
- Organization-based data isolation

## API Structure
RESTful API with prefix `/api`:
- **Auth routes** - Registration, login, logout (moved to `/app/auth/*`)
- **Organization management** - Settings and configuration
- **Service management** - CRUD operations for services with payment modes
- **Availability management** - Weekly templates and blackout periods  
- **Booking management** - Admin booking oversight
- **Public routes** - Customer-facing booking interface
- **Payment routes** - Stripe integration for optional/required payments

## Route Structure
- **Landing page** (`/`) - Marketing site with pricing, features, and FAQ
- **Admin routes** (`/app/*`) - Dashboard, services, bookings, settings
- **Auth routes** (`/app/auth/*`) - Login and registration
- **Static pages** (`/docs`, `/support`) - Documentation and support
- **Public booking** (`/:orgSlug`) - Customer booking interface

## Time Slot Generation
Dynamic time slot calculation based on:
- Weekly availability templates
- Service duration requirements
- Blackout periods
- Existing bookings
- Organization timezone settings

# External Dependencies

- **Neon Database** - Serverless PostgreSQL database hosting
- **SMTP Service** - Email delivery for booking confirmations (configurable)
- **shadcn/ui** - React component library built on Radix UI primitives
- **Radix UI** - Unstyled, accessible UI components
- **Replit** - Development environment with specialized plugins and banner integration