import { assert, it } from "@effect/vitest";
import { WebSocketRpc } from "@repo/domain/WebSocket";
import { Effect, Queue } from "effect";
import { Headers } from "effect/http";
import { Rpc, RpcMessage } from "effect/rpc";
import { PresenceRpcLive } from "./Presence";

it.effect(
  "delivers status changes published immediately after subscribing",
  () =>
    Effect.gen(function* () {
      const subscribe = yield* WebSocketRpc.accessHandler("subscribe");
      const setStatus = yield* WebSocketRpc.accessHandler("setStatus");
      const options = {
        client: new Rpc.ServerClient(1),
        requestId: RpcMessage.RequestId(1),
        headers: Headers.empty,
      };
      const result = subscribe(undefined, options);
      assert.isTrue(Effect.isEffect(result));
      if (!Effect.isEffect(result)) return;
      const events = yield* result;
      const connected = yield* Queue.take(events);
      assert.strictEqual(connected._tag, "connected");
      if (connected._tag !== "connected") return;

      yield* setStatus(
        { clientId: connected.clientId, status: "away" },
        options,
      );
      yield* Effect.yieldNow;
      yield* setStatus(
        { clientId: connected.clientId, status: "busy" },
        options,
      );

      const changed = yield* Queue.take(events);
      assert.strictEqual(changed._tag, "status_changed");
      if (changed._tag !== "status_changed") return;
      assert.strictEqual(changed.clientId, connected.clientId);
      assert.strictEqual(changed.status, "away");
      const next = yield* Queue.take(events);
      assert.strictEqual(next._tag, "status_changed");
      if (next._tag !== "status_changed") return;
      assert.strictEqual(next.status, "busy");
    }).pipe(Effect.provide(PresenceRpcLive)),
);
