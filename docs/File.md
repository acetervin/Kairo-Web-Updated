# Overview

This is a luxury property rental platform for Kenya, featuring premium apartments, villas, and houses across locations like Nairobi, Diani Beach, and other Kenyan destinations. The application allows users to browse properties, view detailed information with categorized image galleries, and make bookings with integrated payment processing via PayPal and M-Pesa.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: Tailwind CSS with custom design tokens and dark/light theme support
- **Animations**: Framer Motion for smooth transitions and interactions

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API endpoints under `/api` prefix
- **File Structure**: Shared schema definitions between client and server for type safety

## Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Connection**: PostgreSQL connection pool with SSL support for production
- **Tables**: Properties, bookings, contact messages, and property images with categorization

## Database Schema Design
- **Properties**: Core property information with JSON fields for amenities and categorized images
- **Bookings**: Guest reservations with payment tracking and status management
- **Contact Messages**: Customer inquiries and property interest tracking
- **Soft Deletes**: Implemented via `is_active` flags and `removed_at` timestamps

## Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Management**: Express session infrastructure prepared but not actively used
- **Security**: Basic request validation and error handling

## API Structure
- **Properties**: CRUD operations with category and featured filtering
- **Bookings**: Creation and management of property reservations
- **Contact**: Message submission and storage
- **Payment Integration**: Separate endpoints for PayPal and M-Pesa processing

# External Dependencies
# Overview

This is a luxury property rental platform for Kenya, featuring premium apartments, villas, and houses across locations like Nairobi, Diani Beach, and other Kenyan destinations. The application allows users to browse properties, view detailed information with categorized image galleries, and make bookings with integrated payment processing.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- Framework: React 18 with TypeScript and Vite for fast development and building
- Routing: Wouter for lightweight client-side routing
- UI Components: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- State Management: TanStack Query (React Query) for server state management and caching
- Styling: Tailwind CSS with custom design tokens and dark/light theme support
- Animations: Framer Motion for smooth transitions and interactions

## Backend Architecture
- Runtime: Node.js with Express.js server
- Language: TypeScript with ES modules
- Database ORM: Drizzle ORM for type-safe database operations
- API Design: RESTful API endpoints under `/api` prefix
- File Structure: Shared schema definitions between client and server for type safety

## Data Storage Solutions
- Primary Database: PostgreSQL (configured for Neon serverless)
- Schema Management: Drizzle Kit for migrations and schema synchronization
- Connection: PostgreSQL connection pool with SSL support for production
- Tables: Properties, bookings, contact messages, and property images with categorization

## Database Schema Design
- Properties: Core property information with JSON fields for amenities and categorized images
- Bookings: Guest reservations with payment tracking and status management
- Contact Messages: Customer inquiries and property interest tracking
- Soft Deletes: Implemented via `is_active` flags and `removed_at` timestamps

## Authentication and Authorization
- Current State: No authentication system implemented
- Session Management: Express session infrastructure prepared but not actively used
- Security: Basic request validation and error handling

## API Structure
- Properties: CRUD operations with category and featured filtering
- Bookings: Creation and management of property reservations
- Contact: Message submission and storage

# External Dependencies

## Payment Processing
- Stripe: Payment processing via Stripe PaymentIntents (recently migrated)

## Database Services
- Neon Database: Serverless PostgreSQL hosting with connection pooling
- Environment Variables: `DATABASE_URL` for connection string management

## UI and Design
- Shadcn/ui: Pre-built accessible component library
- Radix UI: Headless UI primitives for complex interactions
- Tailwind CSS: Utility-first CSS framework with custom theme configuration
- Lucide React: Icon library for consistent iconography

## Communication Services
- WhatsApp Integration: Direct messaging links for customer communication
- Phone Integration: Click-to-call functionality for mobile users

## Image Storage
- Unsplash: External image service for property photos and galleries
- Categorized Images: Organized by room type (Bedroom, Living Room, Garden, etc.)

## Development Tools
- Vite: Fast build tool and development server
- TypeScript: Type safety across the entire application
- ESBuild: Fast JavaScript bundler for production builds
- Cross-env: Environment variable management across platforms

## Stripe setup (env & webhooks)

If you've migrated payments to Stripe, set the following environment variables for the server runtime (development and production):

- `STRIPE_SECRET` - Your Stripe secret API key (starts with `sk_...`). Required by server endpoints that create PaymentIntents.
- `STRIPE_WEBHOOK_SECRET` - The webhook signing secret produced when you register a webhook endpoint in the Stripe dashboard (used to validate incoming webhook events).

Recommended webhook configuration:

- Endpoint URL (production): `https://<your-domain>/api/stripe/webhook`
- Endpoint URL (local dev): use the Stripe CLI to forward events to your local server, e.g.:

	1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
	2. Authenticate: `stripe login`
	3. Forward events to localhost: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

	The Stripe CLI will print a `webhook signing secret` (starts with `whsec_...`). Set that value in your local `.env` as `STRIPE_WEBHOOK_SECRET` so the server can verify webhook signatures.

Notes & next steps:

- The current webhook handler verifies signatures and logs events; implement booking finalization in the webhook handler to mark bookings as paid/confirmed in the database when you receive `payment_intent.succeeded` or `checkout.session.completed` events.
- For a simpler client-side integration, consider using Stripe Checkout sessions on the server and redirecting users to Stripe Checkout; this reduces PCI surface area and simplifies client code.
- Keep your `STRIPE_SECRET` private. Do not commit secrets to source control.