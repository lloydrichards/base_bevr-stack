# Server API

[Effect HTTP](https://github.com/Effect-TS/effect/tree/main/packages/effect/src/http) backend API with
TypeScript, part of the [bEvr stack](../../README.md).

## Stack

- **Effect Platform** - Api framework
- **Bun** - JavaScript runtime
- **TypeScript** - Type safety
- **@repo/domain** - Shared types and schemas

## Getting Started

Copy the root `.env.example` to `apps/server/.env` and set
`ANTHROPIC_API_KEY`. The server requires the key at startup, including when
you only use REST or presence.

From the monorepo root:

```bash
# Start development server
bun run dev --filter=server

# Build for production
bun run build --filter=server
```

The API runs on `http://localhost:9000` in development.

## Architecture

The server uses Effect Platform HTTP API for type-safe, functional HTTP
handling:

- **Type-safe Routes**: Shared types from `@repo/domain`
- **CORS Support**: Pre-configured for client communication
- **Effect Integration**: Functional error handling and data processing
- **Bun runtime**: Uses `@effect/platform-bun` for HTTP serving

## Example Route

```typescript
import { Api, type ApiResponse } from "@repo/domain/Api";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/http-api";

const HelloGroupLive = HttpApiBuilder.group(Api, "hello", (handlers) =>
  handlers.handle("get", () => {
    const data: typeof ApiResponse.Type = {
      message: "Hello bEvr!",
      success: true,
    };
    return Effect.succeed(data);
  }),
);
```

The shared definition in [`Api.ts`](../../packages/domain/src/Api.ts) exposes
this handler at `GET /hello/`.

## Testing

The server uses **Vitest 5** with **@effect/vitest** for testing Effect-based
code.

```bash
# Run server tests
bun run test --filter=server

# Run specific test file
bun run test --filter=server -- src/index.test.ts
```

See [`src/index.test.ts`](src/index.test.ts) for complete `it.effect` examples.

Use `it.effect()` for tests that return Effect values. The test runner
automatically handles Effect execution and error propagation.

## Learn More

- [Effect 4 source](https://github.com/Effect-TS/effect)
- [bEvr Stack Overview](../../README.md)
