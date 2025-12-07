# Habits Tracker Dashboard

## Overview

A habit tracking web application that allows users to monitor and visualize their daily habits. The application features a clean, productivity-focused interface inspired by Linear and Notion design patterns, with an emphasis on immediate action and data clarity. Users can create habits, track daily completions, and view statistics through charts and visualizations.

The project is built as a full-stack TypeScript application with a React frontend and Express backend, currently featuring a vanilla JavaScript implementation in the public directory alongside a React-based architecture being developed with shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Dual Implementation Strategy:**
- **Legacy Implementation**: Vanilla JavaScript application located in `client/public/` with separate modules for core functionality (`app.js`) and charts (`charts.js`). Uses Chart.js for data visualization and manual DOM manipulation.
- **Modern Implementation**: React-based SPA using TypeScript, configured for shadcn/ui component library with Radix UI primitives. Features Wouter for routing and TanStack Query for state management.

**UI Component System:**
- Utilizes shadcn/ui with "new-york" style variant
- Tailwind CSS for styling with custom design tokens for spacing, colors, and typography
- Component library includes 40+ pre-built Radix UI components (dialogs, dropdowns, forms, charts, etc.)
- Custom theme system with CSS variables for light/dark mode support

**Design System:**
- Typography: Inter or DM Sans font families with defined size scale (12px-32px)
- Spacing: Tailwind-based units (2, 4, 6, 8, 12, 16, 20, 24)
- Layout: Responsive grid with 1200px max-width container, 70/30 split for main content/sidebar
- Color system: HSL-based with separate tokens for backgrounds, foregrounds, borders, and state variants

**State Management:**
- TanStack React Query for server state and caching
- Custom query client with infinite stale time and disabled auto-refetch
- Client-side storage implementation in `server/storage.ts` (in-memory Map structure)

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Dual-mode operation: development (Vite middleware) and production (static serving)
- Environment-aware build process with separate entry points (`index-dev.ts`, `index-prod.ts`)

**Development vs Production:**
- **Development**: Vite dev server with HMR, middleware mode, runtime error overlay, Replit-specific plugins (cartographer, dev banner)
- **Production**: Optimized build with esbuild bundling (ESM format, external packages)

**Request Handling:**
- JSON and URL-encoded body parsing with raw body preservation
- Request logging middleware with duration tracking
- Path-based routing distinction for API endpoints

**Session & Storage:**
- In-memory storage implementation using Map-based data structures
- User management with UUID generation
- Interface-driven storage abstraction for future database integration

### Data Storage

**Database Setup:**
- PostgreSQL configured via Drizzle ORM
- Connection through Neon serverless driver (@neondatabase/serverless)
- Schema defined in `shared/schema.ts` with Zod validation integration

**Database Schema:**
- Users table with UUID primary keys, unique usernames, and password storage
- Drizzle-zod integration for type-safe schema validation
- Migration support through Drizzle Kit with `db:push` command

**Data Validation:**
- Zod schemas generated from Drizzle table definitions
- Type inference for insert and select operations
- Shared schema accessible across client and server

### External Dependencies

**UI & Styling:**
- Radix UI suite (20+ component libraries for accessible primitives)
- Tailwind CSS with PostCSS for utility-first styling
- class-variance-authority for component variant management
- tailwind-merge + clsx for conditional class composition

**Data Visualization:**
- Chart.js 4.4.0 for statistical charts and graphs
- Recharts (via shadcn chart components) for React-based visualizations

**Development Tooling:**
- Vite for build tooling and dev server
- TypeScript with strict mode enabled
- ESBuild for production bundling
- Replit-specific plugins for development experience

**Database & ORM:**
- Drizzle ORM for type-safe database queries
- @neondatabase/serverless for PostgreSQL connectivity
- Drizzle Kit for schema migrations

**Form Management:**
- React Hook Form for form state
- @hookform/resolvers for validation integration
- Zod for runtime validation

**Routing & Data Fetching:**
- Wouter for client-side routing
- TanStack React Query v5 for async state management
- Custom fetch wrapper with credential handling

**Date Management:**
- date-fns for date manipulation and formatting
- react-day-picker for calendar components

**Third-Party Services:**
- Google Fonts (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)
- Font Awesome 6.5.1 for icon library (legacy implementation)

**Session Management:**
- connect-pg-simple for PostgreSQL session store
- Configuration ready for session persistence