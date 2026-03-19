import type { ChatResponse, MessageSegment } from "@repo/domain/Chat";
import { AlertCircle, CheckCircle, Loader2, Wrench } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

export function ToolCall({
  segment,
}: {
  segment: MessageSegment & { _tag: "tool-call" };
}) {
  return (
    <div className="max-w-full flex items-center gap-2 text-xs px-3 py-2 rounded-md bg-muted/50 border flex-wrap">
      {segment.tool.status === "executing" && (
        <Loader2 className="h-3 w-3 animate-spin" />
      )}
      {segment.tool.status === "complete" && (
        <CheckCircle className="h-3 w-3 text-green-600" />
      )}
      {segment.tool.status === "failed" && (
        <AlertCircle className="h-3 w-3 text-red-600" />
      )}
      {segment.tool.status === "proposed" && (
        <Wrench className="h-3 w-3 text-amber-600" />
      )}
      <span className="font-mono font-medium">{segment.tool.name}</span>
      {segment.tool.result && segment.tool.status === "complete" && (
        <span className="text-muted-foreground flex-1 truncate overflow-hidden break-all">
          &rarr;{" "}
          {segment.tool.result.length > 100
            ? `${segment.tool.result.slice(0, 100)}...`
            : segment.tool.result}
        </span>
      )}
    </div>
  );
}

export function TokenUsage({
  response,
}: {
  response: Pick<ChatResponse & { _tag: "complete" }, "usage" | "finishReason">;
}) {
  if (!response.usage) return null;
  return (
    <div className="flex gap-2 text-xs text-muted-foreground px-1">
      <span className="flex items-center gap-1">
        <span className="font-mono">{response.usage.totalTokens} tokens</span>
        <span className="text-muted-foreground/60">
          ({response.usage.promptTokens}&uarr; {response.usage.completionTokens}
          &darr;)
        </span>
      </span>
      <span className="text-muted-foreground/60">
        &bull; {response.finishReason}
      </span>
    </div>
  );
}

export function Segment({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1 items-start w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}
