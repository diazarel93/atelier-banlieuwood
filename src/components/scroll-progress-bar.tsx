"use client";

import { useEffect, useRef } from "react";

export function ScrollProgressBar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (el) el.style.width = total > 0 ? `${(scrolled / total) * 100}%` : "0%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 h-[2px] z-[400] w-0 pointer-events-none"
      style={{ background: "linear-gradient(90deg, #FF6B35, #D4A843, #4ECDC4)" }}
    />
  );
}
