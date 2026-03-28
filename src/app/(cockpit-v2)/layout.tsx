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
      {/* Dark by default — script allows user to switch to light if stored */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{var s=localStorage.getItem("bw-theme");if(s==="light"){document.currentScript.parentElement.removeAttribute("data-theme");var m=document.querySelector('meta[name="theme-color"]');if(m)m.content="#EEEAF6"}}catch(e){}`,
        }}
      />
      <AppShellV2>
        <ErrorBoundary>{children}</ErrorBoundary>
      </AppShellV2>
    </div>
  );
}
