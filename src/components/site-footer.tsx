import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative bg-[#0d0b09] border-t border-[#2a2420] pt-16 pb-6">
      {/* Cinema accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,107,53,0.35) 30%, rgba(212,168,67,0.35) 60%, transparent 100%)",
        }}
      />
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎬</span>
              <span className="text-base font-extrabold bg-gradient-to-r from-[#FF6B35] to-[#D4A843] bg-clip-text text-transparent">
                BANLIEUWOOD
              </span>
            </div>
            <p className="text-[13px] text-white/40 leading-relaxed mb-4">
              Atelier de cinéma collaboratif pour les écoles. Chaque élève est un créateur.
            </p>
            <p className="text-[11px] text-white/40">
              Aligné sur le PEAC, le Socle Commun et les programmes d&apos;Arts Plastiques Cycles 3-4.
            </p>
          </div>
          {[
            {
              title: "Produit",
              links: [
                { label: "À Propos", href: "/projet" },
                { label: "Festival", href: "/festival" },
                { label: "Ressources", href: "/docs" },
                { label: "Contact", href: "/contact" },
              ],
            },
            {
              title: "Légal",
              links: [
                { label: "Mentions légales", href: "/legal/cgu" },
                { label: "Confidentialité", href: "/legal/privacy" },
                { label: "Accessibilité", href: "/legal/accessibility" },
              ],
            },
            {
              title: "Communauté",
              links: [
                { label: "Instagram", href: "#" },
                { label: "LinkedIn", href: "#" },
                { label: "YouTube", href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-bold text-white mb-4">{col.title}</h4>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-[13px] text-white/40 mb-2 hover:text-[#FF6B35] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-[#2a2420] text-[12px] text-white/40">
          <span>&copy; 2026 Banlieuwood. Tous droits réservés.</span>
          <span>Fait avec 🧡 pour les écoles de France</span>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
