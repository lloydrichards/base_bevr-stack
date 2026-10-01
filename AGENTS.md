# AGENTS.md

> Note: This file is the authoritative source for coding agent instructions. If
> in doubt, prefer AGENTS.md over README.md. See nested AGENTS.md files in each
> workspace for app-specific patterns.

## Commands

| Command                                        | Purpose                                   |
| ---------------------------------------------- | ----------------------------------------- |
| `bun install`                                  | Install dependencies                      |
| `bun dev`                                      | Start all apps (client:3000, server:9000) |
| `bun dev --filter=client`                      | Start client only                         |
| `bun dev --filter=server`                      | Start server only                         |
| `bun run build`                                | Build all apps                            |
| `bun lint`                                     | Lint with Biome                           |
| `bun format`                                   | Format with Biome                         |
| `bun test`                                     | Run all tests (Vitest)                    |
| `bun test --filter=server -- src/file.test.ts` | Run single test file                      |

## Tech Stack

Bun 1.4+, TypeScript 7, Effect 4, React 19, Vite 8, Vitest 5, Tailwind CSS
4, Biome 2.5

## Code Style

- **Formatting**: Spaces (not tabs), double quotes for strings
- **Imports**: Use `@repo/domain` for shared types; Biome auto-organizes imports
- **Types**: Effect Schema for validation; `typeof Schema.Type` for inline
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

## Local Source References

When answering questions about Effect, search these
cloned source repos first. When updating dependencies, pull the latest
commits in these repos to ensure the LLM references current code:

- `.reference/effect/`
- `.reference/effect-atom/`

If any of the folders are missing (they are git ignored), clone them into
`reference/`:

- `https://github.com/Effect-TS/effect.git` -> `.reference/effect/`
- `https://github.com/Effect-TS/effect-atom.git` -> `.reference/effect-atom/`

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
