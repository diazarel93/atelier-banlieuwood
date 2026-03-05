import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Mentions legales",
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bw-bg">
      {/* Sticky mini-nav */}
      <nav className="sticky top-0 z-40 h-14 flex items-center px-6 border-b border-white/[0.06]" style={{ background: "rgba(15,17,24,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-bw-muted hover:text-bw-heading transition-colors duration-150">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8L10 4" />
            </svg>
            Retour
          </Link>
          <BrandLogo size="sm" />
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        {children}
      </div>

      {/* Simple footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-xs text-bw-muted">&copy; 2026 Banlieuwood</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="text-xs text-bw-muted hover:text-bw-heading transition-colors">Confidentialite</Link>
            <Link href="/legal/cgu" className="text-xs text-bw-muted hover:text-bw-heading transition-colors">CGU</Link>
            <Link href="/legal/accessibility" className="text-xs text-bw-muted hover:text-bw-heading transition-colors">Accessibilite</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
