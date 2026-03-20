import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import type { Atom } from "@effect-atom/atom-react";
import { Api, type ApiResponse } from "@repo/domain/Api";
import { Effect } from "effect";
import { runtime } from "../atom";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:9000";

export const helloAtom: Atom.AtomResultFn<
  void,
  typeof ApiResponse.Type,
  unknown
> = runtime.fn(() =>
  Effect.gen(function* () {
    const client = yield* HttpApiClient.make(Api, {
      baseUrl: SERVER_URL,
    });
    return yield* client.hello.get();
  }).pipe(Effect.provide(FetchHttpClient.layer)),
);
