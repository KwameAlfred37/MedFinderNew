# Overview

This is a full-stack web application called MedFinder, a medicine discovery and pharmacy locator platform. The application helps users find medications, locate nearby pharmacies, check medicine availability, and interact with an AI assistant for health-related queries.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **Styling**: Tailwind CSS with custom glass morphism design system
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **WebSocket**: Real-time chat functionality

## Key Components

### Database Schema
- **Users**: User profiles and authentication data
- **Medicines**: Medication information (name, category, dosage, manufacturer)
- **Pharmacies**: Pharmacy details (name, location, contact, hours)
- **Medicine Inventory**: Stock levels at different pharmacies
- **Chat Messages**: AI assistant conversation history
- **User Searches**: Search history tracking
- **Sessions**: Authentication session storage

### API Structure
- RESTful API endpoints under `/api`
- Authentication routes (`/api/auth/*`)
- Medicine search and details (`/api/medicines/*`)
- Pharmacy search and inventory (`/api/pharmacies/*`)
- Chat functionality (`/api/chat/*`)
- WebSocket endpoint for real-time messaging

### Frontend Pages
- **Landing**: Authentication and app introduction
- **Home**: Main dashboard with search functionality
- **Search Results**: Medicine and pharmacy search results
- **Chat**: AI assistant interaction interface
- **Profile**: User settings and search history

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Search Flow**: User searches trigger API calls to find medicines/pharmacies
3. **Medicine Discovery**: Search results show availability across nearby pharmacies
4. **Chat Flow**: Real-time WebSocket communication with AI assistant
5. **Location Services**: Geolocation integration for proximity-based pharmacy search

## External Dependencies

### Core Dependencies
- **Database**: `@neondatabase/serverless` for PostgreSQL connection
- **ORM**: `drizzle-orm` with `drizzle-kit` for schema management
- **UI**: Comprehensive Radix UI component suite
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: `date-fns` for date manipulation
- **Authentication**: `passport` with OpenID Connect strategy

### Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Styling**: Tailwind CSS with PostCSS
- **Code Quality**: TypeScript strict mode configuration
- **Development**: Hot module replacement and error overlay

## Deployment Strategy

### Production Build
- Frontend built to `dist/public` directory
- Backend transpiled with esbuild to `dist/index.js`
- Static file serving from Express server

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Session security with `SESSION_SECRET`
- Replit-specific configurations for auth and domains
- Development/production environment detection

### Database Management
- Schema migrations in `./migrations` directory
- Database push command: `npm run db:push`
- Automatic table creation for sessions and core entities

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with shared schema between client/server
2. **TypeScript Throughout**: End-to-end type safety from database to UI
3. **Glass Morphism Design**: Modern UI with backdrop blur and gradient effects
4. **Real-time Features**: WebSocket integration for chat functionality
5. **Progressive Enhancement**: Works without JavaScript for basic functionality
6. **Mobile-First**: Responsive design optimized for mobile devices
7. **Serverless Ready**: Neon Database for serverless deployment compatibility