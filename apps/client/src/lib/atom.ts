import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import { Atom } from "@effect-atom/atom-react";
import { Api, type TickEvent } from "@repo/domain";
import { Effect, Stream } from "effect";
import { RpcClient } from "./rpc-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:9000";

const runtime = Atom.runtime(RpcClient.Default);

export const helloAtom = runtime.fn(() =>
  Effect.gen(function* () {
    const client = yield* HttpApiClient.make(Api, {
      baseUrl: SERVER_URL,
    });
    return yield* client.hello.get();
  }).pipe(Effect.provide(FetchHttpClient.layer))
);
export const tickAtom = runtime.fn(
  ({ abort = false }: { readonly abort?: boolean }) =>
    Stream.unwrap(
      Effect.gen(function* () {
        yield* Effect.log("Starting Tick Atom Stream");
        const rpc = yield* RpcClient;
        return rpc.client.tick({ ticks: 10 });
      }).pipe((self) => (abort ? Effect.interrupt : self))
    ).pipe(
      Stream.catchTags({
        RpcClientError: Effect.die,
      }),
      Stream.mapAccum(
        { acc: "" },
        (
          state,
          event
        ): readonly [
          { acc: string },
          { text: string; event: typeof TickEvent.Type },
        ] => {
          switch (event._tag) {
            case "starting": {
              const startAcc = "Start";
              return [{ acc: startAcc }, { text: startAcc, event }] as const;
            }
            case "tick": {
              const tickAcc = `${state.acc}.`;
              return [{ acc: tickAcc }, { text: tickAcc, event }] as const;
            }
            case "end": {
              const endAcc = `${state.acc} End`;
              return [{ acc: endAcc }, { text: endAcc, event }] as const;
            }
            default:
              return [state, { text: state.acc, event }] as const;
          }
        }
      )
    )
);
