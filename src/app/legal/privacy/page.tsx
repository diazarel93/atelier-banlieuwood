import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialite",
};

export default function PrivacyPage() {
  return (
    <article className="max-w-none">
      <h1 className="text-3xl font-bold text-bw-heading mb-2">
        Politique de Confidentialite
      </h1>
      <p className="text-bw-muted text-sm mb-10">
        Derniere mise a jour : Mars 2026
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-bw-heading">
            1. Responsable du traitement
          </h2>
          <p className="text-bw-text leading-relaxed">
            Banlieuwood, dont le siege est situe en France, est responsable du
            traitement des donnees personnelles collectees via la plateforme
            banlieuwood.fr.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">
            2. Donnees collectees
          </h2>
          <div className="text-bw-text leading-relaxed space-y-3">
            <p>
              <strong className="text-bw-heading">Facilitateurs (enseignants) :</strong>
            </p>
            <ul className="space-y-1">
              <li>Adresse email (inscription)</li>
              <li>Nom d&apos;affichage (optionnel)</li>
              <li>Donnees d&apos;authentification Google (si SSO utilise)</li>
              <li>Sessions creees et donnees associees</li>
            </ul>

            <p>
              <strong className="text-bw-heading">Joueurs (eleves) :</strong>
            </p>
            <ul className="space-y-1">
              <li>Prenom ou pseudonyme (choisi par le joueur)</li>
              <li>Emoji avatar (choisi par le joueur)</li>
              <li>Reponses et votes pendant les sessions</li>
              <li>Adresse IP (pour la limitation de requetes, non stockee durablement)</li>
            </ul>

            <p>
              <strong className="text-bw-heading">Important :</strong> Les joueurs
              n&apos;ont pas besoin de creer de compte. Aucune adresse email,
              nom de famille, ou donnee d&apos;identification personnelle n&apos;est
              demandee aux joueurs.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">
            3. Finalites du traitement
          </h2>
          <ul className="text-bw-text space-y-2">
            <li>Permettre le fonctionnement des sessions de jeu collaboratif</li>
            <li>Authentifier les facilitateurs</li>
            <li>Generer des rapports pedagogiques pour les facilitateurs</li>
            <li>Ameliorer la qualite du service (statistiques anonymisees)</li>
            <li>Prevenir les abus (limitation de requetes)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">
            4. Base legale du traitement
          </h2>
          <ul className="text-bw-text space-y-2">
            <li>
              <strong className="text-bw-heading">Interet legitime :</strong>{" "}
              fonctionnement du service, prevention des abus
            </li>
            <li>
              <strong className="text-bw-heading">Consentement :</strong>{" "}
              inscription du facilitateur, participation volontaire des joueurs
            </li>
            <li>
              <strong className="text-bw-heading">Obligation legale :</strong>{" "}
              conservation des logs de connexion
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">
            5. Hebergement et securite
          </h2>
          <p className="text-bw-text leading-relaxed">
            Les donnees sont hebergees par Supabase (infrastructure AWS) avec
            des serveurs situes dans l&apos;Union Europeenne. Les communications
            sont chiffrees en transit (TLS 1.3). Les donnees au repos sont
            chiffrees (AES-256). L&apos;acces aux donnees est restreint par des
            politiques de securite au niveau des lignes (RLS).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">
            6. Duree de conservation
          </h2>
          <ul className="text-bw-text space-y-2">
            <li>
              <strong className="text-bw-heading">Sessions et reponses :</strong>{" "}
              conservees 12 mois apres la derniere activite, puis supprimees
              automatiquement
            </li>
            <li>
              <strong className="text-bw-heading">Comptes facilitateurs :</strong>{" "}
              conserves tant que le compte est actif, supprimes 6 mois apres
              la derniere connexion
            </li>
            <li>
              <strong className="text-bw-heading">Logs techniques :</strong>{" "}
              conserves 30 jours maximum
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">
            7. Droits des utilisateurs (RGPD)
          </h2>
          <p className="text-bw-text leading-relaxed">
            Conformement au Reglement General sur la Protection des Donnees
            (RGPD), vous disposez des droits suivants :
          </p>
          <ul className="text-bw-text space-y-2">
            <li>
              <strong className="text-bw-heading">Droit d&apos;acces :</strong>{" "}
              obtenir une copie de vos donnees personnelles
            </li>
            <li>
              <strong className="text-bw-heading">Droit de rectification :</strong>{" "}
              corriger vos donnees inexactes
            </li>
            <li>
              <strong className="text-bw-heading">Droit a l&apos;effacement :</strong>{" "}
              demander la suppression de vos donnees
            </li>
            <li>
              <strong className="text-bw-heading">Droit a la portabilite :</strong>{" "}
              recevoir vos donnees dans un format structure
            </li>
            <li>
              <strong className="text-bw-heading">Droit d&apos;opposition :</strong>{" "}
              vous opposer au traitement de vos donnees
            </li>
          </ul>
          <p className="text-bw-text leading-relaxed mt-3">
            Pour exercer ces droits, contactez-nous a :{" "}
            <a
              href="mailto:privacy@banlieuwood.fr"
              className="text-bw-primary hover:underline"
            >
              privacy@banlieuwood.fr
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">
            8. Protection des mineurs
          </h2>
          <p className="text-bw-text leading-relaxed">
            Banlieuwood est concu pour une utilisation en milieu scolaire, sous
            la supervision d&apos;un facilitateur adulte (enseignant, animateur).
            Les joueurs mineurs participent dans le cadre de cette supervision.
            Aucune donnee d&apos;identification personnelle (email, nom de
            famille, photo) n&apos;est collectee aupres des joueurs mineurs. Le
            facilitateur est responsable d&apos;informer les parents/tuteurs de
            l&apos;utilisation de la plateforme dans le cadre scolaire.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">
            9. Cookies et traceurs
          </h2>
          <p className="text-bw-text leading-relaxed">
            Banlieuwood utilise uniquement des cookies strictement necessaires
            au fonctionnement du service (authentification, preferences de
            session). Aucun cookie publicitaire ou de tracking tiers n&apos;est
            utilise. Des outils d&apos;analyse anonymisee peuvent etre utilises
            pour ameliorer le service, dans le respect du RGPD.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-bw-heading">10. Contact</h2>
          <p className="text-bw-text leading-relaxed">
            Pour toute question relative a la protection de vos donnees :{" "}
            <a
              href="mailto:privacy@banlieuwood.fr"
              className="text-bw-primary hover:underline"
            >
              privacy@banlieuwood.fr
            </a>
          </p>
          <p className="text-bw-text leading-relaxed mt-2">
            Vous pouvez egalement adresser une reclamation a la CNIL :{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bw-primary hover:underline"
            >
              www.cnil.fr
            </a>
          </p>
        </div>
      </section>
    </article>
  );
}
