# bEvr Stack

A modern full-stack TypeScript monorepo with end-to-end type safety, using Bun,
Effect, Vite, and React. Heavily inspired by the [bhvr](https://bhvr.dev/) stack
but the addition of Effect and Turborepo.

## Features

- **End-to-end TypeScript**: Full type safety from client to server
- **Shared Domain**: Common types and utilities across all apps
- **Effect Integration**: Built for composable, functional programming with
  [Effect](https://effect.website)
- **Modern Tooling**: [Turborepo](https://turbo.build/), [Bun](https://bun.sh/),
  [Vite](https://vitejs.dev/), and [React](https://react.dev/)
- **Zero Config**: Pre-configured [Ultracite](https://www.ultracite.ai/) for
  linting and formatting with [Biome](https://biomejs.dev)
- **Flexible Deployment**: Deploy anywhere without vendor lock-in

## Quick Start

```bash
# Install dependencies
bun install

# Start development
bun dev

# Build for production
bun build
```

### Formatting and Linting

Format and lint the codebase using Ultracite:

```bash
# Format code
bun format

# Lint code
bun lint
```

## Project Structure

```txt
.
├── apps/
│   ├── client/             # React frontend (Vite + React)
│   └── server/             # Bun + Effect backend API
├── packages/
│   ├── config-typescript/  # TypeScript configurations
│   └── domain/             # Shared Schema definitions
├── package.json            # Root package.json with workspaces
└── turbo.json              # Turborepo configuration
```

### Apps

| App      | Description                                                            |
| -------- | ---------------------------------------------------------------------- |
| `client` | A [React](https://react.dev) app built with [Vite](https://vitejs.dev) |
| `server` | A [Effect Platform](https://effect.website) backend API built          |

### Packages

| Package                   | Description                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `@repo/config-typescript` | TypeScript configurations used throughout the monorepo                                                             |
| `@repo/domain`            | Shared Schema definitions using [Effect Schema](https://effect.website/docs/schema) used by both client and server |

## Development

```bash
# Start development server
bun dev
# Run specific app
bun dev --filter=client
bun dev --filter=server

# Build all apps
bun run build
```

## Type Safety

Import shared types from the domain package:

```typescript
import { ApiResponse } from "@repo/domain";
```

## Learn More

- [Turborepo](https://turborepo.com/docs)
- [Effect](https://effect.website/docs/introduction)
- [Vite](https://vitejs.dev/guide/)
