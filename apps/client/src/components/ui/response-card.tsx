import type * as React from "react";
import { cn } from "@/lib/utils";

export type ResponseState = "loading" | "completed" | "error";

type ResponseCardProps = {
  title: string;
  state?: ResponseState;
  children: React.ReactNode;
  className?: string;
};

const stateStyles = {
  loading: {
    container: "border-primary/30 bg-primary/10",
    dot: "bg-blue-500",
    text: "text-primary",
    subText: "text-primary",
  },
  completed: {
    container: "border-primary/30 bg-primary/10",
    dot: "bg-green-500",
    text: "text-primary",
    subText: "text-primary",
  },
  error: {
    container: "border-destructive/40 bg-destructive/10",
    dot: "bg-red-500",
    text: "text-destructive",
    subText: "text-destructive",
  },
} as const;

const stateLabels = {
  loading: "Event Received",
  completed: "Success",
  error: "Error",
} as const;

export function ResponseCard({
  title,
  state,
  children,
  className,
}: ResponseCardProps) {
  return (
    <div
      className={cn(
        "min-h-42 rounded-lg border border-border bg-card p-4 text-card-foreground",
        className,
      )}
    >
      <h4 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wide">
        {title}
      </h4>
      {state ? (
        <div
          className={`rounded-md border p-4 ${stateStyles[state].container}`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`mt-1.5 h-2 w-2 rounded-full ${stateStyles[state].dot}`}
            />
            <div className="flex-1">
              <p className={`font-medium text-sm ${stateStyles[state].text}`}>
                {stateLabels[state]}
              </p>
              <div className={`mt-2 text-xs ${stateStyles[state].subText}`}>
                {children}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          {children}
        </div>
      )}
    </div>
  );
}
