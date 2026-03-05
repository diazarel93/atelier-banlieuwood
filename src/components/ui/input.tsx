import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full min-w-0 rounded-xl border border-white/[0.08] bg-bw-elevated/50 px-4 py-3 text-sm text-bw-heading shadow-bw-xs transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-bw-text",
        "placeholder:text-bw-placeholder",
        "selection:bg-bw-primary/20 selection:text-bw-heading",
        "hover:border-white/[0.18] hover:bg-[rgba(30,33,48,0.6)]",
        "focus:outline-none focus:border-bw-primary focus:ring-[3px] focus:ring-bw-primary/15 focus:shadow-[0_0_0_3px_rgba(255,107,53,0.1)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-bw-danger aria-invalid:ring-[3px] aria-invalid:ring-bw-danger/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
