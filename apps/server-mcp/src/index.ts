import { AiTool, AiToolkit, McpServer } from "@effect/ai";
import { HttpRouter, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Config, Effect, Layer, Schema } from "effect";

// Define Resources
const ResourceLayer = Layer.mergeAll(
  McpServer.resource({
    uri: "app://primer",
    name: "Primer Document",
    description: "Documentation for the application",
    content: Effect.succeed(
      "This is a sample primer document to demonstrate MCP server capabilities."
    ),
  })
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
        `Hello, ${name}! Welcome to the MCP server demonstration.`
      ),
  })
  // You can add more prompts here
);

// Define Toolkit
class AiTools extends AiToolkit.make(
  AiTool.make("GetDadJoke", {
    description: "Get a hilarious dad joke from the ICanHazDadJoke API",
    success: Schema.String,
    failure: Schema.Never,
    parameters: {
      searchTerm: Schema.String.annotations({
        description: "The search term to use to find dad jokes",
      }),
    },
  })
  // You can add more tools here
) {}

const ToolLayer = McpServer.toolkit(AiTools).pipe(
  Layer.provide(
    AiTools.toLayer(
      Effect.succeed({
        GetDadJoke: ({ searchTerm }) =>
          Effect.succeed(
            `Here's a dad joke about ${searchTerm}: Why did the scarecrow win an award? Because he was outstanding in his field!`
          ),
        // add implementation for more tools here
      })
    )
  )
);

// Define Live API
const McpLive = Layer.mergeAll(ResourceLayer, PromptLayer, ToolLayer);

const ServerConfig = Config.all({
  port: Config.number("PORT").pipe(Config.withDefault(9009)),
});

const HttpLive = HttpRouter.Default.serve().pipe(
  HttpServer.withLogAddress,
  Layer.provide(
    McpServer.layerHttp({
      name: "BEVR MCP Server",
      version: "0.1.0",
      path: "/mcp",
    })
  ),
  Layer.provideMerge(McpLive),
  Layer.provide(BunHttpServer.layerConfig(ServerConfig))
);

BunRuntime.runMain(Layer.launch(HttpLive));
