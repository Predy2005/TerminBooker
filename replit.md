# Overview

This is Bookli.cz - a Czech-localized booking system SaaS MVP designed for small businesses to streamline service scheduling and customer management. The application features a complete landing page showcasing the service, followed by a comprehensive admin booking system with flexible payment processing. The system includes both public-facing marketing pages and a full-featured reservation management dashboard with configurable payment modes (OFF/OPTIONAL/REQUIRED) and Stripe Connect integration.

The project now includes **dual backend implementations**:
1. **Node.js/Fastify** - Original implementation with Express-style routing
2. **Symfony REST API** - Complete PHP backend with modern architecture, JWT authentication, Doctrine ORM, and comprehensive Stripe Connect integration

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

### Node.js Backend (Original)
- **Fastify** web framework instead of Express for better performance
- **Node.js** with TypeScript and ES modules
- **Drizzle ORM** for database operations with type-safe queries
- **Neon Database** (PostgreSQL) for data persistence
- **Argon2** for password hashing
- **JWT** tokens stored in httpOnly cookies for authentication
- **Nodemailer** for email notifications

### Symfony REST API Backend (Alternative)
- **Symfony 6.2** framework with modern PHP 8.1+
- **Doctrine ORM** with migrations and entity management
- **PostgreSQL** database with comprehensive schema
- **JWT Authentication** with Lexik JWT bundle
- **Stripe Connect** integration for Express accounts
- **API-first design** with JSON responses
- **CORS support** for frontend integration
- **Comprehensive validation** and error handling

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
- **Stripe Connect** - Payment processing with Express accounts for organizations
- **SMTP Service** - Email delivery for booking confirmations (configurable)
- **shadcn/ui** - React component library built on Radix UI primitives
- **Radix UI** - Unstyled, accessible UI components
- **Replit** - Development environment with specialized plugins and banner integration

# Recent Changes (August 21, 2025)

## Completed Symfony REST API Implementation
- **Complete entity structure** - Organization, User, Service, Booking, AvailabilityTemplate, Blackout entities with relationships
- **Repository layer** - Custom queries for business logic and data access
- **REST controllers** - AuthController, OrganizationController, ServiceController, BillingController
- **JWT authentication** - Token-based API security with Lexik bundle
- **Stripe Connect integration** - Express account creation, onboarding, webhook handling
- **Database migrations** - Doctrine migration for complete schema setup
- **CORS configuration** - Cross-origin support for frontend integration
- **API documentation** - Comprehensive README with endpoint descriptions

## Dual Backend Support
- **Node.js/Fastify backend** - Original implementation continues to work
- **Symfony REST API** - Alternative backend with same database schema
- **Shared database** - Both backends can operate on the same PostgreSQL database
- **Consistent API structure** - Similar endpoints and data formats between both backends