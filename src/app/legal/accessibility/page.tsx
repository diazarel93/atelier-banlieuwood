import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Declaration d'Accessibilite",
};

export default function AccessibilityPage() {
  return (
    <article className="max-w-none">
      <h1 className="text-3xl font-bold text-bw-heading mb-2">Declaration d&apos;Accessibilite</h1>
      <p className="text-bw-muted text-sm mb-10">Derniere mise a jour : Mars 2026</p>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-bw-heading">1. Engagement</h2>
          <p className="text-bw-text leading-relaxed">
            Banlieuwood s&apos;engage a rendre sa plateforme accessible conformement au Referentiel General
            d&apos;Amelioration de l&apos;Accessibilite (RGAA) et aux Web Content Accessibility Guidelines (WCAG 2.1
            niveau AA). L&apos;accessibilite numerique est un enjeu essentiel, en particulier pour un outil pedagogique
            destine a tous les eleves.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">2. Etat de conformite</h2>
          <p className="text-bw-text leading-relaxed">
            La plateforme Banlieuwood est en <strong className="text-bw-amber">conformite partielle</strong> avec le
            RGAA 4.1. Un audit complet d&apos;accessibilite est en cours de planification.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">3. Contenus accessibles</h2>
          <ul className="text-bw-text space-y-2">
            <li>Navigation par clavier sur les pages principales</li>
            <li>Attributs ARIA sur les elements interactifs</li>
            <li>Contraste des couleurs respecte sur le texte principal</li>
            <li>Structure semantique HTML (headings, landmarks)</li>
            <li>Tailles de cibles tactiles suffisantes (48px minimum)</li>
            <li>Textes alternatifs sur les images informatives</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">4. Contenus non accessibles</h2>
          <p className="text-bw-text leading-relaxed mb-3">
            Les contenus suivants ne sont pas encore pleinement accessibles :
          </p>
          <ul className="text-bw-text space-y-2">
            <li>
              Certaines animations ne respectent pas encore la preference
              <code className="text-bw-amber bg-white/5 px-1.5 py-0.5 rounded text-sm">prefers-reduced-motion</code>
            </li>
            <li>
              Le flux de jeu en temps reel (page /play) peut manquer d&apos;annonces pour les lecteurs d&apos;ecran
            </li>
            <li>Certains formulaires n&apos;ont pas encore de messages d&apos;erreur associes par ARIA</li>
            <li>Les illustrations SVG decoratives n&apos;ont pas toutes l&apos;attribut aria-hidden</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">5. Ameliorations prevues</h2>
          <ul className="text-bw-text space-y-2">
            <li>Audit RGAA complet avec rapport de conformite</li>
            <li>Support complet de la navigation au clavier sur toutes les pages</li>
            <li>
              Integration de{" "}
              <code className="text-bw-amber bg-white/5 px-1.5 py-0.5 rounded text-sm">prefers-reduced-motion</code> sur
              toutes les animations
            </li>
            <li>Regions ARIA live pour les mises a jour temps reel</li>
            <li>Mode contraste eleve optionnel</li>
            <li>Documentation d&apos;accessibilite pour les facilitateurs</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">6. Technologies utilisees</h2>
          <ul className="text-bw-text space-y-2">
            <li>HTML5</li>
            <li>CSS3 / Tailwind CSS</li>
            <li>JavaScript / TypeScript</li>
            <li>React 19 / Next.js 16</li>
            <li>SVG pour les illustrations</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">7. Retour d&apos;information et contact</h2>
          <p className="text-bw-text leading-relaxed">
            Si vous rencontrez un defaut d&apos;accessibilite vous empechant d&apos;acceder a un contenu ou une
            fonctionnalite, vous pouvez nous contacter a :{" "}
            <a href="mailto:accessibilite@banlieuwood.fr" className="text-bw-primary hover:underline">
              accessibilite@banlieuwood.fr
            </a>
          </p>
          <p className="text-bw-text leading-relaxed mt-2">
            Nous nous engageons a vous repondre sous 7 jours ouvrables et a proposer une alternative accessible.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">8. Voies de recours</h2>
          <p className="text-bw-text leading-relaxed">
            Si vous n&apos;obtenez pas de reponse satisfaisante, vous pouvez saisir le Defenseur des droits :{" "}
            <a
              href="https://www.defenseurdesdroits.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bw-primary hover:underline"
            >
              www.defenseurdesdroits.fr
            </a>
          </p>
        </div>
      </section>
    </article>
  );
}
