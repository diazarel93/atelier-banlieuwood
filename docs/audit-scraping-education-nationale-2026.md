# Audit Scraping — Education Nationale & Sources Institutionnelles FR

**Date** : 22 mars 2026
**Objectif** : Cartographier toutes les sources scrapables pour alimenter Banlieuwood en contenus programmes officiels, du CP au BTS, et identifier les sources stratégiques au-delà d'Eduscol.

---

## Table des matières

1. [Faisabilité technique](#1-faisabilité-technique)
2. [Cinéma-Audiovisuel (CP → BTS)](#2-cinéma-audiovisuel)
3. [Arts Plastiques (CP → BTS)](#3-arts-plastiques)
4. [Français (CP → BTS)](#4-français)
5. [Numérique / SNT / NSI](#5-numérique--snt--nsi)
6. [EMC — Enseignement Moral et Civique](#6-emc--enseignement-moral-et-civique)
7. [Sources hors Eduscol — Stratégiques pour Banlieuwood](#7-sources-hors-eduscol)
8. [Recommandations scraper](#8-recommandations-scraper)

---

## 1. Faisabilité technique

### robots.txt de eduscol.education.gouv.fr

| Aspect | Détail |
|---|---|
| **Bots bloqués** | Bytespider, SemrushBot, Baiduspider, etc. (bots commerciaux) |
| **Bots sans limite** | Googlebot, Bingbot, UptimeRobot |
| **Tous les autres** | **Autorisés** — `Crawl-delay: 10` (10s entre requêtes) |
| **Chemins interdits** | `/search`, `/admin`, `/user`, fichiers système Drupal |
| **Ressources autorisées** | CSS, JS, images, **PDFs**, `/sites/default/files/` |

**Verdict** : Scraping autorisé. Contenu public sous Licence Ouverte Etalab. Respecter le délai de 10 secondes.

---

## 2. Cinéma-Audiovisuel

### Vue d'ensemble par niveau

| Niveau | Âges | Dispositif / Programme | URL Eduscol | Format |
|---|---|---|---|---|
| **Cycle 1** (Maternelle) | 3-5 | "Maternelle au cinéma" (3 films/an) | [/6934](https://eduscol.education.gouv.fr/6934/cinema-et-audiovisuel) | HTML |
| **Cycle 2** (CP-CE2) | 6-8 | "École et cinéma" | [/6934](https://eduscol.education.gouv.fr/6934/cinema-et-audiovisuel) | HTML |
| **Cycle 3** (CM1-6e) | 9-11 | "École et cinéma" + "L'Atelier cinéma" (Ocelot) | [/6934](https://eduscol.education.gouv.fr/6934/cinema-et-audiovisuel) | HTML + Kit péda |
| **Cycle 4** (5e-3e) | 12-14 | "Collège au cinéma" (3 films/an) | [/6934](https://eduscol.education.gouv.fr/6934/cinema-et-audiovisuel) | HTML + PDF prog cycle 4 |
| **Lycée 2nde** | 15 | Enseignement optionnel cinéma-audiovisuel (3h/sem) | [/5775](https://eduscol.education.gouv.fr/5775/programmes-et-ressources-en-cinema-audiovisuel-voie-gt) | PDF (BO spécial n°1, 2019) |
| **Lycée 1re** | 16 | Option (3h) + Spécialité (4h) | [/5775](https://eduscol.education.gouv.fr/5775/programmes-et-ressources-en-cinema-audiovisuel-voie-gt) | PDF |
| **Lycée Tle** | 17 | Option (3h) + Spécialité (6h) + Programme limitatif | [/5775](https://eduscol.education.gouv.fr/5775/programmes-et-ressources-en-cinema-audiovisuel-voie-gt) | PDF |
| **BTS Audiovisuel** | 18-20 | 5 options (Image, Son, Montage, Prod, Ingénierie) | [sti.eduscol.education.fr](https://sti.eduscol.education.fr/formations/bts/bts-metiers-de-laudiovisuel-mav) | HTML + PDF référentiel |
| **DN MADE Animation** | 18-21 | Cinéma d'animation 3D / Images et narration | [sti.eduscol.education.fr](https://sti.eduscol.education.fr/ressources_pedagogiques/parcours-dn-made-animation-specialite-cinema-danimation-3d) | HTML |

### Ressources PDF clés à scraper

**Lycée (page /5775) — priorité haute :**
- Programme option arts seconde GT (493 Ko)
- Programme option arts 1re/Tle GT (458 Ko)
- Programme spécialité arts 1re/Tle générale (637 Ko)
- Programme limitatif Tle 2025-26 : *La Féline* (Tourneur), *Irma Vep* (Assayas), *High School* (Wiseman)
- Programme limitatif 2026-27 (151 Ko)
- Ressources péda : "Trucages et effets spéciaux", "Le personnage de cinéma", progressions annuelles
- Dispositions bac + sujets zéro
- Vadémécum ciné-club collège/lycée (1.93 Mo)

**BTS Audiovisuel :**
- Référentiel complet : [PDF direct](https://sti.eduscol.education.fr/sites/eduscol.education.fr.sti/files/textes/bts/bts-metiers-de-laudiovisuel/4874-bts-metiers-audiovisuel.pdf)
- Thème culturel 2026 : "Animal, animalités"

**Guide transversal :**
- [Guide diffusion œuvres cinéma en classe](https://eduscol.education.gouv.fr/sites/default/files/document/guide-comment-diffuser-des-oeuvres-cinematographiques-et-audiovisuelles-en-classe-73053.pdf) (PDF)

### Constat important

> **Il n'existe PAS de programme "cinéma-audiovisuel" en tant que discipline avant le lycée.** Du CP à la 3e, le cinéma passe par :
> - Les dispositifs CNC ("Ma classe au cinéma")
> - L'intégration dans Arts plastiques et Histoire des arts
> - Les concours (à partir de la 4e)
>
> C'est un **vide programmatique** que Banlieuwood peut combler.

### Concours et dispositifs (4e → Tle)

| Dispositif | Public | Contenu |
|---|---|---|
| **Écris ta série !** | 4e → Tle | Écriture collective de série |
| **Quand le son crée l'image** | 4e → Lycée | Court-métrage à partir d'une bande-son originale |
| **Concours Moteur !** | Collège-Lycée | Film individuel de 90 secondes |
| **Je filme le métier qui me plaît** | Collège-Lycée | Vidéo métier de 3 minutes |
| **Prix Jean Renoir des lycéens** | Lycée | 6 films + jury élèves + écriture critique |
| **César des lycéens** | Terminale | Vote sur films français |
| **Séquences Femmes** | Lycée | Scénario sur l'égalité des genres |

### Plateformes pédagogiques externes

| Plateforme | Contenu | Niveaux |
|---|---|---|
| **Nanouk** | Ressources "Ma classe au cinéma" | Cycles 1-3 |
| **Transmettre le cinéma** | 450+ films, 400+ vidéos d'analyse | Tous |
| **HENRI** (Cinémathèque) | Films rares en streaming gratuit | Lycée+ |
| **European Film Factory** | 10 films européens + dossiers péda | Tous |
| **Ersilia** | Décryptage d'images | Collège/Lycée |
| **Genrimages** | Représentations genrées dans les médias | Collège/Lycée |

---

## 3. Arts Plastiques

### Vue d'ensemble par niveau

| Niveau | Âges | Nom de la discipline | URL Eduscol | Nb ressources |
|---|---|---|---|---|
| **Cycle 1** (Maternelle) | 3-6 | "Productions plastiques et visuelles" | Programme cycle 1 intégré | Minimal |
| **Cycles 2-3** (CP-6e) | 6-12 | Arts plastiques | [/4731](https://eduscol.education.gouv.fr/4731/ressources-d-accompagnement-des-enseignements-en-arts-plastiques-aux-cycles-2-et-3) | ~25 PDF/PPT/vidéos |
| **Cycle 4** (5e-3e) | 12-15 | Arts plastiques | [/5718](https://eduscol.education.gouv.fr/5718/ressources-d-accompagnement-du-programme-d-arts-plastiques-au-cycle-4) | **38 PDF** (le plus riche) |
| **Lycée GT** (2nde-Tle) | 15-18 | Arts plastiques (option 3h + spécialité 4-6h) | [/5772](https://eduscol.education.gouv.fr/5772/programmes-et-ressources-en-arts-plastiques-voie-gt) | ~15 PDF/PPT |
| **Lycée Pro** (CAP/Bac Pro) | 15-18+ | Arts appliqués et cultures artistiques | [/5871](https://eduscol.education.gouv.fr/5871/programmes-et-ressources-en-arts-appliques-et-cultures-artistiques-voie-professionnelle) | 9 PDF |
| **Post-bac CPES-CAAP** | 18-19 | Arts plastiques | Page Eduscol cassée (404) — info sur Onisep | 0 sur Eduscol |
| **BTS/DNMADE** | 18-20+ | N'est plus "arts plastiques" | **Absent d'Eduscol** | 0 |

### Ressources PDF clés — Cycle 4 (38 documents, priorité haute)

**Positionnement disciplinaire (5 PDF) :**
- Quatre fiches enjeux (vue d'ensemble)
- Cadre institutionnel
- Continuum des programmes (progression tous cycles)
- Principes didactiques et progressivité
- Responsabilité pédagogique

**Progression spiralaire (6+ PDF) :**
- La séquence comme unité d'enseignement
- Au fil de la représentation (modèle 5 séquences)
- Progression par approfondissement (3 volets, jusqu'à 6.73 Mo chacun)

**Mise en œuvre pédagogique (12+ PDF) :**
- Articulations compétences-questionnements-acquis
- Attendus de fin de cycle 4
- Tableaux de compétences cycles 2, 3, 4 (comparatif)
- La verbalisation
- Aménagement des salles d'arts plastiques
- 2 études de cas (Sculpture, Intérieur bleu)

**Évaluation (6 PDF) :**
- Textes réglementaires
- Diagnostique-formative-sommative
- Contributions au socle commun

**Approfondissements (14+ PDF) :**
- Numérique : repères et usages
- Interdisciplinarité (2 documents)
- 5 fiches sur l'image
- Analyse d'œuvre
- 6 parties "Enseigner par compétences en arts plastiques"

### Ressources transversales

| Ressource | URL | Contenu |
|---|---|---|
| Hub Arts visuels | [/6931](https://eduscol.education.gouv.fr/6931/arts-visuels) | Concours, partenariats musées, résidences d'artistes |
| La Grande Lessive | Via hub arts visuels | Installation artistique éphémère, tous niveaux |
| Création en cours | Via hub arts visuels | Résidences d'artistes CM1-CM2 (6 mois, écoles rurales) |
| Vademecum patrimoine de proximité | PDF 7.86 Mo | Ministère + INHA (juin 2019) |
| Edubase | [edubase.eduscol.education.fr](https://edubase.eduscol.education.fr/) | Base de scénarios pédagogiques (filtrable par "arts plastiques") |

---

## 4. Français

### Vue d'ensemble par niveau

| Niveau | URL Eduscol | Contenu principal | Format |
|---|---|---|---|
| **Cycle 1** (Maternelle) | [/4698](https://eduscol.education.gouv.fr/4698/le-developpement-et-la-structuration-du-langage-oral-et-ecrit-au-cycle-1) | Langage oral/écrit, 3 livrets par âge, guide vocabulaire | PDF |
| **Cycle 2** (CP-CE2) | [/4740](https://eduscol.education.gouv.fr/4740/ressources-d-accompagnement-du-programme-de-francais-au-cycle-2) | Programme BO oct 2024, livrets CP/CE1, guides lecture/écriture | PDF |
| **Cycle 3** (CM1-6e) | [/4800](https://eduscol.education.gouv.fr/4800/ressources-d-accompagnement-du-programme-de-francais-au-cycle-3) | Programme BO 2023, exemples mise en œuvre CM1/CM2/6e, vidéos | PDF + vidéo |
| **Cycle 4** (5e-3e) | [/5733](https://eduscol.education.gouv.fr/5733/ressources-d-accompagnement-du-programme-de-francais-au-cycle-4) | Programme BO mars 2026 (nouveau), 12 entrées thématiques, étude langue | PDF |
| **Lycée GT** (2nde-1re) | [/5793](https://eduscol.education.gouv.fr/5793/programmes-et-ressources-en-francais-voie-gt) | Programme œuvres bac 2025-26 et 2026-27, ressources EAF oral/écrit | PDF |
| **Lycée Pro** (CAP/Bac Pro) | [/5886](https://eduscol.education.gouv.fr/5886/programmes-et-ressources-en-francais-voie-professionnelle) | Programmes CAP + 2nde/1re/Tle pro, objets d'étude par niveau | PDF |
| **BTS** | **Non disponible sur Eduscol** | "Culture générale et expression" — disponible via BO sup uniquement | — |

### Points de connexion avec Banlieuwood

- **Cycle 3** : les ressources français référencent explicitement le **cinéma** comme support
- **Cycle 4** : 12 entrées thématiques dont "Se raconter" (3e), "Héros et héroïsme" (5e) — directement exploitables pour le storytelling
- **Lycée** : les œuvres au programme et l'EAF (épreuve anticipée de français) incluent des passerelles vers l'expression audiovisuelle
- **Grammaire du français CP-6e** : PDF de référence officiel (2.76 Mo) — utile pour calibrer le niveau de langue du jeu éducatif

---

## 5. Numérique / SNT / NSI

### Vue d'ensemble

| Niveau | Discipline | URL Eduscol | Contenu |
|---|---|---|---|
| **Cycles 1-3** | Transversal (pas de programme propre) | [/6627](https://eduscol.education.gouv.fr/6627/programmation-et-culture-numerique) | Projets partenaires : Class'Code, DeclicK, Code-Decode |
| **Cycle 4** | Techno + Maths (composante informatique) | [/5745](https://eduscol.education.gouv.fr/5745/ressources-d-accompagnement-du-programme-de-technologie-au-cycle-4) | Séquences Arduino, programmation par blocs |
| **Tous niveaux** | **CRCN / Pix** (16 compétences, 8 niveaux) | [/5520](https://eduscol.education.gouv.fr/5520/evaluer-developper-et-certifier-les-competences-numeriques) | Certification obligatoire 3e + Tle, attestation 6e |
| **Lycée 2nde** | **SNT** — Sciences Numériques et Technologie (1.5h/sem) | [/5841](https://eduscol.education.gouv.fr/5841/programmes-et-ressources-en-sciences-numeriques-et-technologie-voie-gt) | 7 thèmes : Internet, Web, Réseaux sociaux, Données, Géoloc, IoT, Photo |
| **Lycée 1re-Tle** | **NSI** — Numérique et Sciences Informatiques (4-6h/sem) | [/5823](https://eduscol.education.gouv.fr/5823/programmes-et-ressources-en-numerique-et-sciences-informatiques-voie-g) | Programmation, algorithmes, structures de données, réseaux |
| **BTS** | **Non disponible sur Eduscol** | — | BTS SIO relève du BO sup |

### Points de connexion avec Banlieuwood

- **CRCN** : si le jeu éducatif développe des compétences numériques (montage vidéo, création numérique collaborative, littératie médiatique), ces compétences se mappent aux 5 domaines CRCN → **valeur institutionnelle ajoutée**
- **SNT** : le thème "Photo numérique" inclut le traitement d'image en Python — passerelle vers les métiers de l'image
- **Pix** : certification obligatoire = fort levier si Banlieuwood peut contribuer à la préparation

---

## 6. EMC — Enseignement Moral et Civique

### Vue d'ensemble

| Niveau | URL Eduscol | Contenu principal |
|---|---|---|
| **Cycle 2** (CP-CE2) | [/4752](https://eduscol.education.gouv.fr/4752/ressources-d-accompagnement-pour-l-enseignement-moral-et-civique-aux-cycles-2-3-et-4) | Livret CP "Se reconnaître comme individu et élève" — nouveau programme en déploiement progressif |
| **Cycle 3** (CM1-6e) | [/4752](https://eduscol.education.gouv.fr/4752/ressources-d-accompagnement-pour-l-enseignement-moral-et-civique-aux-cycles-2-3-et-4) | Livret CM1 "Faire société" |
| **Cycle 4** (5e-3e) | [/4752](https://eduscol.education.gouv.fr/4752/ressources-d-accompagnement-pour-l-enseignement-moral-et-civique-aux-cycles-2-3-et-4) | Livrets 5e "Égalité, fraternité et solidarité", 4e "Droits et libertés" + Vadémécum citoyenneté |
| **Lycée GT** (2nde-Tle) | [/5787](https://eduscol.education.gouv.fr/5787/programmes-et-ressources-en-enseignement-moral-et-civique-voie-gt) | Nouveau programme unifié (BO juin 2024), 18h/an, livrets 2nde et 1re |
| **Lycée Pro** | [/5883](https://eduscol.education.gouv.fr/5883/programmes-et-ressources-en-enseignement-moral-et-civique-voie-professionnelle) | Programmes CAP + Bac Pro, sujets zéro |
| **BTS** | **Non disponible sur Eduscol** | — |

### Points de connexion avec Banlieuwood

- Les thèmes EMC (**égalité, solidarité, droits, libertés, citoyenneté**) sont au cœur du projet Banlieuwood
- Le vadémécum "Éduquer à la citoyenneté" cycle 4 (1.15 Mo) = cadre directement exploitable
- Le débat argumenté (méthode pédagogique EMC) s'articule naturellement avec l'écriture de scénario et l'analyse filmique
- **L'EMC utilise explicitement le film documentaire** comme support pédagogique (ressources voie pro)

---

## 7. Sources hors Eduscol — Stratégiques pour Banlieuwood

### Priorité 0 — Indispensables

| Source | URL | Pourquoi c'est critique |
|---|---|---|
| **CNC — Éducation à l'image** | [cnc.fr/cinema/education-a-l-image](https://www.cnc.fr/cinema/education-a-l-image) | L'équivalent institutionnel de Banlieuwood. ~2M élèves/an. Programmes : Passeurs d'images (QPV, 12-25 ans), Enfants des Lumière(s) (publics éloignés), Écris ta série, l'Atelier cinéma. **Positionnement complémentaire obligatoire.** |
| **Pass Culture (part collective)** | [pass.culture.fr](https://pass.culture.fr/lessentiel-du-pass-enseignants) | **62M EUR/an** de budget collectif. Les écoles achètent des ateliers via ADAGE. Si Banlieuwood est partenaire Pass Culture, c'est un **canal de revenus direct**. Crédits 2026 ouverts depuis février. |
| **Qualiopi** | [travail-emploi.gouv.fr](https://travail-emploi.gouv.fr/qualiopi-marque-de-certification-qualite-des-prestataires-de-formation) | **Obligatoire** si Banlieuwood propose des "formations professionnelles". Sans Qualiopi = pas de fonds publics (OPCO, CPF). 7 critères, 32 indicateurs. |
| **Légifrance — Code de l'Éducation (Arts)** | [legifrance.gouv.fr](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006071191/LEGISCTA000006182399/) | Articles L312-5 à L312-8 : le cinéma et l'expression audiovisuelle sont **explicitement nommés** comme disciplines artistiques obligatoires. Base légale de la légitimité de Banlieuwood. |

### Priorité 1 — Forte valeur stratégique

| Source | URL | Contenu clé |
|---|---|---|
| **ANCT — Cités éducatives** | [citeseducatives.fr](https://www.citeseducatives.fr/le-projet/les-cites-educatives) | 208 quartiers labellisés. "Alliances éducatives" 0-25 ans = exactement le cadre Banlieuwood. Financement et légitimité. |
| **ANCT — Fonds Images de la Diversité** | [anct.gouv.fr](https://anct.gouv.fr/programmes-dispositifs/politique-de-la-ville/culture) | Fonds CNC/ANCT promouvant la diversité dans l'audiovisuel. **Source de financement directe possible.** |
| **Passeurs d'images / Archipel des Lucioles** | [archipel-lucioles.fr](https://www.archipel-lucioles.fr/dispositif-passeurs-dimages) | Éducation à l'image hors temps scolaire, ciblant les 12-25 ans en QPV. **Chevauchement direct avec la mission Banlieuwood** — partenariat ou différenciation nécessaire. |
| **Transmettre le cinéma** | [transmettrelecinema.com](https://transmettrelecinema.com/) | 450+ films, 400+ vidéos d'analyse de séquences, dossiers pédagogiques. **Trésor méthodologique** pour le design de curriculum. |
| **Vie-publique.fr — Rapports** | [vie-publique.fr](https://www.vie-publique.fr/rapport/295171-action-du-ministere-de-la-culture-quartiers-de-la-politique-de-la-ville) | **Statistique clé** : les QPV ne détiennent que **2.5% des équipements culturels** alors qu'ils abritent **8.2% de la population**. Argument massue pour les dossiers de subvention. |
| **France Compétences — RNCP** | [francecompetences.fr](https://www.francecompetences.fr/recherche/rncp/37020/) | Fiche RNCP 37020 : BTS Métiers de l'Audiovisuel. Alignement formation + futur enregistrement possible de certifications Banlieuwood. Open data dispo. |

### Priorité 2 — Valeur d'appui

| Source | URL | Contenu clé |
|---|---|---|
| **ADAGE** | [eduscol /6048](https://eduscol.education.gouv.fr/6048/adage-application-dediee-la-generalisation-de-l-education-artistique-et-culturelle) | Plateforme où les enseignants trouvent les partenaires EAC. Banlieuwood doit y être référencé. |
| **PEAC — Arrêté 2015** | [legifrance.gouv.fr](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000030852198) | 3 piliers : pratique, rencontre, connaissance. L'atelier Banlieuwood coche les 3 → alignement parfait. |
| **Socle commun (révision 2025)** | [education.gouv.fr](https://www.education.gouv.fr/le-socle-commun-de-connaissances-de-competences-et-de-culture-12512) | 5 domaines. Les modules Banlieuwood (storytelling, collaboration, expression) mappent aux domaines 1, 2, 3 et 5. |
| **CRCN / Pix** | [eduscol /5520](https://eduscol.education.gouv.fr/5520/evaluer-developper-et-certifier-les-competences-numeriques) | Si le jeu développe des compétences numériques → mapping CRCN = valeur institutionnelle. |
| **Cinémathèque française** | [cinematheque.fr](https://www.cinematheque.fr/groupes-scolaires.html) | Format "Faire du cinéma" en studio = modèle de référence pour les ateliers. |
| **HCEAC** | [education.gouv.fr](https://www.education.gouv.fr/le-haut-conseil-de-l-education-artistique-et-culturelle-11552) | Label "100% EAC", charte adoptée à Avignon 2016. Rapports annuels utiles. |
| **ONISEP** | [onisep.fr](https://www.onisep.fr/metier/decouvrir-le-monde-professionnel/audiovisuel) | Fiches métiers audiovisuel + open data. Exploitable pour le système de rôles M6. ~13 000 entreprises, 251 000 salariés dans le secteur. |
| **data.education.gouv.fr** | [data.education.gouv.fr](https://data.education.gouv.fr/pages/accueil/) | 28+ datasets en open data (annuaire établissements, REP/REP+, effectifs). API disponible. |

---

## 8. Recommandations scraper

### Phase 1 — Cœur de métier (Cinéma + Arts plastiques)

**Cible prioritaire : 4 pages portails Eduscol + tous leurs PDF**

```
Pages HTML à crawler :
1. eduscol.education.gouv.fr/6934/cinema-et-audiovisuel
2. eduscol.education.gouv.fr/5775/programmes-et-ressources-en-cinema-audiovisuel-voie-gt
3. eduscol.education.gouv.fr/5772/programmes-et-ressources-en-arts-plastiques-voie-gt
4. eduscol.education.gouv.fr/5718/ressources-d-accompagnement-du-programme-d-arts-plastiques-au-cycle-4
5. eduscol.education.gouv.fr/4731/ressources-d-accompagnement-des-enseignements-en-arts-plastiques-aux-cycles-2-et-3

PDF à télécharger :
- Tous les programmes officiels (BO) référencés sur ces pages
- Toutes les ressources d'accompagnement
- Guide diffusion œuvres cinéma en classe
- Vadémécum ciné-club
- Référentiel BTS audiovisuel (sti.eduscol.education.fr)
```

**Volume estimé** : ~80-100 PDF, ~10 pages HTML

### Phase 2 — Extension disciplines (Français, EMC, Numérique)

```
Pages HTML à crawler :
6. eduscol.education.gouv.fr/4740 (français cycle 2)
7. eduscol.education.gouv.fr/4800 (français cycle 3)
8. eduscol.education.gouv.fr/5733 (français cycle 4)
9. eduscol.education.gouv.fr/5793 (français lycée GT)
10. eduscol.education.gouv.fr/4752 (EMC cycles 2-3-4)
11. eduscol.education.gouv.fr/5787 (EMC lycée GT)
12. eduscol.education.gouv.fr/5520 (CRCN/Pix)
13. eduscol.education.gouv.fr/5841 (SNT)
```

**Volume estimé** : ~150-200 PDF supplémentaires

### Phase 3 — Sources stratégiques hors Eduscol

```
Sites à crawler :
- cnc.fr/cinema/education-a-l-image (+ sous-pages)
- transmettrelecinema.com (catalogue films + dossiers)
- pass.culture.fr (pages enseignants/partenaires)
- francecompetences.fr/recherche/rncp/37020/ (BTS audiovisuel)
- legifrance.gouv.fr (articles Code Education + arrêté PEAC)
- vie-publique.fr (rapports QPV/culture)
- archipel-lucioles.fr (Passeurs d'images)
```

### Contraintes techniques à respecter

| Règle | Détail |
|---|---|
| `Crawl-delay` | 10 secondes entre requêtes (Eduscol) |
| User-Agent | Identifier clairement le bot (ex: `BanlieuwoodScraper/1.0`) |
| Chemins interdits | `/search`, `/admin`, `/user`, fichiers Drupal |
| Format de sortie recommandé | JSON (métadonnées) + PDF bruts + Markdown (contenu HTML converti) |
| Stockage | Organiser par `{matière}/{cycle}/{document}` |

### Estimation effort total

| Phase | Pages HTML | PDF estimés | Temps scraping (10s/req) |
|---|---|---|---|
| Phase 1 | ~5 | ~100 | ~18 min |
| Phase 2 | ~8 | ~200 | ~35 min |
| Phase 3 | ~15 | ~50 | ~12 min |
| **Total** | **~28** | **~350** | **~65 min** |

---

## Annexe — Observations stratégiques pour Banlieuwood

### Le vide que Banlieuwood peut combler

1. **Pas de programme cinéma avant le lycée** — du CP à la 3e, le cinéma n'existe qu'en dispositifs (visionnage) et intégration transversale. **Aucun programme de création/production** n'existe à ces niveaux. Banlieuwood se positionne exactement dans ce vide.

2. **La voie professionnelle n'a pas d'option cinéma** — l'ancien Bac Pro SEN Audiovisuel est abrogé. Les élèves de lycée pro n'accèdent au cinéma que par "Lycéens et apprentis au cinéma" (visionnage). Banlieuwood peut être leur seule expérience de création.

3. **2.5% d'équipements culturels dans les QPV** (8.2% de la population) — le déficit est documenté par l'IGAC. Banlieuwood apporte la culture là où elle manque.

### Le positionnement institutionnel optimal

```
Banlieuwood = passerelle entre :

  ÉCOLE (temps scolaire)              QUARTIER (hors temps scolaire)
  ├─ Programmes Éducation Nationale   ├─ Passeurs d'images
  ├─ Pass Culture collectif           ├─ Cités éducatives
  ├─ EAC / PEAC                       ├─ Politique de la ville
  └─ ADAGE                            └─ ANCT / Fonds Images Diversité

Banlieuwood opère sur les DEUX côtés :
- Ateliers en temps scolaire (financés Pass Culture)
- Ateliers hors temps scolaire (financés politique de la ville)
- Jeu éducatif (utilisable partout, mappé au socle commun)
```

### Les 5 alignements à formaliser

1. **PEAC** : démontrer que chaque atelier couvre les 3 piliers (pratique + rencontre + connaissance)
2. **Socle commun** : mapper les modules du jeu aux 5 domaines du socle
3. **CRCN** : si applicable, mapper les compétences numériques du jeu
4. **Programmes disciplinaires** : identifier les compétences arts plastiques / français / EMC travaillées
5. **RNCP** : pour les formations longues, aligner sur les blocs de compétences du BTS audiovisuel

---

*Document généré le 22 mars 2026 — Atelier Banlieuwood*
