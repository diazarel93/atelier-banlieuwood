"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "en", flag: "🇬🇧", label: "EN" },
] as const;

export function LocaleSwitcher({ className }: { className?: string }) {
  const currentLocale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(locale: string) {
    if (locale === currentLocale) return;

    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-white/[0.04] border border-white/[0.06] p-0.5",
        isPending && "opacity-60 pointer-events-none",
        className
      )}
    >
      {LOCALES.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all",
            currentLocale === code
              ? "bg-white/[0.08] text-white"
              : "text-bw-muted hover:text-bw-text"
          )}
          aria-label={`Switch to ${label}`}
        >
          <span className="text-sm">{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
