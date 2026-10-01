# Observability Package AGENTS.md

> See root `/AGENTS.md` for monorepo conventions.

## Purpose

Shared OpenTelemetry wiring for Effect apps. Enables tracing when required
environment variables are set and no-ops otherwise.

## Environment

- `LOG_LEVEL`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_SERVICE_NAME`

## Usage

```typescript
import { ObservabilityLive } from "@repo/observability";
import { Layer } from "effect";
import { HttpRouter } from "effect/http";

const HttpLive = HttpRouter.serve(Router).pipe(
  Layer.provideMerge(ObservabilityLive),
);
```

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._
