"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.ComponentProps<"div"> {
  glow?: "orange" | "turquoise" | "none";
  hover?: boolean;
}

function GlassCard({
  className,
  glow = "none",
  hover = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "rounded-2xl border border-border/50 p-6 backdrop-blur-md transition-all duration-300",
        "bg-card/60 dark:bg-card/40",
        hover && "hover:-translate-y-1 hover:shadow-lg",
        glow === "orange" && "glow-orange",
        glow === "turquoise" && "glow-turquoise",
        className
      )}
      {...props}
    />
  );
}

export { GlassCard };
