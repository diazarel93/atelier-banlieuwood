import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./contact-form";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Contact — Banlieuwood",
  description: "Contactez l'equipe Banlieuwood pour toute question ou proposition de partenariat.",
};

const FAQ = [
  {
    q: "Comment les eleves rejoignent ?",
    a: "Scan du QR code affiche en classe ou saisie d'un code a 4 chiffres sur tablette.",
  },
  { q: "Quels appareils sont compatibles ?", a: "iPad (Safari), tablettes Android (Chrome), ordinateurs de bureau." },
  { q: "Les donnees des eleves ?", a: "Pedagogiques et anonymisees. Pas de vente, pas de profilage. Conforme RGPD." },
  { q: "Combien ca coute ?", a: "Gratuit pour les etablissements scolaires publics." },
];

export default function ContactPage() {
  return (
    <div
      className="min-h-dvh bg-[#0a0a16] text-[#f0f0f8]"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      <SiteNavbar />
      {/* Header */}
      <section className="pt-28 pb-12 px-6">
        <div className="max-w-[900px] mx-auto text-center">
          <h1 className="text-[clamp(28px,4vw,48px)] font-extrabold mb-3">Contactez-nous</h1>
          <p className="text-[clamp(15px,2vw,18px)] text-[#94a3b8]">
            Une question, un partenariat, un probleme technique ? Ecrivez-nous.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 px-6">
        <div className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="rounded-2xl bg-[#141430] border border-[#252550] p-8">
            <h3 className="text-[16px] font-bold mb-6">Envoyez un message</h3>
            <ContactForm />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* FAQ */}
            <div className="rounded-2xl bg-[#141430] border border-[#252550] p-6">
              <h4 className="text-[16px] font-bold mb-4">FAQ rapide</h4>
              <div className="space-y-4">
                {FAQ.map((f) => (
                  <div key={f.q}>
                    <div className="text-[13px] font-semibold mb-1">{f.q}</div>
                    <div className="text-[12px] text-[#94a3b8] leading-relaxed">{f.a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Docs links */}
            <div className="rounded-2xl bg-[#141430] border border-[#252550] p-6">
              <h4 className="text-[16px] font-bold mb-4">Documentation</h4>
              {[
                { label: "Guide intervenant (PDF)", href: "/docs" },
                { label: "Protocole de tournage", href: "/docs" },
                { label: "Fiche pedagogique PEAC", href: "/docs" },
              ].map((doc) => (
                <Link
                  key={doc.label}
                  href={doc.href}
                  className="flex items-center gap-2 py-2 text-[13px] text-[#94a3b8] hover:text-[#c4b5fd] transition-colors border-b border-[#252550] last:border-b-0"
                >
                  📄 {doc.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
