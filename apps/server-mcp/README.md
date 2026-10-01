# MCP Server

[Model Context Protocol](https://modelcontextprotocol.io/) server built with
[Effect HTTP](https://github.com/Effect-TS/effect/tree/main/packages/effect/src/http) and TypeScript, part of
the [bEvr stack](../../README.md).

## Stack

- **effect/ai** - Effect AI framework for MCP tools and resources
- **Model Context Protocol** - AI assistant communication protocol
- **Effect Platform** - Functional framework foundation
- **Bun** - JavaScript runtime
- **TypeScript** - Type safety
- **@repo/domain** - Shared types and schemas
- **@repo/observability** - Shared OpenTelemetry layer

## Getting Started

From the monorepo root:

```bash
# Start development server
bun run dev --filter=server-mcp

# Build for production
bun run build --filter=server-mcp

# Test MCP server functionality (MCPJam Inspector)
bun --filter=server-mcp run inspector
```

The MCP server provides tools and resources for AI assistants via the Model
Context Protocol.

## Architecture

The MCP server uses `effect/ai` for type-safe, functional MCP tool and resource
handling:

- **MCP Tools**: Exposed functions that AI assistants can call via `Toolkit`
- **MCP Resources**: Data sources that AI assistants can access with templates
- **MCP Prompts**: Structured prompts with parameters and completion
- **Type-safe Implementation**: Schema-driven validation and type safety
- **Effect Integration**: Functional error handling and data processing
- **Bun runtime**: Uses `@effect/platform-bun` for HTTP serving

## Testing

There are currently no MCP unit tests. The inspector script starts the server
and opens MCPJam Inspector. Connect the inspector to `http://localhost:9009/mcp`
to check tools, resources, and prompts:

```bash
bun --filter=server-mcp run inspector
```

This will start an interactive session where you can test MCP tools and
resources directly.

## Example Implementation

```typescript
import { Effect, Schema } from "effect";
import { Tool, Toolkit } from "effect/ai";

class GreetingTools extends Toolkit.make(
  Tool.make("greet", {
    description: "Return a greeting",
    parameters: Schema.Struct({ name: Schema.String }),
    success: Schema.String,
    failure: Schema.Never,
  }),
) {}

const GreetingToolsLive = GreetingTools.toLayer({
  greet: ({ name }) => Effect.succeed(`Hello, ${name}!`),
});
```

Provide `GreetingToolsLive` to `McpServer.toolkit(GreetingTools)` when adding
the toolkit to the server. See [`src/index.ts`](src/index.ts) for complete
resource, prompt, tool, and HTTP wiring. Its `protocols` array lists the
supported MCP versions.

## Learn More

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Effect AI source](https://github.com/Effect-TS/effect/tree/main/packages/effect/src/ai)
- [Effect 4 source](https://github.com/Effect-TS/effect)
- [bEvr Stack Overview](../../README.md)
