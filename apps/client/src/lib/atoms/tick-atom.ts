import type { TickEvent } from "@repo/domain/Rpc";
import { Effect, Stream } from "effect";
import type { Atom } from "effect/unstable/reactivity";
import { runtime } from "../atom";
import { RpcClient } from "../rpc-client";

export const tickAtom: Atom.AtomResultFn<
  { readonly abort?: boolean },
  { text: string; event: typeof TickEvent.Type },
  unknown
> = runtime.fn(({ abort = false }: { readonly abort?: boolean }) => {
  if (abort) {
    return Stream.empty;
  }

  return Stream.unwrap(
    Effect.gen(function* () {
      yield* Effect.logDebug("Starting Tick Atom Stream");
      const rpc = yield* RpcClient;
      return rpc.client.tick({ ticks: 10 });
    }),
  ).pipe(
    Stream.mapAccum(
      () => ({ acc: "" }),
      (
        state,
        event,
      ): readonly [
        { acc: string },
        readonly [{ text: string; event: typeof TickEvent.Type }],
      ] => {
        switch (event._tag) {
          case "starting": {
            const startAcc = "Start";
            return [{ acc: startAcc }, [{ text: startAcc, event }]] as const;
          }
          case "tick": {
            const tickAcc = `${state.acc}.`;
            return [{ acc: tickAcc }, [{ text: tickAcc, event }]] as const;
          }
          case "end": {
            const endAcc = `${state.acc} End`;
            return [{ acc: endAcc }, [{ text: endAcc, event }]] as const;
          }
        }
      },
    ),
  );
});
