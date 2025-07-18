# Client App

React frontend built with Vite and TypeScript, part of the
[bEvr stack](../../README.md).

## Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Effect** - Functional programming utilities
- **@repo/domain** - Shared types and schemas

## Getting Started

From the monorepo root:

```bash
# Start development server
bun dev --filter=client

# Build for production
bun build --filter=client
```

The app runs on `http://localhost:3001` in development.

## Architecture

The client is a standard React application with:

- **Shared Types**: Import from `@repo/domain` for type-safe API communication
- **Effect Integration**: Use Effect for functional programming patterns
- **Environment Variables**: Configure server URL via `VITE_SERVER_URL`

## Example Usage

```typescript
import { ApiResponse } from "@repo/domain";

// Type-safe API calls
const response = await fetch("/api/hello");
// Decode the response using Effect Schema
const res = Schema.decodeUnknownSync(ApiResponse)(await req.json());
```

## Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [bEvr Stack Overview](../../README.md)
