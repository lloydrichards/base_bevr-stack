import { ChatService } from "@repo/ai";
import { EventRpc, type TickEvent } from "@repo/domain/Rpc";
import { type Cause, Effect, Queue } from "effect";
import { Prompt } from "effect/ai";

export const EventRpcLive = EventRpc.toLayer(
  Effect.gen(function* () {
    const bot = yield* ChatService;
    yield* Effect.logInfo("Starting Event RPC Live Implementation");
    return EventRpc.of({
      tick: Effect.fn(function* (payload) {
        yield* Effect.logDebug("Creating new tick stream");
        const queue = yield* Queue.unbounded<
          typeof TickEvent.Type,
          Cause.Done
        >();
        yield* Effect.forkScoped(
          Effect.gen(function* () {
            yield* Queue.offer(queue, { _tag: "starting" });
            yield* Effect.sleep("3 seconds");
            for (let i = 0; i < payload.ticks; i++) {
              yield* Effect.sleep("1 second");
              yield* Queue.offer(queue, { _tag: "tick" });
            }
            yield* Queue.offer(queue, { _tag: "end" });
            yield* Effect.logDebug("End event sent");
          }).pipe(Effect.ensuring(Queue.end(queue))),
        );
        return queue;
      }),
      chat: ({ messages }) =>
        bot.chat(
          messages.map((msg) => {
            if (msg.role === "system") {
              return Prompt.makeMessage(msg.role, {
                content: msg.content,
              });
            }
            return Prompt.makeMessage(msg.role, {
              content: [Prompt.makePart("text", { text: msg.content })],
            });
          }),
        ),
    });
  }),
);
