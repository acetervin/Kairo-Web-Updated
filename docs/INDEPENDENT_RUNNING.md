# Running Frontend and Backend Independently

The frontend and backend have been configured to run independently, allowing for better separation of concerns and development flexibility.

## Architecture

- **Frontend**: Runs on port **5000** (http://localhost:5000)
- **Backend**: Runs on port **3000** (http://localhost:3000)
- **Communication**: Frontend proxies `/api/*` requests to the backend via Vite proxy

## Running the Applications

### Option 1: Run Both Together (Recommended for Development)

From the root directory:

```bash
npm run dev:all
```

This will start both the backend and frontend simultaneously.

### Option 2: Run Separately (Recommended for Production-like Testing)

#### Terminal 1 - Backend:
```bash
npm run dev:backend
# or
npm run dev --workspace=@boo-back/backend
```

The backend will start on http://localhost:3000

#### Terminal 2 - Frontend:
```bash
npm run dev:frontend
# or
npm run dev --workspace=@boo-back/frontend
```

The frontend will start on http://localhost:5000

## Environment Variables

### Backend

You can configure the backend port and CORS using environment variables:

**Server Configuration:**
- `BACKEND_PORT` - Port for the backend server (default: 3000)
- `PORT` - Alternative way to set port (default: 3000)

**CORS Configuration (NO hardcoded defaults - all values must be set):**
- `CORS_ENABLED` - Enable/disable CORS entirely (set to 'false' to disable, otherwise enabled)
- `CORS_ORIGINS` - **REQUIRED**: Comma-separated list of allowed origins (e.g., `http://localhost:5000,https://example.com`)
  - Supports wildcard subdomains: `https://*.example.com`
  - Use `*` to allow all origins (not recommended for production)
  - Falls back to `FRONTEND_URL` or `ORIGIN` if not set
- `CORS_METHODS` - **REQUIRED**: Comma-separated allowed HTTP methods (e.g., `GET,POST,PUT,DELETE,PATCH,OPTIONS`)
- `CORS_HEADERS` - **REQUIRED**: Comma-separated allowed headers (e.g., `Content-Type,Authorization,X-Requested-With`)
- `CORS_CREDENTIALS` - Optional: Set to 'true' to allow credentials, otherwise disabled
- `CORS_MAX_AGE` - Optional: Max age for preflight requests in seconds (e.g., `86400` for 24 hours)

**Legacy Support:**
- `FRONTEND_URL` - Single frontend URL (will be added to allowed origins if `CORS_ORIGINS` is not set)
- `ORIGIN` - Alias for `FRONTEND_URL`

### Frontend

You can configure the backend URL using environment variables:
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)
- `BACKEND_URL` - Alternative way to set backend URL (default: http://localhost:3000)

Create a `.env` file in the root or respective package directories:

**Root `.env` (or `packages/backend/.env`)**:
```env
BACKEND_PORT=3000
DATABASE_URL=your_database_url

# CORS Configuration (REQUIRED - no hardcoded defaults)
CORS_ORIGINS=http://localhost:5000,https://yourdomain.com
CORS_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
CORS_HEADERS=Content-Type,Authorization,X-Requested-With
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400
```

**Note**: If `CORS_ORIGINS`, `CORS_METHODS`, or `CORS_HEADERS` are not set, CORS will be disabled (middleware will skip). Only set `CORS_CREDENTIALS=true` and `CORS_MAX_AGE` if you need them.

**Frontend `.env` (or `packages/frontend/.env`)**:
```env
VITE_API_URL=http://localhost:3000
```

## CORS Configuration

The backend includes fully configurable CORS middleware via environment variables:
- **NO hardcoded defaults** - all values must be explicitly set via environment variables
- Required: `CORS_ORIGINS`, `CORS_METHODS`, `CORS_HEADERS` must be set for CORS to work
- Optional: `CORS_CREDENTIALS`, `CORS_MAX_AGE` only apply if explicitly set
- Supports multiple origins (comma-separated)
- Supports wildcard subdomains (e.g., `*.example.com`)
- Can be completely disabled by setting `CORS_ENABLED=false`
- If required variables are missing, CORS middleware is skipped (no error, just no CORS headers)

## How It Works

1. **Frontend (Vite)**: 
   - Serves the React app on port 5000
   - Proxies all `/api/*` requests to the backend (port 3000)
   - This makes API calls appear to come from the same origin to the browser

2. **Backend (Express)**:
   - Serves only API routes on port 3000
   - In development, it's API-only
   - In production, it can still serve static files if needed
   - CORS middleware allows cross-origin requests from the frontend

## API Usage

All API calls in the frontend use relative paths like `/api/properties`, which:
- In development: Get proxied by Vite to `http://localhost:3000/api/properties`
- In production: Get handled by the same server (if serving static files) or configured backend URL

No changes are needed to existing API calls - they will work automatically with the proxy.

## Production Deployment

In production:
- Build both frontend and backend: `npm run build`
- The backend serves static files from the built frontend
- Or deploy them separately with appropriate CORS and proxy configuration

