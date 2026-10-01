import { randomUUID } from "node:crypto";
import { ClientId } from "@repo/domain/WebSocket";
import { Context, Effect, Layer } from "effect";

export class ClientGenerator extends Context.Service<ClientGenerator>()(
  "ClientGenerator",
  {
    make: Effect.succeed({
      generateClientId: Effect.fn("generateClientId")(function* () {
        const uuid = yield* Effect.sync(() => randomUUID());
        return ClientId.make(uuid);
      }),
    }),
  },
) {
  static layer = Layer.effect(ClientGenerator)(ClientGenerator.make);
}
