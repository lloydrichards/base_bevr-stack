import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic";
import { FetchHttpClient } from "@effect/platform";
import { Config, Layer } from "effect";

const AnthropicLive = AnthropicClient.layerConfig({
  apiKey: Config.redacted("ANTHROPIC_API_KEY"),
}).pipe(Layer.provide(FetchHttpClient.layer));

export const SmartModelLive = AnthropicLanguageModel.layer({
  model: "claude-sonnet-4-5",
}).pipe(Layer.provide(AnthropicLive));

export const FastModelLive = AnthropicLanguageModel.layer({
  model: "claude-haiku-4-5",
}).pipe(Layer.provide(AnthropicLive));
