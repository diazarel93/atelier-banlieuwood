import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold cursor-pointer rounded-xl outline-none transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-bw-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bw-bg active:scale-[0.97]",
  {
    variants: {
      variant: {
        // Brand primary -- orange gradient glow
        default:
          "btn-glow bg-gradient-to-br from-bw-primary to-bw-primary-500 text-white shadow-bw-glow-primary hover:shadow-[0_0_32px_rgba(255,107,53,0.45),0_6px_24px_rgba(255,107,53,0.3)] hover:brightness-110",
        // Teal -- success / confirm
        teal: "btn-glow bg-gradient-to-br from-bw-teal to-bw-teal-500 text-white shadow-bw-glow-teal hover:shadow-[0_0_32px_rgba(78,205,196,0.4),0_6px_24px_rgba(78,205,196,0.25)] hover:brightness-110",
        // Gold -- prestige
        gold: "btn-glow bg-gradient-to-br from-bw-gold to-bw-gold-500 text-white shadow-bw-glow-gold hover:shadow-[0_0_32px_rgba(212,168,67,0.35),0_6px_24px_rgba(212,168,67,0.2)] hover:brightness-110",
        // Violet -- AI actions
        violet:
          "btn-glow bg-gradient-to-br from-bw-violet to-bw-violet-500 text-white shadow-[0_0_24px_rgba(139,92,246,0.25),0_4px_16px_rgba(139,92,246,0.15)] hover:shadow-[0_0_32px_rgba(139,92,246,0.4),0_6px_24px_rgba(139,92,246,0.25)] hover:brightness-110",
        // Secondary -- surface bg
        secondary:
          "bg-bw-surface text-bw-text border border-white/[0.06] hover:bg-bw-elevated hover:border-white/[0.1] shadow-bw-sm",
        // Outline -- transparent bg, ultra-fine border
        outline:
          "border border-white/[0.08] bg-transparent text-bw-text hover:bg-white/[0.04] hover:border-white/[0.12]",
        // Ghost -- no bg, ultra-subtle hover
        ghost: "text-bw-muted bg-transparent hover:bg-white/[0.04] hover:text-bw-heading rounded-xl",
        // Destructive
        destructive:
          "btn-glow bg-bw-danger text-white hover:bg-bw-danger/90 shadow-[0_0_24px_rgba(239,68,68,0.25),0_4px_16px_rgba(239,68,68,0.15)]",
        // Link
        link: "text-bw-primary underline-offset-4 hover:underline p-0 h-auto rounded-none",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs",
        sm: "h-8 gap-1.5 rounded-lg px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-8 text-lg rounded-2xl font-bold",
        icon: "size-10",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
