"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-bw-elevated",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          background: "linear-gradient(90deg, #FF6B35, #D4A843)",
          boxShadow: "0 0 12px rgba(255, 107, 53, 0.4), 0 0 4px rgba(212, 168, 67, 0.3)",
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
