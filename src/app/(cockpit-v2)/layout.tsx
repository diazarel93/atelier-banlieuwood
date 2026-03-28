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
      {/* Prevent dark-mode flash: apply stored theme before first paint */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem("bw-theme")==="dark"||(!localStorage.getItem("bw-theme")&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.currentScript.parentElement.setAttribute("data-theme","dark");var m=document.querySelector('meta[name="theme-color"]');if(m)m.content="#1a1a2e"}}catch(e){}`,
        }}
      />
      <AppShellV2>
        <ErrorBoundary>{children}</ErrorBoundary>
      </AppShellV2>
    </div>
  );
}
