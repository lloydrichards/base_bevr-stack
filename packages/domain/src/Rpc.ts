import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";

// Define Event RPC

export const TickEvent = Schema.Union(
  Schema.TaggedStruct("starting", {}),
  Schema.TaggedStruct("tick", {}),
  Schema.TaggedStruct("end", {}),
);

export class EventRpc extends RpcGroup.make(
  Rpc.make("tick", {
    payload: Schema.Struct({
      ticks: Schema.Number,
    }),
    success: TickEvent,
    stream: true,
  }),
) {}
