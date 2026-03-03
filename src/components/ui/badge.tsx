import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
  {
    variants: {
      variant: {
        // Primary -- orange
        default:
          "bg-bw-primary/10 text-bw-primary",
        primary:
          "bg-bw-primary/10 text-bw-primary",
        // Teal -- success, players
        teal:
          "bg-bw-teal/10 text-bw-teal",
        // Gold -- cinema, prestige
        gold:
          "bg-bw-gold/10 text-bw-gold",
        // Violet -- AI, accent
        violet:
          "bg-bw-violet/10 text-bw-violet",
        // Pink -- emotion
        pink:
          "bg-bw-pink/10 text-bw-pink",
        // Amber -- warning
        amber:
          "bg-bw-amber/10 text-bw-amber",
        // Green -- completed
        green:
          "bg-bw-green/10 text-bw-green",
        // Danger -- error
        danger:
          "bg-bw-danger/10 text-bw-danger",
        // Ghost -- ultra-subtle
        ghost:
          "bg-white/[0.04] text-bw-muted",
        // Secondary -- muted neutral
        secondary:
          "bg-bw-surface text-bw-muted",
        // Outline -- border only
        outline:
          "border border-white/[0.08] text-bw-text bg-transparent",
        // Solid fills
        "primary-solid":
          "bg-bw-primary text-white",
        "teal-solid":
          "bg-bw-teal text-white",
        "gold-solid":
          "bg-bw-gold text-white",
        "violet-solid":
          "bg-bw-violet text-white",
        destructive:
          "bg-bw-danger text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
