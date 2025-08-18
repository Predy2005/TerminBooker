# Overview

This is a reservation management system built with a modern full-stack architecture. The application allows organizations to manage their services, availability schedules, and customer bookings through both admin and public interfaces. It features a complete booking flow where customers can view available services, select time slots, and make reservations, while administrators can manage their organization's settings, services, availability templates, and view/manage all bookings.

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
- **Auth routes** - Registration, login, logout
- **Organization management** - Settings and configuration
- **Service management** - CRUD operations for services
- **Availability management** - Weekly templates and blackout periods
- **Booking management** - Admin booking oversight
- **Public routes** - Customer-facing booking interface

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