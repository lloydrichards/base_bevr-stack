# Server API

Hono backend API with TypeScript, part of the [bhEvr stack](../../README.md).

## Stack

- **Hono** - Fast web framework
- **Bun** - JavaScript runtime
- **TypeScript** - Type safety
- **Effect** - Functional programming utilities
- **@repo/domain** - Shared types and schemas

## Getting Started

From the monorepo root:

```bash
# Start development server
bun dev --filter=server

# Build for production
bun build --filter=server
```

The API runs on `http://localhost:3000` in development.

## Architecture

The server uses Hono for its simplicity and ecosystem of plugins:

- **Type-safe Routes**: Shared types from `@repo/domain`
- **CORS Support**: Pre-configured for client communication
- **Effect Integration**: Functional error handling and data processing
- **Environment Agnostic**: Deploy to any JavaScript runtime

## Example Route

```typescript
import { Hono } from "hono";
import { Schema } from "@effect/schema";
import { ApiResponse } from "@repo/domain";

const app = new Hono();

app.get("/hello", async (c) => {
  const data: typeof ApiResponse.Type = {
    message: "Hello bhEvr!",
    success: true,
  };

  // Encode the data using Effect Schema
  return c.json(Schema.encodeSync(ApiResponse)(data), { status: 200 });
});
```

## Learn More

- [Hono Documentation](https://hono.dev)
- [Effect Documentation](https://effect.website)
- [bhEvr Stack Overview](../../README.md)
