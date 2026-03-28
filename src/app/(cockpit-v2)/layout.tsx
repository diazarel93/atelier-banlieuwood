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
    "theme-color": "#EEEAF6",
  },
};

export default function CockpitV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-lavande min-h-dvh bg-[var(--background)]">
      {/* V2: Light theme by default — clear any old dark preference */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{var el=document.currentScript.parentElement;el.removeAttribute("data-theme");localStorage.setItem("bw-theme","light")}catch(e){}`,
        }}
      />
      <AppShellV2>
        <ErrorBoundary>{children}</ErrorBoundary>
      </AppShellV2>
    </div>
  );
}
