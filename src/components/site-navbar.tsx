"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 transition-all duration-300"
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
        <span className="text-base font-extrabold bg-gradient-to-r from-[#FF6B35] to-[#D4A843] bg-clip-text text-transparent">
          BANLIEUWOOD
        </span>
      </Link>
      <div className="hidden md:flex items-center gap-1.5">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#94a3b8] hover:text-[#f0f0f8] transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={ROUTES.login}
          className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#f0f0f8] bg-[#141210] border border-[#2a2420] hover:border-[#FF6B35] transition-all"
        >
          Connexion
        </Link>
        <Link
          href={ROUTES.requestAccess}
          className="px-5 py-2 rounded-lg text-[13px] font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#D4A843] shadow-[0_4px_16px_rgba(255,107,53,0.3)] hover:shadow-[0_6px_24px_rgba(255,107,53,0.4)] hover:scale-[1.03] transition-all"
        >
          S&apos;inscrire
        </Link>
      </div>
    </nav>
  );
}
