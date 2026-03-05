// Narrative categories — shared across all pages
export const CATEGORIES = [
  // Module 3
  { key: "personnage", label: "Personnage", color: "#FF6B35" },
  { key: "liens", label: "Liens", color: "#4ECDC4" },
  { key: "environnement", label: "Environnement", color: "#8B5CF6" },
  { key: "conflit", label: "Conflit", color: "#EF4444" },
  { key: "trajectoire", label: "Trajectoire", color: "#F59E0B" },
  { key: "intention", label: "Intention", color: "#10B981" },
  { key: "renforcement", label: "Renforcement", color: "#EC4899" },
  // Module 1
  { key: "positionnement", label: "Positionnement", color: "#8B5CF6" },
  { key: "image", label: "Image", color: "#4ECDC4" },
  { key: "carnet", label: "Carnet", color: "#F59E0B" },
  // Module 9 (old Module 2 — cinema questions)
  { key: "metiers", label: "Métiers", color: "#3B82F6" },
  { key: "budget", label: "Budget", color: "#F59E0B" },
  { key: "contrainte", label: "Contrainte", color: "#8B5CF6" },
  { key: "resolution", label: "Résolution", color: "#EF4444" },
  { key: "organisation", label: "Organisation", color: "#10B981" },
  // Module 2 — Émotion Cachée
  { key: "emotion_cachee", label: "Émotion", color: "#EC4899" },
  // Module 10 — Et si / Pitch
  { key: "imagination", label: "Imagination", color: "#06B6D4" },
  { key: "pitch", label: "Pitch", color: "#F59E0B" },
] as const;

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.color])
);

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
);

// Module 2 — Production categories with 3 options each
// storyCategory links to narrative categories from Module 3 collective_choices
export interface BudgetOption {
  label: string;
  cost: number;
}

export interface ProductionCategory {
  key: string;
  label: string;
  color: string;
  storyCategory: string | null; // links to Module 3 category for narrative context
  options: BudgetOption[];
}

// Keep old type for backward compat
export type BudgetCategory = ProductionCategory;

export const PRODUCTION_CATEGORIES: ProductionCategory[] = [
  {
    key: "acteurs",
    label: "Casting",
    color: "#FF6B35",
    storyCategory: "personnage",
    options: [
      { label: "Figurants (toi seul face caméra)", cost: 5 },
      { label: "Amateurs (ton groupe de potes)", cost: 20 },
      { label: "Stars (toute la classe + un adulte)", cost: 40 },
    ],
  },
  {
    key: "decors",
    label: "Décors",
    color: "#4ECDC4",
    storyCategory: "environnement",
    options: [
      { label: "Huis clos (une seule salle)", cost: 5 },
      { label: "Lieu simple (2-3 endroits dans l'école)", cost: 20 },
      { label: "Lieu exceptionnel (accès partout, même dehors)", cost: 35 },
    ],
  },
  {
    key: "technique",
    label: "Image",
    color: "#8B5CF6",
    storyCategory: "conflit",
    options: [
      { label: "Brut (téléphone posé, plan fixe)", cost: 0 },
      { label: "Soigné (téléphone à la main, mouvements)", cost: 10 },
      { label: "Cinéma (téléphone + lumière maison, lampe, rideau)", cost: 25 },
    ],
  },
  {
    key: "son",
    label: "Son",
    color: "#F59E0B",
    storyCategory: null,
    options: [
      { label: "Muet (sous-titres à la place)", cost: 0 },
      { label: "Direct (les voix des acteurs)", cost: 10 },
      { label: "Bande-son (voix + musique de fond)", cost: 20 },
    ],
  },
  {
    key: "montage",
    label: "Montage",
    color: "#EC4899",
    storyCategory: null,
    options: [
      { label: "Plan-séquence (pas de coupure)", cost: 0 },
      { label: "Coupé (CapCut, montage simple)", cost: 10 },
      { label: "Travaillé (transitions, texte, effets)", cost: 25 },
    ],
  },
];

// Backward compat alias
export const BUDGET_CATEGORIES = PRODUCTION_CATEGORIES;

export const BUDGET_TOTAL = 100;
export const BUDGET_RESERVE_MIN = 10;

// Generate budget summary text from choices
export function generateBudgetSummary(choices: Record<string, number>): string {
  const parts: string[] = [];
  for (const cat of PRODUCTION_CATEGORIES) {
    const selectedCost = choices[cat.key];
    if (selectedCost == null) continue;
    const option = cat.options.find((o) => o.cost === selectedCost);
    if (option) {
      parts.push(`${cat.label.toLowerCase()} : ${option.label.toLowerCase()}`);
    }
  }
  const remaining = BUDGET_TOTAL - Object.values(choices).reduce((a, b) => a + b, 0);
  return `Ton film a ${parts.join(", ")}. Réserve : ${remaining} crédits.`;
}

// Genre templates for sessions
export const TEMPLATES = [
  { key: "comedie", label: "Comédie" },
  { key: "drame", label: "Drame" },
  { key: "thriller", label: "Thriller" },
  { key: "romance", label: "Romance" },
  { key: "action", label: "Action" },
  { key: "horreur", label: "Horreur" },
  { key: "chronique", label: "Chronique" },
  { key: "policier", label: "Policier" },
] as const;

// Thématiques scolaires (sujets de fond pour ancrer l'histoire)
export const THEMATIQUES = [
  { key: "harcelement", label: "Harcèlement", color: "#EF4444" },
  { key: "amitie", label: "Amitié", color: "#4ECDC4" },
  { key: "famille", label: "Famille", color: "#F59E0B" },
  { key: "identite", label: "Identité", color: "#8B5CF6" },
  { key: "difference", label: "Différence", color: "#EC4899" },
  { key: "confiance", label: "Confiance en soi", color: "#10B981" },
  { key: "injustice", label: "Injustice", color: "#FF6B35" },
  { key: "grandir", label: "Grandir", color: "#6366F1" },
  { key: "mensonge", label: "Mensonge / Vérité", color: "#F97316" },
  { key: "courage", label: "Courage", color: "#14B8A6" },
] as const;

export const THEMATIQUE_LABELS: Record<string, string> =
  Object.fromEntries(THEMATIQUES.map((t) => [t.key, t.label]));

export const TEMPLATE_LABELS: Record<string, string> =
  Object.fromEntries(TEMPLATES.map((t) => [t.key, t.label]));

// Séance structure: number of situations per séance (Module 3)
// Also used for Module 4 via MODULE_SITUATIONS
export const SEANCE_SITUATIONS: Record<number, number> = { 1: 8, 2: 8, 3: 5 };

// Module-level situation count (for modules that don't use séances or with special handling)
// Module 2 séance 2 = budget quiz (special BudgetState component, not regular Q&A)
export const MODULE_SITUATIONS: Record<number, number> = { 4: 8 };

// Per-module séance structure (canonical source for all modules with séances)
export const MODULE_SEANCE_SITUATIONS: Record<number, Record<number, number>> = {
  1: { 1: 8, 2: 1, 3: 1, 4: 1, 5: 1 },  // Positionnement (8), Image 1 (1), Image 2 (1), Image 3 (1), Carnet (1)
  2: { 1: 3, 2: 2, 3: 2, 4: 2 },   // Émotion Cachée: Mise en bain (3), Émotion (2), Collectif (2), Clôture (2)
  3: { 1: 8, 2: 8, 3: 5 },          // Le Héros (8), Le Conflit (8), Le Sens (5)
  4: { 1: 8 },                       // Vis ma vie (8 situations, 1 séance)
  9: { 1: 8, 2: 5, 3: 8, 4: 8 },  // Old cinema (was Module 2): Le Cinéma (8), Les Choix/budget (5), Les Imprévus (8), Le Plan (8)
  10: { 1: 3, 2: 5 },             // Et si... (3), Pitch (5)
  11: { 1: 6, 2: 6, 3: 6, 4: 6 }, // Ciné-Débat: L'Art de Raconter (6), Émotions (6), Héros (6), Coulisses (6)
};

/** Helper: get max situations for a module + séance combo */
export function getSeanceMax(mod: number, seance: number): number {
  return MODULE_SEANCE_SITUATIONS[mod]?.[seance] ?? SEANCE_SITUATIONS[seance] ?? 8;
}

// Total situations across all séances
export const TOTAL_SITUATIONS = Object.values(SEANCE_SITUATIONS).reduce((a, b) => a + b, 0);
