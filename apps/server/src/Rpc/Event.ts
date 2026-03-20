import { Prompt } from "@effect/ai";
import { ChatService } from "@repo/ai";
import { EventRpc, type TickEvent } from "@repo/domain/Rpc";
import { Effect, Mailbox } from "effect";

export const EventRpcLive = EventRpc.toLayer(
  Effect.gen(function* () {
    const bot = yield* ChatService;
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
    };
  }),
);
