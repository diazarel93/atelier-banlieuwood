import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ROUTES } from "@/lib/routes";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'equipe Banlieuwood pour toute question ou proposition de partenariat.",
};

const CONTACT_INFO = [
  { label: "Email", value: "contact@banlieuwood.fr", href: "mailto:contact@banlieuwood.fr" },
  { label: "Localisation", value: "Saint-Denis, France", href: null },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/banlieuwood" },
  { label: "LinkedIn", href: "https://linkedin.com/company/banlieuwood" },
  { label: "YouTube", href: "https://youtube.com/@banlieuwood" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bw-bg">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 h-14 flex items-center px-6 border-b border-bw-border bg-bw-bg/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-bw-muted hover:text-bw-heading transition-colors duration-150"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 12L6 8L10 4" />
            </svg>
            Accueil
          </Link>
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="max-w-4xl mx-auto px-6 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <p className="text-sm font-medium text-bw-primary mb-3 tracking-wide uppercase">
          Contact
        </p>
        <h1
          className="text-bw-heading font-bold leading-tight"
          style={{ fontSize: "clamp(28px, 5vw, 44px)" }}
        >
          Ecrivez-nous
        </h1>
        <p className="text-bw-text text-lg leading-relaxed mt-4 max-w-2xl">
          Une question, un projet de partenariat ou une demande presse ?
          Remplissez le formulaire et nous vous repondons sous 48h.
        </p>
      </header>

      {/* ── Content: Form + Info ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Form — 2 columns */}
          <div className="md:col-span-2">
            <ContactForm />
          </div>

          {/* Info sidebar */}
          <aside className="space-y-8">
            {/* Contact info */}
            <div>
              <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide mb-4">
                Coordonnees
              </h3>
              <div className="space-y-3">
                {CONTACT_INFO.map((info) => (
                  <div key={info.label}>
                    <p className="text-xs text-bw-muted">{info.label}</p>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-sm text-bw-primary hover:underline"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm text-bw-text">{info.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide mb-4">
                Reseaux
              </h3>
              <div className="space-y-2">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-bw-muted hover:text-bw-heading transition-colors duration-150"
                  >
                    {link.label} &rarr;
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-bw-border px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-xs text-bw-muted">&copy; 2026 Banlieuwood</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="text-xs text-bw-muted hover:text-bw-heading transition-colors">Confidentialite</Link>
            <Link href="/legal/cgu" className="text-xs text-bw-muted hover:text-bw-heading transition-colors">CGU</Link>
            <Link href={ROUTES.contact} className="text-xs text-bw-muted hover:text-bw-heading transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
