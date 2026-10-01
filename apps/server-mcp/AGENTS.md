# MCP Server AGENTS.md

> See root `/AGENTS.md` for monorepo conventions.

## Commands

| Command                                 | Purpose                      |
| --------------------------------------- | ---------------------------- |
| `bun run dev --filter=server-mcp`       | Start MCP server (port 9009) |
| `bun --filter=server-mcp run inspector` | Open the MCP inspector       |

## MCP Components

```typescript
import { Effect, Layer, Schema } from "effect";
import { McpServer, Tool, Toolkit } from "effect/ai";

// 1. Resources - static content
McpServer.resource({
  uri: "app://primer",
  name: "Primer Document",
  description: "Documentation for the application",
  content: Effect.succeed("Content here"),
});

// 2. Prompts - parameterized templates
McpServer.prompt({
  name: "Hello Prompt",
  parameters: { name: Schema.String },
  content: ({ name }) => Effect.succeed(`Hello, ${name}!`),
});

// 3. Tools - executable actions
class MyTools extends Toolkit.make(
  Tool.make("ToolName", {
    description: "Tool description",
    parameters: Schema.Struct({ arg: Schema.String }),
    success: Schema.String,
    failure: Schema.Never,
  })
) {}

// Implement tools
McpServer.toolkit(MyTools).pipe(
  Layer.provide(
    MyTools.toLayer({
      ToolName: ({ arg }) => Effect.succeed(`Result: ${arg}`),
    })
  )
);
```

## Layer composition

See [`src/index.ts`](src/index.ts) for the complete setup. It uses
`McpServer.layerHttp` from `effect/ai`, `HttpRouter.serve` from `effect/http`,
and `BunHttpServer.layerConfig` from `@effect/platform-bun`.

The `protocols` array in that file selects the supported MCP versions.
Keep that array explicit when changing protocol support.

There are currently no MCP unit tests. Use the inspector command in
[README.md](README.md) to check tools, resources, and prompts interactively.

## Environment

```bash
MCP_PORT=9009  # MCP server port (default)
```

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._
