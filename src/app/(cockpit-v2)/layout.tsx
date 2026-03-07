import type { Metadata } from "next";
import { AppShellV2 } from "@/components/v2/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Cockpit — Banlieuwood",
    template: "%s | Cockpit",
  },
  robots: { index: false, follow: false },
};

export default function CockpitV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-lavande min-h-dvh bg-[var(--background)]">
      <AppShellV2>{children}</AppShellV2>
    </div>
  );
}
