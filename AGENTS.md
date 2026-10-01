# AGENTS.md

> Note: This file is the authoritative source for coding agent instructions. If
> in doubt, prefer AGENTS.md over README.md. See nested AGENTS.md files in each
> workspace for app-specific patterns.

## Commands

| Command                                            | Purpose                                   |
| -------------------------------------------------- | ----------------------------------------- |
| `bun install`                                      | Install dependencies                      |
| `bun run dev`                                      | Start all apps (client:3000, server:9000) |
| `bun run dev --filter=client`                      | Start client only                         |
| `bun run dev --filter=server`                      | Start server only                         |
| `bun run build`                                    | Build all apps                            |
| `bun run lint`                                     | Lint with Biome                           |
| `bun run format`                                   | Format with Biome                         |
| `bun run test`                                     | Run all tests (Vitest)                    |
| `bun run test --filter=server -- src/file.test.ts` | Run single test file                      |

## Tech Stack

Bun 1.4+, TypeScript 7, Effect 4, React 19, Vite 8, Vitest 5, Tailwind CSS
4, Biome 2.5

## Code Style

- **Formatting**: Spaces (not tabs), double quotes for strings
- **Imports**: Use `@repo/domain` for shared types; Biome auto-organizes imports
- **Types**: Effect Schema for validation; `typeof MySchema.Type` for inline
  types, `Schema.Schema.Type<typeof T>` for exports
- **Naming**: camelCase variables/functions, PascalCase types/classes/React
  components
- **Effect patterns**: `Effect.gen` + `yield*` for all Effect operations; Layer
  composition for DI
- **Error handling**: Use Effect error channel; avoid try/catch

## Effect Essentials

```typescript
// Always use yield* to unwrap Effect values
Effect.gen(function* () {
  const service = yield* MyService; // Access service from Context
  const result = yield* service.method(); // Unwrap Effect result
  yield* Effect.log("done"); // Side effects
  return result;
});
```

## Structure

| Workspace         | Stack                | AGENTS.md                   |
| ----------------- | -------------------- | --------------------------- |
| `apps/client`     | React + Effect Atom  | `apps/client/AGENTS.md`     |
| `apps/server`     | Effect Platform, RPC | `apps/server/AGENTS.md`     |
| `apps/server-mcp` | Effect MCP Server    | `apps/server-mcp/AGENTS.md` |
| `packages/domain` | Effect Schema, RPC   | `packages/domain/AGENTS.md` |

## Effect source references

Use the installed package source to verify APIs for the pinned Effect version.
For upstream changes, use a checkout of `https://github.com/Effect-TS/effect.git`
under `.reference/effect/`. The old `effect-smol` repository is archived.
Atom core APIs now live in `effect/reactivity`; React bindings are in
`@effect/atom-react` in the same upstream repository.

Before refreshing a reference checkout, check for local changes. Preserve dirty
checkouts and use a separate reference directory when necessary.

## Template setup and checks

- Copy `.env.example` to `.env` at the repository root and set
  `ANTHROPIC_API_KEY` before running the API. Root Bun commands load this file.
- Use `bun run test` for Vitest. `bun test` invokes Bun's built-in runner.
- Run lint, formatting, all workspace types, tests, and builds before merging.
- The end-to-end suite supplies a placeholder AI key and makes no AI requests.
- Keep the Effect ecosystem packages at one matching version.
- TypeScript 7 uses `@effect/tsgo`; `prepare` patches the compiler. Keep the
  shared plugin name `@effect/language-service`, which the integration expects.
- Use `effect/http`, `effect/http-api`, `effect/rpc`, `effect/ai`, and
  `effect/reactivity`. The `effect/unstable/*` import paths are removed.
- Use `Context.Service` with `make` and a separate `layer` for services.
- Use queues with `Cause.Done` and `Queue.end` for normal stream completion.
  `Queue.shutdown` discards buffered messages and is for cancellation.
- Acquire a PubSub subscription before publishing events that it must receive.
- Runtime environment variables must pass through Turborepo's `dev` task.
  Browser build variables must participate in the build cache key.

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
