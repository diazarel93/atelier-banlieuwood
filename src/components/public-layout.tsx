"use client";

import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh bg-[#0a0a16] text-[#f0f0f8]"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      <SiteNavbar />
      {children}
      <SiteFooter />
    </div>
  );
}
