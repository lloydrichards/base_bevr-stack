import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpServer,
} from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Effect, Layer, Schema } from "effect";
import { ApiResponse } from "@repo/domain";

// Define Domain of API
class HealthGroup extends HttpApiGroup.make("health")
  .add(HttpApiEndpoint.get("get", "/").addSuccess(Schema.String))
  .prefix("/") {}

class HelloGroup extends HttpApiGroup.make("hello")
  .add(HttpApiEndpoint.get("get", "/").addSuccess(ApiResponse))
  .prefix("/hello") {}

const Api = HttpApi.make("Api").add(HealthGroup).add(HelloGroup);

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

const HttpLive = HttpApiBuilder.serve().pipe(
  HttpServer.withLogAddress,
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provideMerge(ApiLive),
  Layer.provideMerge(
    BunHttpServer.layer({
      port: 3000,
    })
  )
);

BunRuntime.runMain(Layer.launch(HttpLive));
