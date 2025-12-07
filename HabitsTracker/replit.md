# Habits Tracker Dashboard

## Overview

A habit tracking web application that allows users to monitor and visualize their daily habits. The application features a clean, productivity-focused interface inspired by Linear and Notion design patterns. Users can create habits, mark them as complete, and view statistics and visualizations of their progress over time.

The project is built as a full-stack TypeScript application with a React frontend and Express backend. It currently contains both a legacy vanilla JavaScript implementation (in `client/public/`) and a modern React-based implementation (in `client/src/`) that is being developed.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Dual Implementation Strategy:**
The application currently maintains two parallel frontend implementations:
- **Legacy Implementation**: Located in `client/public/`, this is a fully functional vanilla JavaScript application with separate modules for core functionality (`app.js`), charting (`charts.js`), and calendar heatmap visualization (`heatmap.js`). Uses Chart.js for data visualization and localStorage for persistence.
- **Modern Implementation**: React-based single-page application in `client/src/` using TypeScript, currently in development with routing scaffolding but no habit tracking features implemented yet.

**UI Component System:**
The modern React implementation is configured to use shadcn/ui with the "new-york" style variant, built on Radix UI primitives. The component library includes 40+ pre-built components covering forms, dialogs, data visualization, navigation, and layout. Tailwind CSS provides styling with a custom design system featuring CSS variables for theming.

**Design System:**
Follows a comprehensive design system documented in `design_guidelines.md`:
- Typography: Inter or DM Sans fonts with a defined scale from 12px to 32px
- Spacing: Tailwind-based units (2, 4, 6, 8, 12, 16, 20, 24)
- Layout: Responsive grid with 1200px max-width container, 70/30 split for main content/sidebar on desktop
- Color system: HSL-based tokens with separate values for light/dark modes, supporting backgrounds, foregrounds, borders, and interactive states

**State Management:**
- TanStack React Query configured for server state management with infinite stale time and disabled auto-refetch
- Query client provides standardized API request handling with automatic error handling
- Legacy implementation uses in-memory state with localStorage persistence

**Routing:**
Uses Wouter for client-side routing in the React implementation, with a fallback to a 404 page for undefined routes.

### Backend Architecture

**Server Framework:**
Express.js application with TypeScript, featuring dual-mode operation:
- **Development Mode**: Integrates Vite dev server with HMR, middleware mode, and Replit-specific development plugins (cartographer for code navigation, dev banner)
- **Production Mode**: Serves pre-built static files from the `dist/public` directory with SPA fallback routing

**Build System:**
- Frontend: Vite with React plugin, builds to `dist/public`
- Backend: esbuild bundles server code to ESM format with external packages
- Separate entry points for development (`index-dev.ts`) and production (`index-prod.ts`)

**Request Processing:**
- JSON and URL-encoded body parsing with raw body preservation for webhook compatibility
- Request logging middleware that tracks API endpoint duration and response data
- Static file serving for both legacy vanilla JS app and modern React build

**Data Layer:**
Currently implements a minimal database storage interface (`IStorage`) with methods for user CRUD operations. The storage implementation uses Drizzle ORM with PostgreSQL (via node-postgres and Neon serverless driver). Schema includes a users table with username/password authentication fields.

### External Dependencies

**Database:**
- **Drizzle ORM** (v0.39.1): Type-safe ORM layer with Zod schema validation
- **PostgreSQL**: Database dialect configured through `@neondatabase/serverless` driver
- **Connection Pooling**: node-postgres pool for connection management
- Database configuration expects `DATABASE_URL` environment variable
- Migrations stored in `./migrations` directory

**UI Component Libraries:**
- **Radix UI**: Comprehensive set of unstyled, accessible component primitives (accordion, dialog, dropdown, popover, select, slider, tabs, toast, tooltip, etc.)
- **shadcn/ui**: Component layer built on Radix UI with Tailwind styling
- **Chart.js** (v4.4.0): Data visualization library used in legacy implementation
- **Embla Carousel React**: Carousel/slider functionality
- **cmdk**: Command menu component
- **Lucide React**: Icon library

**Form Handling:**
- **React Hook Form**: Form state management and validation
- **@hookform/resolvers**: Validation resolver for Zod schemas
- **Zod**: Schema validation for forms and database operations

**Styling:**
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Autoprefixer**: Automatic vendor prefix generation
- **class-variance-authority**: Variant-based component styling
- **clsx** and **tailwind-merge**: Class name utilities

**Date Handling:**
- **date-fns** (v3.6.0): Date manipulation and formatting utilities

**Development Tools:**
- **Vite**: Build tool and dev server with HMR
- **@vitejs/plugin-react**: React Fast Refresh support
- **@replit/vite-plugin-runtime-error-modal**: Runtime error overlay for development
- **@replit/vite-plugin-cartographer**: Code navigation in Replit environment
- **@replit/vite-plugin-dev-banner**: Development mode indicator
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: Database migration and schema management tools

**Session Management:**
- **connect-pg-simple**: PostgreSQL session store for Express sessions (configured but not yet implemented in current codebase)

**Font Loading:**
The application loads multiple font families from Google Fonts: Architects Daughter, DM Sans, Fira Code, and Geist Mono for various UI elements and code display purposes.