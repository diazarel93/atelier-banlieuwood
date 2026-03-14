"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "rounded-2xl bg-card transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--color-bw-border)] glass-shadow",
        elevated:
          "border border-[var(--color-bw-border)] glass-shadow-elevated",
        flat:
          "border border-[var(--color-bw-border-subtle)]",
        ghost:
          "border border-transparent hover:border-[var(--color-bw-border-subtle)] hover:bg-card/60",
      },
      hover: {
        true: "glass-interactive hover:-translate-y-0.5 active:scale-[0.995] active:translate-y-0 active:duration-75",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: false,
    },
  }
);

interface GlassCardV2Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

export function GlassCardV2({
  className,
  variant,
  hover,
  children,
  onClick,
  ...props
}: GlassCardV2Props) {
  const isClickable = !!onClick;
  return (
    <div
      className={cn(glassCardVariants({ variant, hover }), className)}
      onClick={onClick}
      {...(isClickable && {
        role: "button",
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
          }
        },
      })}
      {...props}
    >
      {children}
    </div>
  );
}
