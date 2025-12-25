# Server

HTTP server wrapper that serves the Blob API.

## What is This?

This is a **lightweight HTTP server** built with [Hono](https://hono.dev/) that serves the tRPC API. The actual API logic (routers, procedures, business logic) lives in `packages/api`.

Think of it as:

- `packages/api` = The API itself (the brain)
- `apps/server` = The HTTP server (the delivery mechanism)

## Architecture

```
apps/server/            → HTTP server (this package)
  └── src/index.ts      → Hono server setup

packages/api/           → The actual API
  ├── routers/          → API endpoints
  ├── server.ts         → tRPC setup
  └── client.ts         → tRPC client
```

## Why This Structure?

**Separation of Concerns:**

- API logic is separate from the HTTP transport layer
- Could be served by different servers (Hono, Express, etc.)
- Easy to test API logic independently

**Flexibility:**

- Same API could be deployed to different platforms
- Server wrapper can be swapped without changing API
- Cleaner responsibilities

## What's in This Package?

Just the HTTP server setup:

- Hono server initialization
- tRPC adapter for Hono
- Health check endpoint
- CORS configuration

## Dual Runtime Support

This server supports two different runtimes:

### Development: Node.js with tsx

```bash
pnpm dev  # Uses Node.js with hot reload
```

- Fast hot reload
- Better debugging experience
- TypeScript support via tsx
- **Environment variables**: Loaded from `.env` file via tsx's `--env-file` flag

### Production: Bun

```bash
pnpm start  # Uses Bun runtime
```

- Near-native performance
- Faster startup time
- Optimized for production
- **Environment variables**: Automatically loaded from `.env` file by Bun

The code automatically detects which runtime it's running on and uses the appropriate server adapter.

### Environment Variables

Create a `.env` file in this directory with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=8787  # Optional, defaults to 8787
```

Both runtimes automatically load environment variables:

- **tsx** (Node.js dev): Uses `--env-file=.env` flag
- **Bun**: Automatically loads `.env` files natively

## Development

```bash
# Start development server (Node.js with hot reload)
pnpm dev

# Start production server (Bun)
pnpm start
```

The server runs on port 8787 by default and serves:

- `/trpc/*` - tRPC API endpoints
- `/health` - Health check endpoint

## Adding API Endpoints

**Don't add endpoints here!** Add them in `packages/api/src/routers/`.

This package just serves the API - it doesn't define it.

See `packages/api/README.md` for how to add new API routes.
