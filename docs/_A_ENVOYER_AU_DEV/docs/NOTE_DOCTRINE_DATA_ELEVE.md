# Note de doctrine — Data élève — Banlieuwood
> Extrait à l'usage du développeur — Cycle 1
> Document complet : `NOTE_DOCTRINE_DATA_ELEVE_BANLIEUWOOD.docx` (dossier 02_pédagogie)

---

## Section 0 — Principe fondateur

La donnée élève dans Banlieuwood n'est pas une donnée de performance. C'est une donnée pédagogique au service du processus d'apprentissage.

**Ce que la data élève PEUT faire :**
- Signaler à l'intervenant ce qui se passe dans la classe en temps réel (participation, rythme, accrocs)
- Permettre à l'élève de se voir progresser sur sa propre trajectoire
- Alimenter des bilans de séance anonymisés pour le professeur
- Améliorer les outils Banlieuwood par retour d'expérience agrégé

**Ce que la data élève NE PEUT PAS faire :**
- Classer les élèves entre eux (aucun classement comparatif)
- Produire un profil psychologique ou comportemental de l'élève
- Être utilisée pour évaluer, noter, ou étiqueter un élève
- Être stockée sous forme nominative au-delà de la séance sans consentement explicite

**Règle de conception :** Si une fonctionnalité permet à un adulte d'identifier un élève et de l'évaluer à partir de ses données, cette fonctionnalité ne doit pas exister dans l'outil.

---

## Section 4.1 — Profils et scores dérivés

Banlieuwood dispose de ses propres systèmes de profils pédagogiques, construits à partir du curriculum officiel :

**Profils de rôle (Module 6) :**
Acteur / Créatif / Détective / Provocateur / Stratège

**Affinités de famille (Module 8) :**
3 familles définies dans le curriculum officiel

**Ce qui n'est PAS autorisé :**
- Tout scoring dérivé non issu du curriculum officiel Banlieuwood
- Tout profilage calculé automatiquement à partir de comportements d'utilisation (clics, vitesse de réponse, patterns de participation)
- Tout score présentant une valeur comme indicateur de qualité ou de performance de l'élève

**Application directe :** Un profil OIE (Originalité / Initiative / Exécution) ou tout scoring similaire non issu d'un curriculum Banlieuwood officiel ne doit pas être implémenté ni affiché.

---

## Section 5 — Architecture des rôles

Banlieuwood opère avec **deux rôles distincts**, avec des accès data différenciés :

| Rôle | Qui | Moment | Accès data |
|---|---|---|---|
| **Intervenant** | Animateur externe (Banlieuwood) | Pendant la séance | Cockpit temps réel — données de séance uniquement |
| **Professeur** | Enseignant de la classe | Après la séance | Dashboard post-séance — tendances de groupe anonymisées |

Ces deux rôles **ne sont pas interchangeables** et ne doivent pas avoir accès aux mêmes données.

**Règle de conception :** L'intervenant ne doit pas avoir accès aux données de performance individuelles de chaque élève. Le professeur ne doit pas avoir accès au cockpit temps réel de séance.

---

## Section 6 — Dashboard professeur : granularité autorisée

**Ce que le dashboard professeur MONTRE :**
- Tendances pédagogiques de groupe (ex : thème le plus choisi dans la classe, répartition des décisions collectives)
- Signaux de participation collective (ex : taux de réponse global)
- Dynamiques émergentes sur plusieurs séances (à partir de la Famille 2, F2)
- Extraits anonymes de productions collectives

**Ce que le dashboard professeur NE MONTRE PAS :**
- Aucun tableau pseudo-performatif élève par élève
- Aucun score individuel associé à un nom ou un pseudonyme stable
- Aucun indicateur permettant de comparer deux élèves entre eux
- Aucune synthèse permettant d'inférer le niveau ou la progression d'un élève identifiable

**Règle de conception :** Si une fonctionnalité du dashboard permet au professeur d'évaluer un élève identifiable à partir de ses données, la fonctionnalité ne doit pas exister.

---

## Section 7 — Ce qui est interdit avant le terrain

Les fonctionnalités suivantes sont incompatibles avec la doctrine Banlieuwood et **doivent être désactivées avant tout test en classe** :

**Classement comparatif entre élèves**
— Leaderboard, classement de score, podium, ou toute interface montrant la position relative d'un élève par rapport aux autres.
— Remplacer par : vue de progression personnelle (XP propre + niveau propre).

**Profilage comportemental automatique**
— Tout système inférant un profil à partir de comportements d'utilisation sans que l'élève ait répondu à des questions de curriculum.
— Désactiver jusqu'à validation de la spec avec Banlieuwood.

**Détection automatique d'élèves "à risque"**
— Tout widget, alerte, ou signal identifiant un élève comme étant en difficulté à partir de ses données de participation.
— Acceptable en remplacement : alerte factuelle "élève sans réponse depuis X minutes" — visible uniquement pendant la séance, non stockée, non nominative.

---

*Extrait produit le 21 mars 2026 — Banlieuwood — Pont développeur Cycle 1.*
*Se référer au document complet NOTE_DOCTRINE_DATA_ELEVE_BANLIEUWOOD.docx pour la doctrine complète.*
