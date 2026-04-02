import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "./contact-form";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";

export const metadata: Metadata = {
  title: "Contact — Banlieuwood",
  description: "Contactez l'équipe Banlieuwood pour toute question ou proposition de partenariat.",
};

const FAQ = [
  {
    q: "Comment les élèves rejoignent ?",
    a: "Scan du QR code affiché en classe ou saisie d'un code à 4 chiffres sur tablette.",
  },
  {
    q: "Quels appareils sont compatibles ?",
    a: "iPad (Safari), tablettes Android (Chrome), ordinateurs de bureau.",
  },
  {
    q: "Les données des élèves ?",
    a: "Pédagogiques et anonymisées. Pas de vente, pas de profilage. Conforme RGPD.",
  },
  { q: "Combien ça coûte ?", a: "Gratuit pour les établissements scolaires publics." },
];

export default function ContactPage() {
  return (
    <div className="min-h-dvh bg-[#0d0b09] text-white">
      <ScrollProgressBar />
      <SiteNavbar />
      {/* Header */}
      <section className="pt-28 pb-12 px-6">
        <div className="max-w-[900px] mx-auto text-center">
          <div
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: "var(--color-bw-primary)" }}
          >
            NOUS ÉCRIRE
          </div>
          <h1 className="font-cinema text-[clamp(36px,5vw,64px)] uppercase leading-[1.05] mb-4">Contactez-nous</h1>
          <p className="text-[clamp(15px,2vw,18px)] text-white/55 max-w-[440px] mx-auto">
            Une question, un partenariat, un problème technique ? Écrivez-nous.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24 px-6">
        <div className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="rounded-2xl bg-[#141210] border border-[#2a2420] p-8">
            <h3 className="text-[16px] font-bold mb-6">Envoyez un message</h3>
            <ContactForm />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* FAQ */}
            <div className="rounded-2xl bg-[#141210] border border-[#2a2420] p-6">
              <h4 className="text-[16px] font-bold mb-4">FAQ rapide</h4>
              <div className="space-y-4">
                {FAQ.map((f) => (
                  <div key={f.q}>
                    <div className="text-[13px] font-semibold mb-1">{f.q}</div>
                    <div className="text-[12px] text-white/45 leading-relaxed">{f.a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Docs links */}
            <div className="rounded-2xl bg-[#141210] border border-[#2a2420] p-6">
              <h4 className="text-[16px] font-bold mb-4">Documentation</h4>
              {[
                { label: "Guide intervenant (PDF)", href: "/docs#guide-intervenant" },
                { label: "Protocole de tournage", href: "/docs#protocole-tournage" },
                { label: "Fiche pédagogique PEAC", href: "/docs#fiche-peac" },
              ].map((doc) => (
                <Link
                  key={doc.label}
                  href={doc.href}
                  className="flex items-center gap-2 py-2 text-[13px] text-white/45 hover:text-bw-primary transition-colors border-b border-[#2a2420] last:border-b-0"
                >
                  📄 {doc.label}
                </Link>
              ))}
            </div>

            {/* Réassurance */}
            <div className="rounded-xl border border-[#2a2420] bg-bw-primary/[0.04] px-5 py-4">
              <p className="text-[12px] text-white/55 leading-relaxed">
                ✓ Gratuit pour les écoles publiques
                <br />
                ✓ Réponse sous 24h ouvrées
                <br />✓ Accès activé immédiatement après validation
              </p>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
