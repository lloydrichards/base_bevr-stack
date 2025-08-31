import { Atom } from "@effect-atom/atom-react";
import type { TickEvent } from "@repo/domain";
import { Effect, Stream } from "effect";
import { RpcClient } from "./rpc-client";

const runtime = Atom.runtime(RpcClient.Default);

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
          { text: string; event: typeof TickEvent.Type }
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
