import { NodeSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Config, Effect, Layer, Option, References } from "effect";

export const Observability = NodeSdk;

const LogLevelConfig = Config.logLevel("LOG_LEVEL").pipe(
  Config.withDefault("Info"),
);

export const LogLevelLive = Effect.gen(function* () {
  const logLevel = yield* LogLevelConfig;
  return Layer.succeed(References.MinimumLogLevel, logLevel);
}).pipe(Layer.unwrap);

const TracingConfig = Config.all({
  exporterEndpoint: Config.option(Config.string("OTEL_EXPORTER_OTLP_ENDPOINT")),
  serviceName: Config.option(Config.string("OTEL_SERVICE_NAME")),
});

const TracingLive = Effect.gen(function* () {
  const logLevel = yield* LogLevelConfig;
  const tracing = yield* TracingConfig;
  const endpoint = Option.getOrUndefined(tracing.exporterEndpoint);
  const serviceName = Option.getOrUndefined(tracing.serviceName);

  if (!endpoint || !serviceName) {
    yield* Effect.logInfo(
      "OTEL tracing disabled (set OTEL_EXPORTER_OTLP_ENDPOINT and OTEL_SERVICE_NAME to enable)",
    ).pipe(Effect.provideService(References.MinimumLogLevel, logLevel));
    return Layer.empty;
  }

  yield* Effect.logInfo(
    `OTEL tracing enabled: ${serviceName} -> ${endpoint}`,
  ).pipe(Effect.provideService(References.MinimumLogLevel, logLevel));
  return NodeSdk.layer(() => ({
    resource: { serviceName },
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({ url: endpoint }),
    ),
  }));
}).pipe(Layer.unwrap);

export const ObservabilityLive = Layer.mergeAll(LogLevelLive, TracingLive);
