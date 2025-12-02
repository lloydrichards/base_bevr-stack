import { DevTools } from "@effect/experimental";
import { HttpApiBuilder, HttpLayerRouter, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { RpcSerialization, RpcServer } from "@effect/rpc";
import { Api, type ApiResponse } from "@repo/domain/Api";
import { EventRpc, type TickEvent } from "@repo/domain/Rpc";
import {
  type ClientInfo,
  type WebSocketEvent,
  WebSocketRpc,
} from "@repo/domain/WebSocket";
import { Config, Effect, Layer, Mailbox, Stream } from "effect";
import { PresenceService } from "./services/PresenceService";

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

const EventRpcLive = EventRpc.toLayer(
  Effect.gen(function* () {
    yield* Effect.log("Starting Event RPC Live Implementation");
    return {
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
    };
  }),
);

const PresenceRpcLive = WebSocketRpc.toLayer(
  Effect.gen(function* () {
    const presence = yield* PresenceService;
    yield* Effect.log("Starting Presence RPC Live Implementation");

    return {
      subscribe: Effect.fn(function* () {
        yield* Effect.log("New presence subscription");

        const clientId = presence.generateClientId();
        const connectedAt = Date.now();
        const clientInfo: ClientInfo = {
          clientId,
          status: "online",
          connectedAt,
        };

        const mailbox = yield* Mailbox.make<WebSocketEvent>();

        // CRITICAL: Subscribe to PubSub FIRST to ensure we don't miss any events
        const subscription = yield* presence.subscribe();

        // Fork the stream consumer to handle incoming PubSub events
        yield* Effect.forkScoped(
          Stream.fromQueue(subscription).pipe(
            Stream.tap((event) =>
              Effect.gen(function* () {
                // Filter out our own user_joined event since we send "connected" instead
                if (
                  event._tag === "user_joined" &&
                  event.client.clientId === clientId
                ) {
                  return;
                }
                yield* mailbox.offer(event);
              }),
            ),
            Stream.runDrain,
            Effect.ensuring(
              Effect.gen(function* () {
                yield* presence.removeClient(clientId);
                yield* mailbox.end;
                yield* Effect.log(
                  `Presence subscription ended for ${clientId}`,
                );
              }),
            ),
          ),
        );

        // Get existing clients BEFORE adding ourselves
        const existingClients = yield* presence.getClients();

        // Now add ourselves - this publishes user_joined to PubSub for other clients
        yield* presence.addClient(clientId, clientInfo);

        // Send our own connected event (not user_joined since we're the one connecting)
        yield* mailbox.offer({
          _tag: "connected",
          clientId,
          connectedAt,
        });

        // Send existing clients as user_joined events so we know who's already here
        for (const client of existingClients) {
          yield* mailbox.offer({
            _tag: "user_joined",
            client,
          });
        }

        return mailbox;
      }),

      setStatus: Effect.fn(function* (payload) {
        yield* Effect.log(
          `Setting status for ${payload.clientId} to ${payload.status}`,
        );
        yield* presence.setStatus(payload.clientId, payload.status);
        return { success: true };
      }),

      getPresence: Effect.fn(function* () {
        const clients = yield* presence.getClients();
        yield* Effect.log(`Returning ${clients.length} clients`);
        return { clients: [...clients] };
      }),
    };
  }),
);

// ============================================================================
// Server Configuration
// ============================================================================

const ServerConfig = Config.all({
  port: Config.number("PORT").pipe(Config.withDefault(9000)),
  hostname: Config.string("HOST").pipe(Config.withDefault("0.0.0.0")),
  allowedOrigins: Config.string("ALLOWED_ORIGINS").pipe(
    Config.withDefault("http://localhost:3000"),
  ),
});

// ============================================================================
// Router Composition
// ============================================================================

// HTTP API Router
const ApiRouter = HttpLayerRouter.addHttpApi(Api).pipe(
  Layer.provide(Layer.merge(HealthGroupLive, HelloGroupLive)),
);

// HTTP RPC Router (for EventRpc - streaming over HTTP)
const HttpRpcRouter = RpcServer.layerHttpRouter({
  group: EventRpc,
  path: "/rpc",
  protocol: "http", // Use HTTP for EventRpc
  spanPrefix: "rpc",
}).pipe(
  Layer.provide(EventRpcLive),
  Layer.provide(RpcSerialization.layerNdjson),
);

// WebSocket RPC Router (for PresenceRpc - real-time presence)
const WebSocketRpcRouter = RpcServer.layerHttpRouter({
  group: WebSocketRpc,
  path: "/ws",
  protocol: "websocket", // Use WebSocket for PresenceRpc!
  spanPrefix: "ws",
}).pipe(
  Layer.provide(PresenceRpcLive),
  Layer.provide(PresenceService.Default),
  Layer.provide(RpcSerialization.layerNdjson),
);

// ============================================================================
// Server Launch
// ============================================================================

const HttpLive = Effect.gen(function* () {
  const config = yield* ServerConfig;
  const allowedOrigins = config.allowedOrigins.split(",").map((o) => o.trim());

  yield* Effect.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
  yield* Effect.log("Starting server with:");
  yield* Effect.log("  - HTTP API at /");
  yield* Effect.log("  - HTTP RPC at /rpc (EventRpc)");
  yield* Effect.log("  - WebSocket RPC at /ws (PresenceRpc)");

  const AllRouters = Layer.mergeAll(
    ApiRouter,
    HttpRpcRouter,
    WebSocketRpcRouter,
  ).pipe(
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
