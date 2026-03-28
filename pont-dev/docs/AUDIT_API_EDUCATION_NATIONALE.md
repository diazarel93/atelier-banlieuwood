# Audit — Connexion aux API de l'Éducation Nationale (France)

**Date :** 21 mars 2026
**Contexte :** Banlieuwood — plateforme d'ateliers cinéma interactifs en classe
**Objectif :** Identifier les possibilités réelles de connexion aux logiciels et plateformes de l'Éducation Nationale française

---

## Contexte réglementaire — Changement majeur en décembre 2025

Le **décret n°2025-1165 du 5 décembre 2025** a créé un cadre juridique inédit : les outils numériques utilisés dans l'enseignement secondaire public doivent désormais respecter des standards d'interopérabilité.

**Standards rendus obligatoires :**
- LTI (Learning Tools Interoperability)
- OneRoster (échange de listes de classes)
- QTI (Question & Test Interoperability)
- Common Cartridge (packaging de contenu)
- Caliper Analytics (données d'apprentissage)
- Open Badges (badges de compétences)

**5 services socle obligatoires :**
| Service | Rôle |
|---|---|
| **EduConnect** | Auth élèves et parents |
| **Guichet agent** | Auth personnels |
| **SCOPE** | Circulation des données d'organisation pédagogique |
| **GAR** | Gestion d'accès aux ressources numériques |
| **DNMA** | Mesure d'audience nationale |

**Ce que ça change pour Banlieuwood :** Ce décret rend l'interopérabilité non plus optionnelle mais réglementaire. Un outil déployé en collège/lycée public devra à terme se conformer à ces standards.

---

## 1. Pronote (Index Education)

### Résumé

| Point | État |
|---|---|
| API publique officielle | **Non. Aucune.** |
| Intégration officielle possible | Uniquement via partenariat avec Index Education ou via GAR/ENT |
| Librairies non-officielles | Oui, mais zone grise légale |
| Risque juridique | **Élevé** (article 323-1 du Code pénal — accès non autorisé à un STAD) |

### Détail

Index Education ne fournit **aucune API publique** pour Pronote. Leur position est explicite : pas d'API prévue, pas d'accès tiers autorisé. En 2021, ils ont fait retirer la librairie `pronote-api` de npm et GitHub.

**API ServiceWeb (SOAP/REST)** — existe mais réservée aux administrateurs d'établissement (HYPERPLANNING Campus). Accès aux absences, notes, élèves, classes. Non accessible aux éditeurs tiers.

**Librairies non-officielles existantes :**

| Librairie | Langage | État | Risque |
|---|---|---|---|
| **Pawnote.js** | TypeScript | Actif (114 stars, 680+ commits) | Zone grise — Index Education n'a pas encore agi contre |
| **pronotepy** | Python | Maintenance only | Même risque |
| **pronote-api** (Litarvan) | Node.js | **Mort** — retiré en 2021 sur demande d'Index Education | — |

**Données accessibles via les librairies non-officielles :** emploi du temps, notes, devoirs, absences, messagerie, cantine, évaluations. Authentification par identifiants élève/parent ou via CAS des ENT.

### Verdict pour Banlieuwood

**Ne pas utiliser les librairies non-officielles.** Le risque juridique est réel (article 323-1 : jusqu'à 3 ans d'emprisonnement et 100 000 € d'amende). L'approche correcte pour interagir avec l'écosystème Pronote est de passer par le **GAR** ou les **ENT**, pas par Pronote directement.

---

## 2. GAR (Gestionnaire d'Accès aux Ressources)

### Résumé

| Point | État |
|---|---|
| API/intégration | **Oui — voie officielle principale** |
| Couverture | 97% des collèges/lycées publics, 9,9 millions d'utilisateurs |
| Protocole | SAML 2.0 pour le SSO |
| Documentation | Publique (RTFS V8.2) |
| Contact | dne-gar@education.gouv.fr |

### Comment ça marche

Le GAR est le **guichet unique** par lequel les établissements accèdent aux ressources numériques. Quand un élève ou un prof clique sur une ressource dans son ENT, le GAR gère l'authentification et transmet les attributs nécessaires (rôle, établissement, classe) au fournisseur de ressources.

**3 interfaces techniques à implémenter :**
1. **Moissonnage de métadonnées** — Décrire sa ressource au format ScoLOMFR
2. **Gestion des abonnements** — Web service pour savoir qui a accès
3. **SSO** — SAML 2.0 pour authentifier les utilisateurs

### Processus d'intégration

1. Contacter le GAR (dne-gar@education.gouv.fr)
2. Signer un contrat de fournisseur de ressources
3. Implémenter les 3 interfaces techniques
4. Passer les tests de validation
5. Mise en production

### Données accessibles via le GAR

- Rôle de l'utilisateur (élève, enseignant, personnel)
- Établissement
- Classe/groupe
- **Pas de données nominatives élèves** sauf celles nécessaires à l'accès

### Verdict pour Banlieuwood

**C'est la voie royale.** Le GAR donne accès à 97% des établissements secondaires publics. L'effort technique est significatif (SAML 2.0 + métadonnées + abonnements) mais c'est la seule voie officielle et légale pour être distribué à grande échelle. **Priorité haute si l'objectif est un déploiement national.**

---

## 3. ENT (Espaces Numériques de Travail)

### Résumé

Il n'y a pas "un" ENT en France mais une dizaine de fournisseurs. Chacun a ses propres API, mais tous partagent des protocoles communs.

### Principaux fournisseurs

| ENT | Déploiement | API/Intégration | Ouverture |
|---|---|---|---|
| **Skolengo** (Kosmos) | Le plus déployé — 841 établissements Grand Est seul | REST/SOAP/JSON. 70+ connecteurs (SIECLE, ONDE, GAR, Moodle). | Accès via partenariat uniquement |
| **itslearning** | International, présent en France | **Le plus ouvert** — portail développeur public (developer.itslearning.com). LTI 1.0/1.1/1.3 complet, REST APIs, OData. | Portail développeur public |
| **Edifice** (ONE/NEO/Open ENT NG) | Open source (AGPL v3) | REST APIs documentées en OpenAPI sur GitHub | **Entièrement open source** |
| **Mon Bureau Numérique** | Grand Est | Basé sur Skolengo | Via Skolengo |
| **Wilapa** | DOM-TOM | — | — |

### Protocoles communs à tous les ENT

| Protocole | Usage |
|---|---|
| **CAS** | SSO historique — le plus répandu |
| **SAML 2.0** | Fédération d'identité |
| **OpenID Connect** | SSO moderne (de plus en plus) |
| **LTI** | Intégration d'outils tiers (obligatoire depuis le décret) |

### Intégration concrète

Pour qu'un enseignant puisse lancer Banlieuwood depuis son ENT :
1. **Implémenter un client CAS** — le prof clique dans l'ENT, Banlieuwood reçoit un ticket CAS, le valide, et identifie l'utilisateur
2. **Ou implémenter LTI 1.3** — l'ENT lance Banlieuwood en transmettant le contexte (qui est l'utilisateur, quel cours, quel rôle)

### Verdict pour Banlieuwood

**CAS est le minimum vital** pour être intégré dans un ENT français. **LTI 1.3 est la cible** car c'est maintenant obligatoire et ça fonctionne avec tous les ENT. **Edifice (ONE/NEO) est intéressant** car open source — on peut étudier leur code d'intégration directement.

---

## 4. EduConnect

### Résumé

| Point | État |
|---|---|
| Ce que c'est | SSO national pour les élèves et parents (remplace ATEN) |
| Protocoles | SAML 2.0, CAS, OpenID Connect |
| Accès direct pour un éditeur tiers | **Non** — passer par le GAR ou un ENT |

### Comment ça marche

EduConnect est un **fournisseur d'identité (IdP)** géré par le Ministère. Un élève ou parent s'authentifie une fois sur EduConnect, puis accède à tous les services connectés (ENT, téléservices, etc.).

**Point clé :** Un éditeur tiers comme Banlieuwood ne se connecte pas directement à EduConnect. L'authentification passe par le GAR ou l'ENT, qui eux-mêmes délèguent à EduConnect.

### Verdict pour Banlieuwood

**Pas d'action directe nécessaire.** Si Banlieuwood s'intègre au GAR ou à un ENT, EduConnect est géré automatiquement par ces intermédiaires.

---

## 5. LTI 1.3 (Learning Tools Interoperability)

### Résumé

| Point | État |
|---|---|
| Ce que c'est | Standard universel pour intégrer un outil dans un LMS/ENT |
| Statut en France | **Obligatoire** (décret décembre 2025) |
| Protocole sous-jacent | OAuth 2.0 + OpenID Connect + JWT |
| Effort d'implémentation | Modéré (quelques jours à 2 semaines) |

### Ce que LTI 1.3 apporte concrètement

1. **Lancement transparent** — Le prof clique dans son ENT/LMS, l'élève arrive dans Banlieuwood déjà authentifié, avec son contexte (classe, rôle)
2. **Names and Role Provisioning** (LTI Advantage) — Banlieuwood peut récupérer la liste des élèves de la classe automatiquement
3. **Assignment and Grade Services** — Banlieuwood peut renvoyer des résultats/scores vers l'ENT
4. **Deep Linking** — Le prof peut choisir un module spécifique de Banlieuwood à intégrer dans son cours

### Ce que ça change pour Banlieuwood

Avec LTI 1.3 :
- Plus besoin du code 6 caractères pour rejoindre — les élèves sont déjà identifiés
- Le plan de classe peut être pré-rempli via les données de roster
- L'intervenant n'a pas besoin de créer manuellement une séance — le contexte arrive de l'ENT
- Les résultats de séance peuvent remonter vers l'ENT du prof

### Librairies d'implémentation

| Librairie | Langage | Notes |
|---|---|---|
| `ltijs` | Node.js/TypeScript | La plus utilisée. npm: `ltijs`. Bien documentée. |
| Référence 1EdTech | Ruby on Rails | Implémentation officielle |
| `pylti1p3` | Python | Mature |

### Verdict pour Banlieuwood

**Priorité n°1 d'intégration.** LTI 1.3 est le standard universel, maintenant obligatoire en France, et il résout directement des problèmes concrets de Banlieuwood (auth, roster, jointure). L'effort est raisonnable avec `ltijs`.

---

## 6. OneRoster

### Résumé

| Point | État |
|---|---|
| Ce que c'est | Standard pour échanger les listes de classes/élèves/profs |
| Statut en France | **Obligatoire** (décret décembre 2025). 1EdTech développe un profil adapté à la France. |
| Formats | CSV (simple) ou REST API |
| Effort | Faible à modéré |

### Ce que ça apporte concrètement

OneRoster permettrait à Banlieuwood de :
- Importer automatiquement les listes de classes depuis le SIS (Système d'Information Scolaire)
- Connaître les groupes, les niveaux, les enseignants rattachés
- Pré-remplir le plan de classe
- Éviter la saisie manuelle des élèves

### État en France

La France utilise actuellement ses propres systèmes (SIECLE pour le secondaire, ONDE pour le primaire) avec des formats XML propriétaires. OneRoster est la direction prise par le décret pour standardiser ces échanges. Un profil OneRoster adapté à la France est en cours de développement par 1EdTech.

### Verdict pour Banlieuwood

**Priorité moyenne-haute.** Pas urgent pour Terrain 1 (les classes sont petites, la saisie manuelle suffit). Mais stratégique pour le déploiement à l'échelle — surtout combiné avec LTI 1.3.

---

## 7. SIECLE / ONDE / Base Élèves / STS-Web

### Résumé

| Système | Niveau | Données | Accès tiers |
|---|---|---|---|
| **SIECLE** | Secondaire | Élèves, classes, responsables, scolarité | **Fermé** — accès réservé aux éditeurs accrédités via la plateforme Pléiade |
| **ONDE** | Primaire | Élèves, écoles, inscriptions | **Fermé** — ONDE-échanges pour les logiciels municipaux uniquement |
| **STS-Web** | Secondaire | Structures, emplois du temps, services | **Fermé** |
| **LSU/LSL** | Tous niveaux | Livret scolaire (compétences, appréciations) | **Fermé** — import/export XML via Pléiade |

### Comment devenir éditeur accrédité

Contact : communication-editeurs@education.gouv.fr via la plateforme Pléiade. Processus administratif lourd, réservé aux éditeurs de logiciels de gestion scolaire (type vie scolaire, emploi du temps). **Pas pertinent pour un outil pédagogique interactif comme Banlieuwood.**

### Verdict pour Banlieuwood

**Non pertinent.** Ces systèmes sont des bases administratives fermées. L'accès aux données de roster passera par OneRoster ou LTI Advantage, pas par SIECLE directement.

---

## 8. Autres plateformes

| Plateforme | API ? | Pertinence Banlieuwood |
|---|---|---|
| **PIX** (compétences numériques) | Open source sur GitHub. API data en développement. | Faible — pas le même domaine |
| **data.education.gouv.fr** | **Oui — seule API vraiment ouverte et publique.** REST, pas d'auth requise, 5000 appels/jour, Swagger docs. Données : annuaire des 66 000 établissements, effectifs, résultats. | **Utile** — pour chercher un établissement par code UAI, afficher les infos d'une école |
| **CNED / Ma Classe à la Maison** | Fermé | Aucune |
| **Apps.education.fr** | Fermé (outils internes MEN) | Aucune |
| **Canopé** | Pas d'API publique | Aucune |
| **Moodle** (utilisé dans le supérieur/CNED) | LTI complet, REST API riche | Via LTI 1.3 si déploiement dans le supérieur |

---

## 9. API publique data.education.gouv.fr — la seule porte ouverte

C'est la **seule API réellement ouverte** du Ministère. Gratuite, sans authentification.

**URL :** https://data.education.gouv.fr
**Documentation :** https://api.gouv.fr/les-api/api_open_data_education_nationale

**Données disponibles :**
- Annuaire des 66 000+ établissements (nom, adresse, type, code UAI, académie, coordonnées GPS)
- Effectifs par établissement et niveau
- Résultats aux examens (brevet, bac) par établissement
- IPS (Indice de Position Sociale) des collèges
- Carte des formations

**Utilité pour Banlieuwood :** Permettre à un intervenant de chercher son établissement par nom/ville, pré-remplir les infos d'école, filtrer par académie/département. Intégration simple (REST + JSON, pas d'auth).

---

## Matrice de priorité pour Banlieuwood

| Standard/Plateforme | Pertinence | Effort | Priorité | Horizon |
|---|---|---|---|---|
| **LTI 1.3** | Critique — obligatoire, résout auth + roster + jointure | Modéré (1-2 semaines avec `ltijs`) | **P0** | Avant déploiement en établissement |
| **CAS SSO** | Haute — nécessaire pour les ENT | Faible (quelques jours) | **P0** | Avant déploiement en établissement |
| **GAR (SAML 2.0)** | Haute — accès à 97% des établissements secondaires | Modéré à élevé | **P1** | Quand l'objectif est le déploiement national |
| **OneRoster** | Haute — import auto des listes de classes | Faible à modéré | **P1** | Après LTI 1.3 |
| **data.education.gouv.fr** | Utile — annuaire établissements | Très faible (REST public) | **P2** | Quand on veut un sélecteur d'établissement |
| **Open Badges** | Faible — gamification officielle | Faible | **P3** | Optionnel, après stabilisation |
| **Pronote (non-officiel)** | **Interdit** — risque juridique | — | **Jamais** | — |
| **SIECLE/ONDE** | Non pertinent | Élevé + accréditation | **Skip** | — |
| **SCORM** | Non pertinent (format legacy, pas adapté au temps réel) | — | **Skip** | — |

---

## Recommandation concrète pour Banlieuwood

### Phase 1 — Terrain 1 (court terme)
Rien à intégrer. Le code 6 caractères + QR code suffit pour les premiers tests en classe. L'intervenant Banlieuwood crée la séance, les élèves rejoignent manuellement.

### Phase 2 — Déploiement en établissement
1. **Implémenter LTI 1.3** (Tool Provider) avec `ltijs` (npm)
   - L'ENT lance Banlieuwood → élèves déjà authentifiés
   - LTI Advantage → récupérer la liste de la classe automatiquement
   - Plus besoin de code de jointure
2. **Implémenter un client CAS** pour les ENT qui n'ont pas encore LTI 1.3
3. **Intégrer data.education.gouv.fr** pour le sélecteur d'établissement

### Phase 3 — Déploiement national
4. **S'intégrer au GAR** (SAML 2.0 + métadonnées ScoLOMFR + abonnements)
   - Donne accès à 9,9 millions d'utilisateurs
   - Nécessite un contrat formel avec le GAR
5. **Implémenter OneRoster** pour l'import automatique des rosters

### Ce qu'il ne faut PAS faire
- Ne pas utiliser Pawnote/pronotepy ou toute librairie non-officielle pour se connecter à Pronote
- Ne pas essayer d'accéder directement à SIECLE/ONDE
- Ne pas implémenter SCORM (pas adapté à un outil interactif temps réel)

---

*Audit produit le 21 mars 2026 — Banlieuwood — Pont développeur Cycle 1.*
*Sources : GAR (gar.education.fr), décret n°2025-1165, 1EdTech, documentation ENT, data.education.gouv.fr*
