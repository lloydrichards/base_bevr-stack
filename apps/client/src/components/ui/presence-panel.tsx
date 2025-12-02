import { Result, useAtom, useAtomSet } from "@effect-atom/atom-react";
import type {
  ClientId,
  ClientInfo,
  ClientStatus,
  WebSocketEvent,
} from "@repo/domain/WebSocket";
import { useEffect, useMemo } from "react";
import { WebSocketClient } from "../../lib/web-socket-client";

/**
 * Build the current client list by replaying all events from the stream.
 * This gives us real-time updates without needing a separate query.
 */
const buildClientListFromEvents = (
  events: readonly WebSocketEvent[],
): {
  clients: Map<typeof ClientId.Type, ClientInfo>;
  myClientId: typeof ClientId.Type | null;
} => {
  const clients = new Map<typeof ClientId.Type, ClientInfo>();
  let myClientId: typeof ClientId.Type | null = null;

  for (const event of events) {
    switch (event._tag) {
      case "connected":
        myClientId = event.clientId;
        clients.set(event.clientId, {
          clientId: event.clientId,
          status: "online",
          connectedAt: event.connectedAt,
        });
        break;

      case "user_joined":
        clients.set(event.client.clientId, event.client);
        break;

      case "status_changed": {
        const existing = clients.get(event.clientId);
        if (existing) {
          clients.set(event.clientId, {
            ...existing,
            status: event.status,
          });
        }
        break;
      }

      case "user_left":
        clients.delete(event.clientId);
        break;
    }
  }

  return { clients, myClientId };
};

export function PresencePanel() {
  const [eventsResult, pullNext] = useAtom(
    WebSocketClient.query("subscribe", {}),
  );

  const setStatus = useAtomSet(WebSocketClient.mutation("setStatus"));

  const streamData = Result.getOrElse(eventsResult, () => ({
    done: false,
    items: [],
  }));

  useEffect(() => {
    if (Result.isSuccess(eventsResult) && !streamData.done) {
      const timeoutId = setTimeout(() => {
        pullNext();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
    return;
  }, [eventsResult, streamData.done, pullNext]);

  const { clients: clientMap, myClientId } = useMemo(
    () => buildClientListFromEvents(streamData.items),
    [streamData.items],
  );

  const clients = useMemo(() => Array.from(clientMap.values()), [clientMap]);

  // Handle status change
  const handleSetStatus = (status: ClientStatus) => {
    if (!myClientId) {
      console.error("Cannot set status: not connected yet");
      return;
    }
    setStatus({
      payload: { clientId: myClientId, status },
    });
  };

  // Helper functions
  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const isConnected = Result.isSuccess(eventsResult);
  const isConnecting = Result.isInitial(eventsResult);
  const hasError = Result.isFailure(eventsResult);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-lg">
          WebSocket Presence (RPC)
        </h3>
        <span
          className={`text-sm font-medium ${
            isConnected
              ? "text-green-600"
              : isConnecting
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          {isConnected && myClientId
            ? `connected (${myClientId.slice(0, 8)}...)`
            : isConnecting
              ? "connecting..."
              : "disconnected"}
        </span>
      </div>

      {/* Error Display */}
      {hasError &&
        Result.match(eventsResult, {
          onInitial: () => null,
          onSuccess: () => null,
          onFailure: (error) => (
            <div className="rounded bg-red-100 p-2 text-red-700 text-sm">
              Error: {String(error)}
            </div>
          ),
        })}

      {/* Status Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleSetStatus("online")}
          className="flex-1 rounded bg-green-500 px-3 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-50"
          disabled={!isConnected || !myClientId}
        >
          Online
        </button>
        <button
          type="button"
          onClick={() => handleSetStatus("away")}
          className="flex-1 rounded bg-yellow-500 px-3 py-2 text-sm text-white hover:bg-yellow-600 disabled:opacity-50"
          disabled={!isConnected || !myClientId}
        >
          Away
        </button>
        <button
          type="button"
          onClick={() => handleSetStatus("busy")}
          className="flex-1 rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50"
          disabled={!isConnected || !myClientId}
        >
          Busy
        </button>
      </div>

      {/* Connected Clients */}
      <div className="rounded border border-gray-100 bg-gray-50 p-3">
        <h4 className="mb-2 font-medium text-gray-700 text-sm">
          Connected Clients ({clients.length})
        </h4>
        {clients.length === 0 ? (
          <p className="text-gray-500 text-sm">No clients connected</p>
        ) : (
          <ul className="space-y-1">
            {clients.map((client: ClientInfo) => (
              <li
                key={client.clientId}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className={`h-2 w-2 rounded-full ${getStatusColor(
                    client.status,
                  )}`}
                />
                <span className="font-mono text-gray-600">
                  {client.clientId.slice(0, 8)}...
                </span>
                <span className="text-gray-400">({client.status})</span>
                {client.clientId === myClientId && (
                  <span className="text-blue-500 text-xs">(you)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
