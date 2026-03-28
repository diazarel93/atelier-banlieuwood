import type { Metadata } from "next";
import { AppShellV2 } from "@/components/v2/app-shell";
import { ErrorBoundary } from "@/components/error-boundary";

export const metadata: Metadata = {
  title: {
    default: "Tableau de bord — Banlieuwood",
    template: "%s | Cockpit",
  },
  robots: { index: false, follow: false },
  other: {
    "theme-color": "#0c0c18",
  },
};

export default function CockpitV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-lavande min-h-dvh bg-[var(--background)]" data-theme="dark">
      {/* V2: Dark theme — unified with landing + cockpit */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{localStorage.setItem("bw-theme","dark")}catch(e){}`,
        }}
      />
      <AppShellV2>
        <ErrorBoundary>{children}</ErrorBoundary>
      </AppShellV2>
    </div>
  );
}
