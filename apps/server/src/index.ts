import { DevTools } from "@effect/experimental";
import { HttpApiBuilder, HttpLayerRouter, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Api, type ApiResponse } from "@repo/domain/Api";
import { EventRpc, type TickEvent } from "@repo/domain/Rpc";
import {

// Define Live API Handlers
const HealthGroupLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.handle("get", () => Effect.succeed("Hello Effect!")),
);
const HelloGroupLive = HttpApiBuilder.group(Api, "hello", (handlers) =>
  handlers.handle("get", () => {
    const data: typeof ApiResponse.Type = {
      message: "Hello bEvr!",
      success: true,
    };
    return Effect.succeed(data);
  }),
);

export const EventRpcLive = EventRpc.toLayer(
  Effect.gen(function* () {
    yield* Effect.log("Starting Event RPC Live Implementation");
    return EventRpc.of({
      tick: Effect.fn(function* (payload) {
        yield* Effect.log("Creating new tick stream");
        const mailbox = yield* Mailbox.make<typeof TickEvent.Type>();
        yield* Effect.forkScoped(
          Effect.gen(function* () {
            yield* mailbox.offer({ _tag: "starting" });
            yield* Effect.sleep("3 seconds");
            for (let i = 0; i < payload.ticks; i++) {
              yield* Effect.sleep("1 second");
              yield* mailbox.offer({ _tag: "tick" });
            }
            yield* mailbox.offer({ _tag: "end" });
            yield* Effect.log("End event sent");
          }).pipe(Effect.ensuring(mailbox.end)),
        );
        return mailbox;
      }),
    });
  }),
);

// Layer Definitions
const ServerConfig = Config.all({
  port: Config.number("PORT").pipe(Config.withDefault(9000)),
  hostname: Config.string("HOST").pipe(Config.withDefault("0.0.0.0")),
  allowedOrigins: Config.string("ALLOWED_ORIGINS").pipe(
    Config.withDefault("http://localhost:3000"),
  ),
});

// Define Api Router
const ApiRouter = HttpLayerRouter.addHttpApi(Api).pipe(
  Layer.provide(Layer.merge(HealthGroupLive, HelloGroupLive)),
);

// Define RPC Router
const RpcRouter = RpcServer.layerHttpRouter({
  group: EventRpc,
  path: "/rpc",
  protocol: "http",
  spanPrefix: "rpc",
}).pipe(
  Layer.provide(EventRpcLive),
  Layer.provide(RpcSerialization.layerNdjson),
);

const HttpLive = Effect.gen(function* () {
  // Parse allowed origins from config
  const config = yield* ServerConfig;
  const allowedOrigins = config.allowedOrigins.split(",").map((o) => o.trim());

  yield* Effect.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);

  const AllRouters = Layer.mergeAll(ApiRouter, RpcRouter).pipe(
    Layer.provide(
      HttpLayerRouter.cors({
        allowedOrigins,
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "B3", "traceparent"],
        credentials: true,
      }),
    ),
  );

  return HttpLayerRouter.serve(AllRouters).pipe(
    HttpServer.withLogAddress,
    Layer.provide(DevTools.layer()),
    Layer.provideMerge(BunHttpServer.layerConfig(ServerConfig)),
  );
}).pipe(Layer.unwrapEffect, Layer.launch);

BunRuntime.runMain(HttpLive);
