"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "À Propos", href: "/projet" },
  { label: "Festival", href: "/festival" },
  { label: "Ressources", href: "/docs" },
  { label: "Contact", href: "/contact" },
];

export function SiteNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le menu mobile lors d'un changement de route
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300"
        style={{
          padding: scrolled ? "8px 24px" : "12px 24px",
          background: scrolled ? "rgba(13,11,9,0.97)" : "rgba(13,11,9,0.88)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #2a2420",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🎬</span>
          <span className="text-base font-extrabold bg-gradient-to-r from-bw-primary to-bw-gold bg-clip-text text-transparent">
            BANLIEUWOOD
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 min-h-[44px] flex items-center rounded-lg text-[13px] font-medium transition-colors ${
                pathname === link.href ? "text-bw-primary bg-bw-primary/[0.08]" : "text-white/55 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.login}
            className="hidden sm:inline-flex px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-[#141210] border border-[#2a2420] hover:border-bw-primary transition-all"
          >
            Connexion
          </Link>
          <Link
            href={ROUTES.requestAccess}
            className="px-5 py-2 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-bw-primary to-bw-gold shadow-[0_4px_20px_rgba(255,107,53,0.38)] hover:shadow-[0_6px_28px_rgba(255,107,53,0.52)] hover:scale-[1.03] transition-all"
          >
            S&apos;inscrire
          </Link>
          {/* Burger mobile */}
          <button
            className="md:hidden ml-1 w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
          >
            <span
              className={`block w-5 h-[1.5px] bg-white/70 transition-transform duration-200 ${mobileOpen ? "translate-y-[6.5px] rotate-45" : ""}`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-white/70 transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-[1.5px] bg-white/70 transition-transform duration-200 ${mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-0 left-0 right-0 pt-[60px] pb-5 px-4"
            style={{
              background: "rgba(13,11,9,0.98)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid #2a2420",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center min-h-[48px] px-4 rounded-xl text-[15px] font-medium mb-1 transition-colors ${
                  pathname === link.href
                    ? "text-bw-primary bg-bw-primary/[0.08]"
                    : "text-white/70 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-[#2a2420] flex gap-3">
              <Link
                href={ROUTES.login}
                className="flex-1 flex items-center justify-center min-h-[48px] rounded-xl text-[14px] font-medium text-white bg-[#141210] border border-[#2a2420]"
              >
                Connexion
              </Link>
              <Link
                href={ROUTES.requestAccess}
                className="flex-1 flex items-center justify-center min-h-[48px] rounded-xl text-[14px] font-bold text-white bg-gradient-to-r from-bw-primary to-bw-gold"
              >
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
