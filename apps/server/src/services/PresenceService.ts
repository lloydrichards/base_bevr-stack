import {
  ClientId,
  type ClientInfo,
  type ClientStatus,
  type WebSocketEvent,
} from "@repo/domain/WebSocket";
import { Effect, PubSub, Ref, Schema } from "effect";

export type PresenceEventType = typeof WebSocketEvent.Type;

export class PresenceService extends Effect.Service<PresenceService>()(
  "PresenceService",
  {
    effect: Effect.gen(function* () {
      yield* Effect.log("Initializing PresenceService");

      const clientsRef = yield* Ref.make(
        new Map<typeof ClientId.Type, ClientInfo>(),
      );
      const pubsub = yield* PubSub.unbounded<PresenceEventType>();

      const generateClientId = () => ClientId.make(crypto.randomUUID());

      const addClient = (clientId: typeof ClientId.Type, info: ClientInfo) =>
        Effect.gen(function* () {
          yield* Ref.update(clientsRef, (clients) => {
            const newClients = new Map(clients);
            newClients.set(clientId, info);
            return newClients;
          });

          yield* PubSub.publish(pubsub, {
            _tag: "user_joined",
            client: info,
          });

          yield* Effect.log(`Client added: ${clientId}`);
        });

      const removeClient = (clientId: typeof ClientId.Type) =>
        Effect.gen(function* () {
          const clients = yield* Ref.get(clientsRef);
          const client = clients.get(clientId);

          if (client) {
            yield* Ref.update(clientsRef, (clients) => {
              const newClients = new Map(clients);
              newClients.delete(clientId);
              return newClients;
            });

            yield* PubSub.publish(pubsub, {
              _tag: "user_left",
              clientId,
              disconnectedAt: Date.now(),
            });

            yield* Effect.log(`Client removed: ${clientId}`);
          }
        });

      const setStatus = (
        clientId: typeof ClientId.Type,
        status: ClientStatus,
      ) =>
        Effect.gen(function* () {
          const clients = yield* Ref.get(clientsRef);
          const client = clients.get(clientId);

          if (client) {
            const updatedClient: ClientInfo = {
              ...client,
              status,
            };

            yield* Ref.update(clientsRef, (clients) => {
              const newClients = new Map(clients);
              newClients.set(clientId, updatedClient);
              return newClients;
            });

            // Broadcast status_changed to all clients
            yield* PubSub.publish(pubsub, {
              _tag: "status_changed",
              clientId,
              status,
              changedAt: Date.now(),
            });

            yield* Effect.log(`Client ${clientId} status changed to ${status}`);
          }
        });

      const getClients = () =>
        Effect.gen(function* () {
          const clients = yield* Ref.get(clientsRef);
          return Array.from(clients.values());
        });

      const subscribe = () => PubSub.subscribe(pubsub);

      return {
        pubsub,
        generateClientId,
        addClient,
        removeClient,
        setStatus,
        getClients,
        subscribe,
      };
    }),
  },
) {}
