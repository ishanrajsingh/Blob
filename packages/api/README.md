# API Package

The complete API logic for the Blob monorepo, powered by tRPC.

## Architecture

This package contains **all the API logic** - tRPC setup, routers, and business logic. It's consumed by:

```
packages/api/           → The API itself (this package)
  ├── routers/          → API endpoints and business logic
  ├── server.ts         → tRPC server setup
  └── client.ts         → tRPC client factory

apps/server/            → HTTP server wrapper (Hono)
apps/mobile/            → Consumes API types
```

## What's in This Package

- **`routers/`** - All API endpoints and business logic
- **`server.ts`** - tRPC server initialization, context creation, procedure definitions
- **`client.ts`** - Generic tRPC client factory
- **`index.ts`** - Main exports for consumers

## Why Routers Are Here

Routers live in this package (not in `apps/server`) because:

✅ **This IS the API** - The actual API logic, not just configuration  
✅ **Server is just a wrapper** - `apps/server` is just the HTTP server (Hono)  
✅ **Better semantics** - Package name matches its purpose  
✅ **Shared logic** - Could be consumed by multiple server implementations

See `routers/README.md` for how to add new routes.

## How the Mobile App Gets Types

The mobile app imports the API router type using TypeScript's `import type`:

```typescript
// apps/mobile/utils/trpc.ts
import type { AppRouter } from "@blob/api"; // Type-only import

export const trpc = createTRPCReact<AppRouter>();
```

**This is the correct approach:**

- ✅ `import type` is erased at build time (zero runtime code)
- ✅ Mobile gets full type safety
- ✅ Always in sync with API
- ✅ Standard practice in TypeScript monorepos
- ✅ Recommended by tRPC documentation

## Usage

### In API Routers

```typescript
// packages/api/src/routers/users.ts
import { router, publicProcedure } from "@blob/api";

export const usersRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.select().from(users);
  }),
});
```

### In HTTP Server

```typescript
// apps/server/src/index.ts
import { appRouter, createTRPCContext } from "@blob/api";

// Use with Hono or any HTTP server
```

### In Mobile (Client)

```typescript
import { trpc } from "@/utils/trpc";

function MyComponent() {
  const users = trpc.users.getAll.useQuery();
  // Full type safety! ✅
}
```

## Context

The tRPC context is defined in `server.ts` and includes:

- `db` - Drizzle database instance

Access it in procedures via the `ctx` parameter.

## Context

The tRPC context is defined in `server.ts` and includes:

- `db` - Drizzle database instance

Access it in procedures via the `ctx` parameter.
