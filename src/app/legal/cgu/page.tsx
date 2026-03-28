import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Generales d'Utilisation",
};

export default function CGUPage() {
  return (
    <article className="max-w-none">
      <h1 className="text-3xl font-bold text-bw-heading mb-2">Conditions Generales d&apos;Utilisation</h1>
      <p className="text-bw-muted text-sm mb-10">Derniere mise a jour : Mars 2026</p>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-bw-heading">1. Objet</h2>
          <p className="text-bw-text leading-relaxed">
            Les presentes Conditions Generales d&apos;Utilisation (CGU) regissent l&apos;acces et l&apos;utilisation de
            la plateforme Banlieuwood, accessible a l&apos;adresse{" "}
            <a href="https://banlieuwood.fr" className="text-bw-primary hover:underline">
              banlieuwood.fr
            </a>
            . Banlieuwood est un outil pedagogique collaboratif de creation cinematographique destine aux etablissements
            scolaires, enseignants, et eleves.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">2. Definitions</h2>
          <ul className="text-bw-text space-y-2">
            <li>
              <strong className="text-bw-heading">Facilitateur</strong> : Enseignant ou animateur disposant d&apos;un
              compte authentifie pour creer et piloter des sessions de jeu.
            </li>
            <li>
              <strong className="text-bw-heading">Joueur</strong> : Eleve ou participant rejoignant une session via un
              code d&apos;acces, sans creation de compte.
            </li>
            <li>
              <strong className="text-bw-heading">Session</strong> : Partie de jeu collaborative regroupant un
              facilitateur et ses joueurs.
            </li>
            <li>
              <strong className="text-bw-heading">Contenu</strong> : Reponses, votes, et choix collectifs generes
              pendant une session.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">3. Acces au service</h2>
          <p className="text-bw-text leading-relaxed">
            L&apos;acces a Banlieuwood est gratuit pour les joueurs (aucun compte requis). Les facilitateurs doivent
            creer un compte via adresse email ou authentification Google. L&apos;utilisation du service implique
            l&apos;acceptation integrale des presentes CGU.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">4. Responsabilites de l&apos;utilisateur</h2>
          <p className="text-bw-text leading-relaxed">
            L&apos;utilisateur s&apos;engage a ne pas publier de contenu illicite, diffamatoire, ou inapproprie. Le
            facilitateur est responsable de la moderation du contenu genere par les joueurs pendant les sessions
            qu&apos;il organise. Banlieuwood fournit des outils de moderation (masquage, signalement, avertissement).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">5. Propriete intellectuelle</h2>
          <p className="text-bw-text leading-relaxed">
            Le contenu cree par les joueurs pendant les sessions leur appartient collectivement. Banlieuwood dispose
            d&apos;une licence d&apos;utilisation limitee a l&apos;amelioration du service (analyse, statistiques
            anonymisees). La plateforme, son design, son code et sa marque sont la propriete exclusive de Banlieuwood.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">6. Limitation de responsabilite</h2>
          <p className="text-bw-text leading-relaxed">
            Banlieuwood est fourni &ldquo;en l&apos;etat&rdquo;. Nous mettons tout en oeuvre pour assurer la
            disponibilite du service, mais ne garantissons pas une disponibilite ininterrompue. En aucun cas,
            Banlieuwood ne saurait etre tenu responsable des dommages indirects lies a l&apos;utilisation du service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">7. Modification des CGU</h2>
          <p className="text-bw-text leading-relaxed">
            Banlieuwood se reserve le droit de modifier les presentes CGU a tout moment. Les utilisateurs seront
            informes des modifications substantielles. La poursuite de l&apos;utilisation du service apres notification
            vaut acceptation des nouvelles CGU.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">8. Contact</h2>
          <p className="text-bw-text leading-relaxed">
            Pour toute question relative aux presentes CGU, vous pouvez nous contacter a :{" "}
            <a href="mailto:contact@banlieuwood.fr" className="text-bw-primary hover:underline">
              contact@banlieuwood.fr
            </a>
          </p>
        </div>
      </section>
    </article>
  );
}
