import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#111127] border-t border-[#252550] pt-16 pb-6">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎬</span>
              <span className="text-base font-extrabold bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] bg-clip-text text-transparent">
                BANLIEUWOOD
              </span>
            </div>
            <p className="text-[13px] text-[#64748b] leading-relaxed mb-4">
              Atelier de cinema collaboratif pour les ecoles. Chaque eleve est un createur.
            </p>
            <p className="text-[11px] text-[#64748b]">
              Aligne sur le PEAC, le Socle Commun et les programmes d&apos;Arts Plastiques Cycles 3-4.
            </p>
          </div>
          {[
            {
              title: "Produit",
              links: [
                { label: "A Propos", href: "/projet" },
                { label: "Festival", href: "/festival" },
                { label: "Ressources", href: "/docs" },
                { label: "Contact", href: "/contact" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Mentions legales", href: "/legal/cgu" },
                { label: "Confidentialite", href: "/legal/privacy" },
                { label: "Accessibilite", href: "/legal/accessibility" },
              ],
            },
            {
              title: "Communaute",
              links: [
                { label: "Instagram", href: "#" },
                { label: "LinkedIn", href: "#" },
                { label: "YouTube", href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-bold text-[#f0f0f8] mb-4">{col.title}</h4>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-[13px] text-[#64748b] mb-2 hover:text-[#c4b5fd] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-[#252550] text-[12px] text-[#64748b]">
          <span>&copy; 2026 Banlieuwood. Tous droits reserves.</span>
          <span>Fait avec 💜 pour les ecoles de France</span>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
