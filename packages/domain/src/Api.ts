import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";

export const ApiResponse = Schema.Struct({
  message: Schema.String,
  success: Schema.Literal(true),
});

// Define Domain of API
export class HealthGroup extends HttpApiGroup.make("health")
  .add(HttpApiEndpoint.get("get", "/").addSuccess(Schema.String))
  .prefix("/") {}

export class HelloGroup extends HttpApiGroup.make("hello")
  .add(HttpApiEndpoint.get("get", "/").addSuccess(ApiResponse))
  .prefix("/hello") {}

export const Api = HttpApi.make("Api").add(HealthGroup).add(HelloGroup);

// Define Event RPC
export const TickEvent = Schema.Union(
  Schema.TaggedStruct("starting", {}),
  Schema.TaggedStruct("tick", {}),
  Schema.TaggedStruct("end", {})
);

export class EventRpc extends RpcGroup.make(
  Rpc.make("tick", {
    payload: Schema.Struct({
      ticks: Schema.Number,
    }),
    success: TickEvent,
    stream: true,
  })
) {}
