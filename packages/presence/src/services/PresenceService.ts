import {
  ClientId,
  type ClientInfo,
  type ClientStatus,
  type WebSocketEvent,
} from "@repo/domain/WebSocket";
import { Context, DateTime, Effect, Layer, PubSub, Ref } from "effect";

export type PresenceEventType = typeof WebSocketEvent.Type;

export class PresenceService extends Context.Service<PresenceService>()(
  "PresenceService",
  {
    make: Effect.gen(function* () {
      yield* Effect.logInfo("Initializing PresenceService");

      const clientsRef = yield* Ref.make(
        new Map<typeof ClientId.Type, ClientInfo>(),
      );
      const pubsub = yield* PubSub.sliding<PresenceEventType>(1000);

      const generateClientId = () => ClientId.make(crypto.randomUUID());

      const addClient = Effect.fn("PresenceService.addClient")(function* (
        clientId: typeof ClientId.Type,
        info: ClientInfo,
      ) {
        yield* Ref.update(clientsRef, (clients) => {
          const newClients = new Map(clients);
          newClients.set(clientId, info);
          return newClients;
        });

        yield* PubSub.publish(pubsub, {
          _tag: "user_joined",
          client: info,
        });

        yield* Effect.logDebug(`Client added: ${clientId}`);
      });

      const removeClient = Effect.fn("PresenceService.removeClient")(function* (
        clientId: typeof ClientId.Type,
      ) {
        const clients = yield* Ref.get(clientsRef);
        const client = clients.get(clientId);

        if (client) {
          const disconnectedAt = yield* DateTime.now;

          yield* Ref.update(clientsRef, (clients) => {
            const newClients = new Map(clients);
            newClients.delete(clientId);
            return newClients;
          });

          yield* PubSub.publish(pubsub, {
            _tag: "user_left",
            clientId,
            disconnectedAt,
          });

          yield* Effect.logDebug(`Client removed: ${clientId}`);
        }
      });

      const setStatus = Effect.fn("PresenceService.setStatus")(function* (
        clientId: typeof ClientId.Type,
        status: ClientStatus,
      ) {
        const clients = yield* Ref.get(clientsRef);
        const client = clients.get(clientId);

        if (client) {
          const changedAt = yield* DateTime.now;
          const updatedClient: ClientInfo = {
            ...client,
            status,
          };

          yield* Ref.update(clientsRef, (clients) => {
            const newClients = new Map(clients);
            newClients.set(clientId, updatedClient);
            return newClients;
          });

          yield* PubSub.publish(pubsub, {
            _tag: "status_changed",
            clientId,
            status,
            changedAt,
          });

          yield* Effect.logDebug(
            `Client ${clientId} status changed to ${status}`,
          );
        }
      });

      const getClients = Effect.fn("PresenceService.getClients")(function* () {
        const clients = yield* Ref.get(clientsRef);
        return Array.from(clients.values());
      });

      const subscribe = Effect.fn("PresenceService.subscribe")(() =>
        PubSub.subscribe(pubsub).pipe(Effect.scoped),
      );

      return {
        pubsub,
        generateClientId,
        addClient,
        removeClient,
        setStatus,
        getClients,
        subscribe,
      } as const;
    }),
  },
) {
  static layer = Layer.effect(PresenceService)(PresenceService.make);
}
