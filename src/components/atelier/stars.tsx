"use client";

import { memo } from "react";
import { Star } from "lucide-react";

export const Stars = memo(function Stars({
  count,
  size = "sm",
}: {
  count: number;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const cls = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-7 w-7",
    xl: "h-10 w-10",
  }[size];
  return (
    <span className="inline-flex gap-1">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={`${cls} transition-all duration-500 ${
            i <= count
              ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
              : "text-muted-foreground/15"
          }`}
        />
      ))}
    </span>
  );
});
