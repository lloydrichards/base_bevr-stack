import { FetchHttpClient } from "@effect/platform";
import { RpcClient as EffectRpcClient, RpcSerialization } from "@effect/rpc";
import { EventRpc } from "@repo/domain";
import { Effect, Layer } from "effect";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:9000";

const ProtocolLive = EffectRpcClient.layerProtocolHttp({
  url: `${SERVER_URL}/rpc`,
}).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(RpcSerialization.layerNdjson)
);

export class RpcClient extends Effect.Service<RpcClient>()("RpcClient", {
  dependencies: [ProtocolLive],
  scoped: Effect.gen(function* () {
    return {
      client: yield* EffectRpcClient.make(EventRpc),
    } as const;
  }),
}) {}
