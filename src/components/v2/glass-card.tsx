"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "rounded-2xl bg-white transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--color-bw-border)] shadow-[0_4px_16px_rgba(107,70,193,0.05),0_1px_3px_rgba(0,0,0,0.03)]",
        elevated:
          "border border-[var(--color-bw-border)] shadow-[0_8px_24px_rgba(107,70,193,0.07),0_2px_6px_rgba(0,0,0,0.03)]",
        flat:
          "border border-[var(--color-bw-border-subtle)]",
        ghost:
          "border border-transparent hover:border-[var(--color-bw-border-subtle)] hover:bg-white/60",
      },
      hover: {
        true: "hover:border-[rgba(107,70,193,0.15)] hover:shadow-[0_8px_24px_rgba(107,70,193,0.08),0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-0.5",
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
