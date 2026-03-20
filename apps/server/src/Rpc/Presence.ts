import {
  type ClientInfo,
  type WebSocketEvent,
  WebSocketRpc,
} from "@repo/domain/WebSocket";
import { PresenceService } from "@repo/presence";
import { Effect, Mailbox, Queue, Stream } from "effect";

export const PresenceRpcLive = WebSocketRpc.toLayer(
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
                yield* Queue.shutdown(subscription);
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
