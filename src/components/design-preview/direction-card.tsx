// Composant utilitaire pour les previews de direction artistique
// Usage : uniquement dans src/app/design-preview/
// Supprimer ce dossier apres validation de la direction choisie

type Score = {
  lisibilite: number; // /5
  brand: number; // /5
  effort: "S" | "M" | "L";
  modernite: number; // /5
  emotion: number; // /5
};

const EFFORT_LABEL = { S: "Rapide < 2h", M: "Moyen 2-8h", L: "Long > 8h" };
const EFFORT_COLOR = {
  S: "text-green-400",
  M: "text-yellow-400",
  L: "text-orange-400",
};

function ScoreBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`h-1.5 w-4 rounded-full ${i < value ? "bg-white" : "bg-white/20"}`} />
      ))}
    </div>
  );
}

export function DirectionCard({
  name,
  concept,
  recommended,
  score,
  children,
}: {
  name: string;
  concept: string;
  recommended?: boolean;
  score: Score;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border overflow-hidden ${
        recommended ? "border-[#FF6B35]/40 ring-1 ring-[#FF6B35]/20" : "border-white/10"
      } bg-white/5`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs uppercase tracking-widest text-white/40">{name}</p>
          {recommended && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30">
              Recommandé
            </span>
          )}
        </div>
        <p className="text-white/70 text-sm leading-snug">{concept}</p>
      </div>

      {/* Preview */}
      <div className="flex-1 p-4 overflow-hidden">{children}</div>

      {/* Scores */}
      <div className="px-5 py-4 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>Lisibilité iPad</span>
          <ScoreBar value={score.lisibilite} />
        </div>
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>Cohérence brand</span>
          <ScoreBar value={score.brand} />
        </div>
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>Modernité 2026</span>
          <ScoreBar value={score.modernite} />
        </div>
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>Émotion cible</span>
          <ScoreBar value={score.emotion} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Effort impl.</span>
          <span className={`font-medium ${EFFORT_COLOR[score.effort]}`}>
            {score.effort} — {EFFORT_LABEL[score.effort]}
          </span>
        </div>
      </div>
    </div>
  );
}
