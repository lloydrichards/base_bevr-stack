import type * as React from "react";

export type ResponseState = "loading" | "completed" | "error";

type ResponseCardProps = {
  title: string;
  state?: ResponseState;
  children: React.ReactNode;
};

const stateStyles = {
  loading: {
    container: "border-blue-200 bg-blue-50",
    dot: "bg-blue-500",
    text: "text-blue-800",
    subText: "text-blue-700",
  },
  completed: {
    container: "border-green-200 bg-green-50",
    dot: "bg-green-500",
    text: "text-green-800",
    subText: "text-green-700",
  },
  error: {
    container: "border-red-200 bg-red-50",
    dot: "bg-red-500",
    text: "text-red-800",
    subText: "text-red-700",
  },
} as const;

const stateLabels = {
  loading: "Event Received",
  completed: "Success",
  error: "Error",
} as const;

export function ResponseCard({ title, state, children }: ResponseCardProps) {
  return (
    <div className="min-h-42 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h4 className="mb-3 font-medium text-gray-700 text-sm uppercase tracking-wide">
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
        <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
          {children}
        </div>
      )}
    </div>
  );
}
