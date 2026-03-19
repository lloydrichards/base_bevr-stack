import { Result, useAtom, useAtomSet } from "@effect-atom/atom-react";
import type {
  ClientId,
  ClientInfo,
  ClientStatus,
  WebSocketEvent,
} from "@repo/domain/WebSocket";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  presenceSubscriptionAtom,
  WebSocketClient,
} from "../../lib/web-socket-client";

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

export function PresencePanel({ className }: { className?: string }) {
  const [eventsResult, startSubscription] = useAtom(presenceSubscriptionAtom);

  const setStatus = useAtomSet(WebSocketClient.mutation("setStatus"));

  useEffect(() => {
    startSubscription();
  }, [startSubscription]);

  const events = Result.getOrElse(
    eventsResult,
    () => [] as readonly WebSocketEvent[],
  );

  const { clients: clientMap, myClientId } = useMemo(
    () => buildClientListFromEvents(events),
    [events],
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
    <div
      className={cn(
        "flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-lg">
          WebSocket Presence (RPC)
        </h3>
        <span
          className={`text-sm font-medium ${
            isConnected
              ? "text-green-600"
              : isConnecting
                ? "text-yellow-600"
                : "text-destructive"
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
            <div className="rounded bg-destructive/10 p-2 text-destructive text-sm">
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
      <div className="rounded border border-border bg-muted/50 p-3">
        <h4 className="mb-2 font-medium text-foreground text-sm">
          Connected Clients ({clients.length})
        </h4>
        {clients.length === 0 ? (
          <p className="text-muted-foreground text-sm">No clients connected</p>
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
                <span className="font-mono text-muted-foreground">
                  {client.clientId.slice(0, 8)}...
                </span>
                <span className="text-muted-foreground">({client.status})</span>
                {client.clientId === myClientId && (
                  <span className="text-primary text-xs">(you)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
