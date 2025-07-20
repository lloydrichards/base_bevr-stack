import { HttpApiBuilder, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Api, type ApiResponse } from "@repo/domain";
import { Config, Effect, Layer } from "effect";

// Define Live API Handlers
const HealthGroupLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.handle("get", () => Effect.succeed("Hello Effect!"))
);
const HelloGroupLive = HttpApiBuilder.group(Api, "hello", (handlers) =>
  handlers.handle("get", () => {
    const data: typeof ApiResponse.Type = {
      message: "Hello bEvr!",
      success: true,
    };
    return Effect.succeed(data);
  })
);

// Define Live API
const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(Layer.merge(HealthGroupLive, HelloGroupLive))
);

const ServerConfig = Config.all({
  port: Config.number("PORT").pipe(Config.withDefault(9000)),
});

const HttpLive = HttpApiBuilder.serve().pipe(
  HttpServer.withLogAddress,
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provideMerge(ApiLive),
  Layer.provideMerge(BunHttpServer.layerConfig(ServerConfig))
);

BunRuntime.runMain(Layer.launch(HttpLive));
