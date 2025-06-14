# Globetrotter Travel Booking Application

## Overview

This is a comprehensive travel booking platform built as a full-stack web application. The system provides users with an immersive experience for discovering and booking luxury travel destinations worldwide, featuring a 3D interactive globe, detailed itineraries, payment processing via Stripe, and administrative management capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with custom design system featuring glassmorphism effects
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds
- **3D Graphics**: Three.js for interactive Earth globe visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Session-based authentication with OpenID Connect (Replit Auth)
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

### Data Storage Solutions
- **Primary Database**: PostgreSQL with the following key tables:
  - `users` - User account management with role-based access
  - `destinations` - Travel destination information with rich metadata
  - `bookings` - Booking records with detailed travel information
  - `reviews` - User reviews and ratings for destinations
  - `activity_logs` - System activity tracking for analytics
  - `sessions` - Session management for authentication

### Authentication and Authorization Mechanisms
- **Primary Auth**: OpenID Connect integration with Replit's authentication system
- **Fallback Auth**: Username/password authentication with bcrypt hashing
- **Session Management**: Secure HTTP-only cookies with PostgreSQL session storage
- **Role-Based Access**: User roles (user, admin, travel_agent, support) with appropriate permissions
- **Route Protection**: Authentication middleware protecting sensitive endpoints

## Key Components

### User Interface Components
- **Interactive Globe**: Three.js-powered 3D Earth with destination markers
- **Responsive Design**: Mobile-first approach with glassmorphism aesthetic
- **Component Library**: Comprehensive UI components built on Radix UI
- **Performance Optimizations**: Image lazy loading, code splitting, and caching strategies

### Business Logic Components
- **Booking System**: Complete booking workflow with date selection, guest management, and upgrades
- **Payment Processing**: Stripe integration for secure payment handling
- **Review System**: User-generated content with ratings and comments
- **Administrative Dashboard**: Comprehensive management interface for admins

### Data Management Components
- **Type-Safe Database**: Drizzle ORM with Zod schema validation
- **Query Optimization**: Efficient database queries with proper indexing
- **Image Management**: URL validation and duplicate prevention system
- **Analytics Tracking**: Activity logging and performance monitoring

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth or username/password
2. **Destination Discovery**: Browse destinations via interactive globe or traditional listing
3. **Booking Process**: Select dates, guests, upgrades, and proceed to payment
4. **Payment Processing**: Secure payment via Stripe with booking confirmation
5. **Trip Management**: Users can view and manage their bookings
6. **Administrative Oversight**: Admins manage destinations, users, and bookings via dashboard

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon Database
- **drizzle-orm**: Type-safe ORM for database operations
- **@stripe/stripe-js**: Payment processing integration
- **three**: 3D graphics library for globe visualization
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing library

### Development Tools
- **TypeScript**: Type safety across the entire application
- **Vite**: Fast build tool with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

### Authentication & Security
- **openid-client**: OpenID Connect authentication
- **bcryptjs**: Password hashing for fallback authentication
- **express-session**: Session management middleware

## Deployment Strategy

### Development Environment
- **Platform**: Replit with integrated development environment
- **Database**: Neon Database (serverless PostgreSQL)
- **Hot Reloading**: Vite development server with live updates
- **Environment Variables**: Secure storage of API keys and database credentials

### Production Build
- **Frontend**: Static assets built with Vite and served via Express
- **Backend**: Node.js application with optimized bundles
- **Database Migrations**: Drizzle migrations for schema management
- **Deployment Target**: Replit's autoscale deployment infrastructure

### Performance Considerations
- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: Optimized Unsplash images with proper sizing
- **Caching**: Browser caching for static assets and API responses
- **Bundle Optimization**: Tree shaking and minification for production builds

## Changelog
- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.