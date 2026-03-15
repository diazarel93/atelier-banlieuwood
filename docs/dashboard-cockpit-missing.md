# Features Manquantes — Dashboard & Cockpit

> Date : 2026-03-15 | 26 items identifiés

---

## TOP 10 — Impact critique

### 1. Éditer une session (titre, classe, date, niveau)
- **Où** : Page détail session `/v2/seances/[id]`
- **Problème** : Après création, tout est read-only. Le prof ne peut pas corriger une erreur.
- **Solution** : Modal d'édition ou inline editing sur titre, class_label, level, scheduled_at, thematique
- **Fichiers** : `src/app/(cockpit-v2)/v2/seances/[id]/page.tsx`, `src/app/api/sessions/[id]/route.ts`

### 2. Supprimer/archiver une session
- **Où** : Liste sessions + détail
- **Problème** : Impossible de nettoyer les sessions test ou obsolètes
- **Solution** : Soft delete (deleted_at) + bouton Archive dans l'action bar + filtre "Archivées"
- **Fichiers** : `src/app/(cockpit-v2)/v2/seances/[id]/page.tsx`, `src/app/(cockpit-v2)/v2/seances/page.tsx`, `src/app/api/sessions/[id]/route.ts`

### 3. Page Réglages prof
- **Où** : Nouvelle page `/v2/settings`
- **Problème** : Pas de logout visible, pas de changement de mot de passe, pas de préférences
- **Solution** : Page settings avec : profil (nom, email), sécurité (mot de passe), préférences (niveau par défaut, classe par défaut), déconnexion
- **Fichiers** : Créer `src/app/(cockpit-v2)/v2/settings/page.tsx`, `src/app/api/auth/update-profile/route.ts`

### 4. Timer visible sur écran projecteur
- **Où** : Screen page `/session/[id]/screen`
- **Problème** : Les élèves ne voient pas le temps restant
- **Solution** : Afficher le countdown timer quand timer_ends_at est défini
- **Fichiers** : `src/app/(dashboard)/session/[id]/screen/page.tsx`

### 5. Autocomplete classe à la création
- **Où** : Create wizard
- **Problème** : Le prof retape le nom de classe à chaque fois
- **Solution** : Datalist/autocomplete depuis les class_label existants
- **Fichiers** : `src/components/v2/session-create-wizard.tsx`, `src/app/api/sessions/route.ts`

### 6. Résultats par élève dans une session
- **Où** : Results page `/v2/seances/[id]/results`
- **Problème** : Que des agrégats classe, pas de vue individuelle
- **Solution** : Tab ou dropdown "Par élève" montrant les réponses, scores, temps de réponse de chaque élève
- **Fichiers** : `src/app/(cockpit-v2)/v2/seances/[id]/results/page.tsx`

### 7. Notes privées par session
- **Où** : Session detail
- **Problème** : Le prof ne peut pas annoter ses sessions
- **Solution** : Champ texte persisté en DB (colonne `teacher_notes` sur sessions)
- **Fichiers** : `src/app/(cockpit-v2)/v2/seances/[id]/page.tsx`, `src/app/api/sessions/[id]/route.ts`, migration

### 8. Export PDF résultats
- **Où** : Results page
- **Problème** : `window.print()` donne un résultat médiocre
- **Solution** : Générer un PDF côté client (html2canvas + jsPDF) ou côté serveur
- **Fichiers** : `src/app/(cockpit-v2)/v2/seances/[id]/results/page.tsx`

### 9. Bouton "Créer une séance" depuis la bibliothèque
- **Où** : Library page `/v2/bibliotheque`
- **Problème** : Le catalogue est read-only
- **Solution** : Bouton dans le ModuleGuideModal qui redirige vers `/v2/seances/new?module=X`
- **Fichiers** : `src/app/(cockpit-v2)/v2/bibliotheque/page.tsx`, `src/components/v2/module-guide-modal.tsx`

### 10. Filtre par date sur les statistiques
- **Où** : Stats page `/v2/statistiques`
- **Problème** : Pas de bilan trimestriel possible
- **Solution** : Date range picker (début/fin) filtrant les sessions utilisées pour le calcul
- **Fichiers** : `src/app/(cockpit-v2)/v2/statistiques/page.tsx`, `src/app/api/v2/stats/route.ts`

---

## TOP 11-20 — Importants

### 11. Historique de présence
- **Où** : Student detail + Results
- **Solution** : Liste des sessions avec "présent/absent" basé sur students.is_active

### 12. Édition pseudo élève par le prof
- **Où** : Student list/detail
- **Solution** : Bouton éditer + PATCH student display_name

### 13. Lien partageable résultats lecture seule
- **Où** : Results page
- **Solution** : Générer un token unique, page publique `/results/[token]`

### 14. Questions spontanées pendant session live
- **Où** : Cockpit pilot
- **Solution** : Bouton "Question libre" qui crée une situation temporaire

### 15. Contrôle direct écran projecteur
- **Où** : Cockpit pilot
- **Solution** : Boutons "Afficher sur écran" pour changer le mode (question/wordcloud/réponses/blank)

### 16. Séances récurrentes
- **Où** : Create wizard
- **Solution** : Option "Répéter" (hebdo/bi-hebdo) avec date de fin

### 17. Actions bulk sessions
- **Où** : Session list
- **Solution** : Checkboxes + toolbar flottante (archiver, supprimer)

### 18. Stats par module
- **Où** : Stats page
- **Solution** : Dropdown module en plus des filtres existants

### 19. Page d'aide / documentation
- **Où** : Nouvelle page `/v2/aide`
- **Solution** : FAQ, guides, vidéos tutoriels, contact support

### 20. Recherche admin users
- **Où** : Admin users page
- **Solution** : Champ search par nom/email

---

## 21-26 — Cockpit live

### 21. Nudge élève sans réponse
- **Solution** : Message ciblé via broadcast filtré par studentId

### 22. Gel écran projecteur (freeze)
- **Solution** : Flag `screen_frozen` sur session, écran ignore les updates

### 23. Preview écran élève
- **Solution** : Mini iframe ou screenshot de la vue élève dans le cockpit

### 24. Timeout temporaire (vs kick)
- **Solution** : Champ `muted_until` sur student, auto-unmute après X minutes

### 25. Export session complète
- **Solution** : Export Markdown de TOUTES les questions + réponses + votes

### 26. Filtre par date stats (implémentation)
- Couvert par item 10

---

## Ordre d'exécution

| Phase | Items | Effort |
|-------|-------|--------|
| 1. Quick wins | 4, 5, 9, 20 | 1h |
| 2. Session CRUD | 1, 2, 7 | 2h |
| 3. Settings + UX | 3, 12 | 2h |
| 4. Résultats | 6, 8, 10, 13 | 3h |
| 5. Cockpit avancé | 14, 15, 21, 22, 25 | 4h |
| 6. Planning | 16, 17 | 2h |
| 7. Analytics | 11, 18 | 2h |
| 8. Aide | 19 | 1h |
| 9. Cockpit bonus | 23, 24 | 2h |

**Total estimé : ~19h**
