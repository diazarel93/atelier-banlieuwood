"use client";

import { useRef, useCallback } from "react";

type SwipeDirection = "left" | "right" | "up" | "down";

interface UseSwipeOptions {
  onSwipe: (direction: SwipeDirection) => void;
  /** Minimum distance in px to count as a swipe (default: 50) */
  threshold?: number;
}

/**
 * Touch swipe detection hook.
 * Returns handlers to attach to a container element.
 */
export function useSwipe({ onSwipe, threshold = 50 }: UseSwipeOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!startRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startRef.current.x;
      const dy = touch.clientY - startRef.current.y;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Must exceed threshold and be more horizontal than vertical (or vice versa)
      if (absDx > threshold && absDx > absDy) {
        onSwipe(dx > 0 ? "right" : "left");
      } else if (absDy > threshold && absDy > absDx) {
        onSwipe(dy > 0 ? "down" : "up");
      }

      startRef.current = null;
    },
    [onSwipe, threshold]
  );

  return { onTouchStart, onTouchEnd };
}
