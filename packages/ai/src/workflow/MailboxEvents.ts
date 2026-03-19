import type { ChatStreamPart } from "@repo/domain/Chat";
import { Effect, type Mailbox } from "effect";

/**
 * MailboxEvents - Typed event emitter for ChatStreamPart
 * Provides high-level methods for common event patterns to eliminate boilerplate
 */
export const createMailboxEvents = (
  mailbox: Mailbox.Mailbox<typeof ChatStreamPart.Type>,
) =>
  ({
    thinking: (message: string) => mailbox.offer({ _tag: "thinking", message }),
    iterationStart: (iteration: number) =>
      mailbox.offer({ _tag: "iteration-start", iteration }),
    iterationEnd: (iteration: number) =>
      mailbox.offer({ _tag: "iteration-end", iteration }),
    textDelta: (delta: string) => mailbox.offer({ _tag: "text-delta", delta }),
    textComplete: () => mailbox.offer({ _tag: "text-complete" }),
    toolCall: (
      id: string,
      params: {
        name: string;
        description?: string;
        arguments: unknown;
      },
    ) =>
      Effect.gen(function* () {
        // Start
        yield* mailbox.offer({
          _tag: "tool-call-start",
          id,
          name: params.name,
          description: params.description,
        });

        // Delta (stream arguments as JSON)
        const argsJson = JSON.stringify(params.arguments, null, 2);
        yield* mailbox.offer({
          _tag: "tool-call-delta",
          id,
          argumentsDelta: argsJson,
        });

        // Complete
        yield* mailbox.offer({
          _tag: "tool-call-complete",
          id,
          name: params.name,
          arguments: params.arguments,
        });
      }),
    toolCallStart: (
      id: string,
      params: {
        name: string;
        description?: string;
      },
    ) =>
      mailbox.offer({
        _tag: "tool-call-start",
        id,
        name: params.name,
        description: params.description,
      }),
    toolCallDelta: (id: string, params: { argumentsDelta: string }) =>
      mailbox.offer({
        _tag: "tool-call-delta",
        id,
        argumentsDelta: params.argumentsDelta,
      }),
    toolCallComplete: (
      id: string,
      params: {
        name: string;
        arguments: unknown;
      },
    ) =>
      mailbox.offer({
        _tag: "tool-call-complete",
        id,
        name: params.name,
        arguments: params.arguments,
      }),
    toolExecution: (
      id: string,
      params: {
        name: string;
        result: string;
        success: boolean;
      },
    ) =>
      Effect.gen(function* () {
        yield* mailbox.offer({
          _tag: "tool-execution-start",
          id,
          name: params.name,
        });

        yield* mailbox.offer({
          _tag: "tool-execution-complete",
          id,
          name: params.name,
          result: params.result,
          success: params.success,
        });
      }),
    toolExecutionStart: (id: string, params: { name: string }) =>
      mailbox.offer({
        _tag: "tool-execution-start",
        id,
        name: params.name,
      }),
    toolExecutionComplete: (
      id: string,
      params: {
        name: string;
        result: string;
        success: boolean;
      },
    ) =>
      mailbox.offer({
        _tag: "tool-execution-complete",
        id,
        name: params.name,
        result: params.result,
        success: params.success,
      }),
    finish: (
      finishReason: string,
      usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      },
    ) =>
      mailbox.offer({
        _tag: "finish",
        finishReason,
        usage,
      }),
    error: (message: string, recoverable = false) =>
      mailbox.offer({ _tag: "error", message, recoverable }),
    end: mailbox.end,
  }) as const;
