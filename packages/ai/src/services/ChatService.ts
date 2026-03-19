import { Chat, Prompt, Toolkit } from "@effect/ai";
import type { ChatStreamPart } from "@repo/domain/Chat";
import { Cause, Effect, Mailbox, String } from "effect";
import { SampleToolkit } from "../toolkits/SampleToolkit";
import { runAgenticLoop } from "../workflow/AgenticLoop";

export class ChatService extends Effect.Service<ChatService>()("ChatService", {
  scoped: Effect.gen(function* () {
    const chat = Effect.fn("craftsman")(function* (
      history: Array<Prompt.Message>,
    ) {
      // Create mailbox for streaming events
      const mailbox = yield* Mailbox.make<typeof ChatStreamPart.Type>();

      // Fork the agentic loop to run in background
      yield* Effect.forkScoped(
        Effect.gen(function* () {
          yield* Effect.log(
            `[craftsman] Creating chat with ${1 + history.length} messages`,
          );
          const systemMessage = String.stripMargin(`
              |You are a helpful general assistant.
              |You have access to tools and should use them when appropriate.
              |Be concise and direct in your responses.
            `);

          const session = yield* Chat.fromPrompt(
            Prompt.make(history).pipe(Prompt.setSystem(systemMessage)),
          );

          yield* Effect.log(
            Prompt.make(history).pipe(Prompt.setSystem(systemMessage)),
          );
          yield* Effect.log(yield* session.exportJson);

          const toolkit = yield* Toolkit.merge(SampleToolkit);

          yield* runAgenticLoop({
            chat: session,
            mailbox,
            toolkit,
          });
        }).pipe(
          Effect.ensuring(mailbox.end),
          Effect.catchAllCause((cause) =>
            Effect.gen(function* () {
              yield* Effect.logError(`Agentic loop error: ${cause}`);
              yield* mailbox.offer({
                _tag: "error",
                message: `System error: ${Cause.pretty(cause)}`,
                recoverable: false,
              });
              yield* mailbox.end;
            }),
          ),
        ),
      );

      return mailbox;
    });

    return { chat } as const;
  }),
}) {}
