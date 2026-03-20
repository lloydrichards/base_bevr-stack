import { HttpApiBuilder } from "@effect/platform";
import { Api } from "@repo/domain/Api";
import { Effect } from "effect";

export const HealthGroupLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.handle("get", () => Effect.succeed("Hello Effect!")),
);
