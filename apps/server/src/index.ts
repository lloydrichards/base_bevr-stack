import { HttpApiBuilder, HttpLayerRouter, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import {
  Api,
  type ApiResponse,
  EventRpc,
  type TickEvent,
} from "@repo/domain/Api";
import { Config, Effect, Layer, Mailbox } from "effect";

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
          }).pipe(Effect.ensuring(mailbox.end))
        );
        return mailbox;
      }),
    });
  })
);

// Define Api Router
const ApiRouter = HttpLayerRouter.addHttpApi(Api).pipe(
  Layer.provide(Layer.merge(HealthGroupLive, HelloGroupLive))
);

// Define RPC Router
const RpcRouter = RpcServer.layerHttpRouter({
  group: EventRpc,
  path: "/rpc",
  protocol: "http",
  spanPrefix: "rpc",
}).pipe(
  Layer.provide(EventRpcLive),
  Layer.provide(RpcSerialization.layerNdjson)
);

const AllRouters = Layer.mergeAll(ApiRouter, RpcRouter).pipe(
  Layer.provide(
    HttpLayerRouter.cors({
      allowedOrigins: ["*"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "B3", "traceparent"],
      credentials: true,
    })
  )
);

const ServerConfig = Config.all({
  port: Config.number("PORT").pipe(Config.withDefault(9000)),
});

const HttpLive = HttpLayerRouter.serve(AllRouters).pipe(
  HttpServer.withLogAddress,
  Layer.provideMerge(BunHttpServer.layerConfig(ServerConfig))
);

BunRuntime.runMain(Layer.launch(HttpLive));
