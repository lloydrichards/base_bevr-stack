# Client App

React frontend built with Vite and TypeScript, part of the
[bEvr stack](../../README.md).

## Stack

- **React 19** - UI framework
- **Vite 8** - Build tool and dev server
- **TypeScript** - Type safety
- **Effect 4** - Functional programming utilities
- **@repo/domain** - Shared types and schemas

## Getting Started

From the monorepo root:

```bash
# Start development server
bun run dev --filter=client

# Build for production
bun run build --filter=client
```

The app runs on `http://localhost:3000` in development.

## Architecture

The client is a standard React application with:

- **Shared Types**: Import from `@repo/domain` for type-safe API communication
- **Effect Integration**: Use Effect for functional programming patterns
- **Environment Variables**: Configure server URL via `VITE_SERVER_URL`

## Example Usage

The REST atom uses `HttpApiClient.make(Api)` with the server URL from
`VITE_SERVER_URL`. The greeting endpoint is `GET /hello/`.
See [`hello-atom.ts`](src/lib/atoms/hello-atom.ts) for the request and
[`rest-card.tsx`](src/components/rest-card.tsx) for `AsyncResult` rendering.

## Testing

The client uses **Vitest 5 with Browser Mode** (Playwright) for testing React
components in a real browser environment.

```bash
# Run client tests
bun run test --filter=client
```

**Test Setup:**

- **Browser Mode**: Tests run in Playwright-controlled browser
- **vitest-browser-react**: React testing utilities for Browser Mode
- **CSS Support**: Tailwind CSS is processed during tests

See [`app.test.tsx`](src/app.test.tsx) for the component test, including its
atom mocks. `App` is a default export (`import App from "./app"`).

Tests are colocated with source files using the `*.test.tsx` pattern.

## Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [bEvr Stack Overview](../../README.md)
