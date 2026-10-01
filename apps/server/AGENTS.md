# Server AGENTS.md

> See root `/AGENTS.md` for monorepo conventions.

## Commands

| Command                                            | Purpose                  |
| -------------------------------------------------- | ------------------------ |
| `bun run dev --filter=server`                      | Start server (port 9000) |
| `bun run test --filter=server`                     | Run server tests         |
| `bun run test --filter=server -- src/file.test.ts` | Run single test          |

## Effect service pattern

Use `Context.Service` with an explicit layer. See
[`PresenceService`](../../packages/presence/src/services/PresenceService.ts) and
[`ChatService`](../../packages/ai/src/services/ChatService.ts).

```typescript
import { Context, Effect, Layer, Ref } from "effect";

export class MyService extends Context.Service<MyService>()("MyService", {
  make: Effect.gen(function* () {
    const ref = yield* Ref.make(0);
    return {
      getData: () => Effect.gen(function* () {
        return yield* Ref.get(ref);
      }),
    };
  }),
}) {
  static layer = Layer.effect(MyService)(MyService.make);
}
```

## RPC implementation pattern

Use `RpcGroup.toLayer` and the group's `of` method to define handlers.
See [`EventRpcLive`](src/Rpc/Event.ts) for HTTP streams and
[`PresenceRpcLive`](src/Rpc/Presence.ts) for WebSocket presence.

Finite RPC streams return `Queue.Queue<Event, Cause.Done>`. End them with
`Queue.end` so consumers receive buffered events before completion.

```typescript
import { type Cause, Effect, Queue } from "effect";

const makeStream = Effect.gen(function* () {
  const queue = yield* Queue.unbounded<string, Cause.Done>();
  yield* Effect.forkScoped(
    Effect.gen(function* () {
      yield* Queue.offer(queue, "start");
      yield* Queue.offer(queue, "end");
    }).pipe(Effect.ensuring(Queue.end(queue))),
  );
  return queue;
});
```

`Effect.forkScoped` ties producers to the request scope. Acquire PubSub
subscriptions before publishing events that those subscriptions must receive.

## Layer composition

[`src/index.ts`](src/index.ts) composes the server:

- `HttpApiBuilder.layer(Api)` from `effect/http-api` provides REST routes.
- `RpcServer.layerHttp` from `effect/rpc` provides HTTP and WebSocket RPC routes.
- `HttpRouter.serve` from `effect/http` serves the merged routes.
- `BunHttpServer.layerConfig` provides the Bun HTTP server.
- `ChatService.layer`, `SampleToolkitLive`, and `FastModelLive` provide chat.

## Configuration

Copy the root `.env.example` to `apps/server/.env` and set
`ANTHROPIC_API_KEY` before starting the server. The AI layer requires the key
at startup, even when you only use REST or presence.


```typescript
const ServerConfig = Config.all({
  port: Config.Number("PORT").pipe(Config.withDefault(9000)),
  hostname: Config.String("HOST").pipe(Config.withDefault("0.0.0.0")),
});
```

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._
