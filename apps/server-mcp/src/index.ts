import { McpServer, Tool, Toolkit } from "@effect/ai";
import { DevTools } from "@effect/experimental";
import { NodeSdk } from "@effect/opentelemetry";
import { HttpLayerRouter, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Config, Effect, Layer, Schema } from "effect";

// Define Resources
const ResourceLayer = Layer.mergeAll(
  McpServer.resource({
    uri: "app://primer",
    name: "Primer Document",
    description: "Documentation for the application",
    content: Effect.succeed(
      "This is a sample primer document to demonstrate MCP server capabilities.",
    ),
  }),
  // You can add more resources here
);

// Define Prompts
const PromptLayer = Layer.mergeAll(
  McpServer.prompt({
    name: "Hello Prompt",
    description: "A simple greeting prompt",
    parameters: Schema.Struct({
      name: Schema.String,
    }),
    content: ({ name }) =>
      Effect.succeed(
        `Hello, ${name}! Welcome to the MCP server demonstration.`,
      ),
  }),
  // You can add more prompts here
);

// Define Toolkit
class AiTools extends Toolkit.make(
  Tool.make("GetDadJoke", {
    description: "Get a hilarious dad joke from the ICanHazDadJoke API",
    success: Schema.String,
    failure: Schema.Never,
    parameters: {
      searchTerm: Schema.String.annotations({
        description: "The search term to use to find dad jokes",
      }),
    },
  }),
  // You can add more tools here
) {}

const ToolLayer = McpServer.toolkit(AiTools).pipe(
  Layer.provide(
    AiTools.toLayer(
      Effect.succeed({
        GetDadJoke: ({ searchTerm }) =>
          Effect.succeed(
            `Here's a dad joke about ${searchTerm}: Why don't ${searchTerm}s ever get lost? Because they always follow the map!`,
          ),
        // add implementation for more tools here
      }),
    ),
  ),
);

// Define Live API
const McpLive = Layer.mergeAll(ResourceLayer, PromptLayer, ToolLayer);

const ServerConfig = Config.all({
  port: Config.number("MCP_PORT").pipe(Config.withDefault(9009)),
  enableDevTools: Config.boolean("DEVTOOLS").pipe(Config.withDefault(false)),
});

const TracingConfig = Config.all({
  exporterEndpoint: Config.string("OTEL_EXPORTER_OTLP_ENDPOINT"),
  serviceName: Config.string("OTEL_SERVICE_NAME"),
});

const McpRouter = McpServer.layerHttpRouter({
  name: "BEVR MCP Server",
  version: "0.1.0",
  path: "/mcp",
}).pipe(
  Layer.provideMerge(McpLive),
  Layer.provide(
    HttpLayerRouter.cors({
      allowedOrigins: ["*"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "mcp-protocol-version"],
      credentials: false,
    }),
  ),
);

const NodeSdkLive = Effect.gen(function* () {
  const tracing = yield* TracingConfig;
  return NodeSdk.layer(() => ({
    resource: { serviceName: tracing.serviceName },
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({ url: tracing.exporterEndpoint }),
    ),
  }));
}).pipe(Layer.unwrapEffect);

const DevToolsLive = Effect.gen(function* () {
  const config = yield* ServerConfig;
  if (!config.enableDevTools) {
    return Layer.empty;
  }
  yield* Effect.log("Enabling DevTools Layer");
  return DevTools.layer();
}).pipe(Layer.unwrapEffect);

const HttpLive = HttpLayerRouter.serve(McpRouter).pipe(
  HttpServer.withLogAddress,
  Layer.provideMerge(DevToolsLive),
  Layer.provideMerge(NodeSdkLive),
  Layer.provideMerge(BunHttpServer.layerConfig(ServerConfig)),
);

BunRuntime.runMain(Layer.launch(HttpLive));
