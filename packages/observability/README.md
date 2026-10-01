# @repo/observability

Shared OpenTelemetry setup for the [bEvr stack](../../README.md) using Effect.

## Overview

This package centralizes OTEL configuration so apps can enable tracing by
providing environment variables instead of wiring exporters per app.

## Environment

- `LOG_LEVEL`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_SERVICE_NAME`

`LOG_LEVEL` controls the minimum runtime log level for the whole Effect runtime.
Supported values: `All`, `Trace`, `Debug`, `Info`, `Warn`, `Error`,
`Fatal`, `None`. Values are case-sensitive.

When both `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_SERVICE_NAME` are set, the server exports traces via OTLP over HTTP. Use the full traces URL, such
as `http://collector:4318/v1/traces`.
If either is missing, tracing is disabled with a log message.

## Usage

Provide the layer at app startup:

```ts
import { ObservabilityLive } from "@repo/observability";
import { Layer } from "effect";
import { HttpRouter } from "effect/http";

const HttpLive = HttpRouter.serve(Router).pipe(
  Layer.provideMerge(ObservabilityLive),
);
```

## API

- `LogLevelLive`: Layer that loads `LOG_LEVEL` from config and applies it as the
  runtime minimum log level.
- `ObservabilityLive`: Layer that configures NodeSdk when env vars are set.
  It also applies `LogLevelLive`.
- `Observability`: re-export of `NodeSdk` for advanced configuration.

## Removing From Apps

### Server

1. Remove Observability wiring from server startup:
   - `apps/server/src/index.ts`: remove the `ObservabilityLive` import and the
     `Layer.provideMerge(ObservabilityLive)` call.
2. Remove the dependency:
   - `apps/server/package.json`: remove `@repo/observability`.

### MCP Server

1. Remove Observability wiring:
   - `apps/server-mcp/src/index.ts`: remove the `ObservabilityLive` import and
     the `Layer.provideMerge(ObservabilityLive)` call.
2. Remove the dependency:
   - `apps/server-mcp/package.json`: remove `@repo/observability`.

## Learn More

- [Effect OpenTelemetry source](https://github.com/Effect-TS/effect/tree/main/packages/opentelemetry)
- [bEvr Stack Overview](../../README.md)
