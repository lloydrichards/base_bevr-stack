# @repo/observability

Shared OpenTelemetry setup for the [bEvr stack](../../README.md) using Effect.

## Overview

This package centralizes OTEL configuration so apps can enable tracing by
providing environment variables instead of wiring exporters per app.

## Environment

- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_SERVICE_NAME`

When both are set, tracing is enabled and spans are exported via OTLP over HTTP.
If either is missing, tracing is disabled with a log message.

## Usage

Provide the layer at app startup:

```ts
import { ObservabilityLive } from "@repo/observability";

const HttpLive = HttpLayerRouter.serve(Router).pipe(
  Layer.provideMerge(ObservabilityLive),
);
```

## API

- `ObservabilityLive`: Layer that configures NodeSdk when env vars are set.
- `Observability`: re-export of `NodeSdk` for advanced configuration.

## Learn More

- [Effect OpenTelemetry](https://effect.website/docs/guides/opentelemetry)
- [bEvr Stack Overview](../../README.md)
