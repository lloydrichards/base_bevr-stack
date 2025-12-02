import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
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
