import { NodeSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Config, Effect, Layer, Logger, LogLevel, Option } from "effect";

const parseLogLevel = (value: string) => {
  switch (value.trim().toLowerCase()) {
    case "all":
      return LogLevel.All;
    case "trace":
      return LogLevel.Trace;
    case "debug":
      return LogLevel.Debug;
    case "info":
      return LogLevel.Info;
    case "warn":
    case "warning":
      return LogLevel.Warning;
    case "error":
      return LogLevel.Error;
    case "fatal":
      return LogLevel.Fatal;
    case "none":
      return LogLevel.None;
    default:
      throw new Error(
        `Invalid LOG_LEVEL: ${value}. Expected one of All, Trace, Debug, Info, Warning, Error, Fatal, None.`,
      );
  }
};

const RuntimeLogLevelConfig = Config.string("LOG_LEVEL").pipe(
  Config.withDefault("Info"),
  Config.mapAttempt(parseLogLevel),
);

const TracingConfig = Config.all({
  exporterEndpoint: Config.option(Config.string("OTEL_EXPORTER_OTLP_ENDPOINT")),
  serviceName: Config.option(Config.string("OTEL_SERVICE_NAME")),
});

export const Observability = NodeSdk;

export const LogLevelLive = Effect.gen(function* () {
  const logLevel = yield* RuntimeLogLevelConfig;
  return Logger.minimumLogLevel(logLevel);
}).pipe(Layer.unwrapEffect);

const TracingLive = Effect.gen(function* () {
  const logLevel = yield* RuntimeLogLevelConfig;
  const logWithConfiguredLevel = Logger.withMinimumLogLevel(logLevel);
  const tracing = yield* TracingConfig;
  const endpoint = Option.getOrUndefined(tracing.exporterEndpoint);
  const serviceName = Option.getOrUndefined(tracing.serviceName);

  if (!endpoint || !serviceName) {
    yield* Effect.logInfo(
      "OTEL tracing disabled (set OTEL_EXPORTER_OTLP_ENDPOINT and OTEL_SERVICE_NAME to enable)",
    ).pipe(logWithConfiguredLevel);
    return Layer.empty;
  }

  yield* Effect.logInfo(
    `OTEL tracing enabled: ${serviceName} -> ${endpoint}`,
  ).pipe(logWithConfiguredLevel);
  return NodeSdk.layer(() => ({
    resource: { serviceName },
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({ url: endpoint }),
    ),
  }));
}).pipe(Layer.unwrap);

export const ObservabilityLive = Layer.mergeAll(LogLevelLive, TracingLive);
