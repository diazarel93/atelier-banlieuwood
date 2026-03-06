"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { BrandLogo, BrandStyles } from "@/components/brand-logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════
   BANLIEUWOOD — Site Footer
   Premium glassmorphism footer with brand identity,
   navigation columns, social icons, and film-strip decoration.
   ═══════════════════════════════════════════════════════════════ */

/* ── Navigation Data ── */

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Produit",
    links: [
      { label: "Rejoindre", href: "/join" },
      { label: "Jouer seul", href: "/solo" },
      { label: "Cr\u00e9er une partie", href: "/create" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Fiche Cours", href: "/resources/fiche-cours" },
      { label: "\u00c0 propos", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "L\u00e9gal",
    links: [
      { label: "CGU", href: "/legal/cgu" },
      { label: "Confidentialit\u00e9", href: "/legal/privacy" },
      { label: "Accessibilit\u00e9", href: "/legal/accessibility" },
    ],
  },
];

/* ── Social SVG Icons ── */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Instagram"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="LinkedIn"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="YouTube"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { icon: InstagramIcon, href: "https://instagram.com/banlieuwood", label: "Instagram" },
  { icon: LinkedInIcon, href: "https://linkedin.com/company/banlieuwood", label: "LinkedIn" },
  { icon: YouTubeIcon, href: "https://youtube.com/@banlieuwood", label: "YouTube" },
];

/* ── Film Strip Decoration ── */

function FilmStripDecoration({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 opacity-[0.08]", className)} aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-3 rounded-[1px] bg-bw-heading shrink-0"
        />
      ))}
    </div>
  );
}

/* ── Main Footer Component ── */

export function SiteFooter({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <footer
      ref={ref}
      className={cn(
        "relative mt-auto",
        "border-t border-white/[0.06]",
        className,
      )}
    >
      {/* Ambient orange glow at bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px]"
        style={{
          background: "radial-gradient(ellipse at center bottom, rgba(255,107,53,0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="glass-surface relative">
        {/* Film strip decoration top */}
        <div className="overflow-hidden py-3 flex justify-center">
          <FilmStripDecoration />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-6xl mx-auto px-6 pb-8"
        >
          {/* ── Top section: Brand + Columns ── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pt-4 pb-10">
            {/* Brand column */}
            <div className="md:col-span-4 space-y-4">
              <BrandStyles />
              <BrandLogo size="lg" color="cinema" />
              <p className="text-sm text-bw-muted leading-relaxed max-w-xs">
                Le jeu collaboratif de cr&eacute;ation cin&eacute;matographique.
                De 5 &agrave; 30 joueurs sur tablette ou ordinateur.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-3 pt-2">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg",
                      "text-bw-muted hover:text-bw-heading",
                      "bg-white/[0.04] hover:bg-white/[0.08]",
                      "transition-all duration-200",
                      "hover:shadow-[0_0_12px_rgba(255,107,53,0.15)]",
                    )}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation columns */}
            {FOOTER_COLUMNS.map((column, colIdx) => (
              <motion.div
                key={column.title}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{
                  duration: 0.5,
                  delay: 0.15 + colIdx * 0.08,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className={cn(
                  "md:col-span-2",
                  colIdx === 0 && "md:col-start-7",
                )}
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-bw-heading mb-4">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className={cn(
                          "text-sm text-bw-muted hover:text-bw-heading",
                          "transition-colors duration-200",
                          "hover:translate-x-0.5 inline-block transition-transform",
                        )}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* ── Separator ── */}
          <div className="border-t border-white/[0.06]" />

          {/* ── Bottom bar ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
            <p className="text-xs text-bw-muted">
              &copy; 2026 Banlieuwood &mdash; Fait avec passion &agrave; Paris
            </p>
            <div className="flex items-center gap-3">
              <LocaleSwitcher />
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md",
                  "text-xs font-mono font-medium tracking-wider",
                  "text-bw-muted bg-white/[0.04] border border-white/[0.06]",
                )}
              >
                v1.0
              </span>
            </div>
          </div>
        </motion.div>

        {/* Film strip decoration bottom */}
        <div className="overflow-hidden py-2 flex justify-center">
          <FilmStripDecoration />
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
