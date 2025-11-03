# Monorepo Structure

This application has been converted to a monorepo structure with separate frontend and backend packages.

## Structure

```
boo-back/
├── packages/
│   ├── backend/          # Backend API server (Express + TypeScript)
│   ├── frontend/         # Frontend app (React + Vite)
│   └── shared/           # Shared code (Database schema, types)
├── package.json          # Root workspace configuration
└── vercel.json           # Vercel deployment configuration
```

## Packages

### @boo-back/backend
- Express server with API routes
- Database migrations
- Server scripts and utilities
- Located in `packages/backend/`

### @boo-back/frontend
- React + Vite application
- UI components and pages
- Located in `packages/frontend/`

### @boo-back/shared
- Database schema (Drizzle ORM)
- Shared TypeScript types
- Located in `packages/shared/`

## Usage

### Development

```bash
# Install all dependencies
npm install

# Run backend development server
npm run dev:backend

# Run frontend development server
npm run dev:frontend

# Run both (backend starts frontend via Vite middleware in dev mode)
npm run dev
```

### Building

```bash
# Build all packages
npm run build

# Build individual packages
npm run build:backend
npm run build:frontend
```

### Database Operations

```bash
# Push database schema
npm run db:push

# Seed database
npm run seed-db

# Initialize admin user
npm run init-admin
```

## Key Changes

1. **Package Structure**: Code is now organized into separate packages under `packages/`
2. **Workspace Configuration**: Root `package.json` uses npm workspaces
3. **Import Paths**: Frontend imports shared types via `@boo-back/shared/schema`
4. **TypeScript Config**: Each package has its own `tsconfig.json` with project references
5. **Build Output**: Backend builds to `packages/backend/dist/`, frontend to `dist/public/`

## Notes

- The shared package exports the database schema which is used by both frontend (for types) and backend (for database operations)
- Vercel deployment is configured to build both backend API functions and frontend static assets
- All scripts have been updated to work from the monorepo root

