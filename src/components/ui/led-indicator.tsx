import * as React from "react";
import { cn } from "@/lib/utils";

type LedStatus = "active" | "working" | "idle" | "offline";

interface LedIndicatorProps extends React.ComponentProps<"span"> {
  status: LedStatus;
}

const statusClasses: Record<LedStatus, string> = {
  active: "led-active",
  working: "led-working",
  idle: "led-idle",
  offline: "led-offline",
};

function LedIndicator({ status, className, ...props }: LedIndicatorProps) {
  return (
    <span
      data-slot="led-indicator"
      data-status={status}
      className={cn(statusClasses[status], className)}
      {...props}
    />
  );
}

export { LedIndicator };
export type { LedStatus };
