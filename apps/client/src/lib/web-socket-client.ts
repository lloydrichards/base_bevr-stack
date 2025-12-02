import { BrowserSocket } from "@effect/platform-browser";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import { AtomRpc } from "@effect-atom/atom-react";
import { WebSocketRpc } from "@repo/domain/WebSocket";
import { Layer } from "effect";

const WS_URL = import.meta.env["VITE_WS_URL"] || "ws://localhost:9000/ws";

export class WebSocketClient extends AtomRpc.Tag<WebSocketClient>()(
  "WebSocketClient",
  {
    group: WebSocketRpc,
    protocol: RpcClient.layerProtocolSocket({
      retryTransientErrors: true,
    }).pipe(
      Layer.provide(BrowserSocket.layerWebSocket(WS_URL)),
      Layer.provide(RpcSerialization.layerNdjson),
    ),
  },
) {}
