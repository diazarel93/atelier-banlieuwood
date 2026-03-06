"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { DashboardHeader } from "@/components/dashboard-header";

interface FicheData {
  title: string;
  duration: string;
  objectives: { objective: string; socleCommun: string }[];
  competencies: {
    domaine1: { title: string; skills: string[] };
    domaine3: { title: string; skills: string[] };
    domaine5: { title: string; skills: string[] };
  };
  animationTips: { phase: string; tip: string; timing: string }[];
  relaunchTips: string[];
  adaptationByLevel: { primaire: string; college: string; lycee: string };
  evaluation: string[];
  sessionRecap: string | null;
}

const SOCLE_COLORS: Record<string, string> = {
  D1: "#3B82F6",
  D3: "#10B981",
  D5: "#8B5CF6",
};

const LEVEL_OPTIONS = [
  { value: "primaire", label: "Primaire (Cycle 3)" },
  { value: "college", label: "Coll\u00e8ge (Cycle 4)" },
  { value: "lycee", label: "Lyc\u00e9e" },
];

export default function FicheCoursPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [level, setLevel] = useState("college");
  const [fiche, setFiche] = useState<FicheData | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [openDomaine, setOpenDomaine] = useState<string | null>(null);
  const [adaptTab, setAdaptTab] = useState<"primaire" | "college" | "lycee">("college");

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCheckingAuth(false);
    }
    check();
  }, [router]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setFiche(null);
    try {
      const res = await fetch("/api/fiche-cours/generic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur");
      }
      const data = await res.json();
      setFiche(data.fiche);
      setProvider(data.provider);
      setAdaptTab(level as "primaire" | "college" | "lycee");
      toast.success("Fiche g\u00e9n\u00e9r\u00e9e !");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [level]);

  function downloadMarkdown(f: FicheData) {
    const lines = [
      `# ${f.title}`,
      "",
      `**Dur\u00e9e :** ${f.duration}`,
      "",
      "## Objectifs",
      ...f.objectives.map((o) => `- [${o.socleCommun}] ${o.objective}`),
      "",
      "## Comp\u00e9tences",
      "",
      `### ${f.competencies.domaine1.title}`,
      ...f.competencies.domaine1.skills.map((s) => `- ${s}`),
      "",
      `### ${f.competencies.domaine3.title}`,
      ...f.competencies.domaine3.skills.map((s) => `- ${s}`),
      "",
      `### ${f.competencies.domaine5.title}`,
      ...f.competencies.domaine5.skills.map((s) => `- ${s}`),
      "",
      "## Conseils d'animation",
      ...f.animationTips.map((t) => `- **${t.phase}** (${t.timing}) : ${t.tip}`),
      "",
      "## Relance",
      ...f.relaunchTips.map((t) => `- ${t}`),
      "",
      "## Adaptation par niveau",
      `- **Primaire :** ${f.adaptationByLevel.primaire}`,
      `- **Coll\u00e8ge :** ${f.adaptationByLevel.college}`,
      `- **Lyc\u00e9e :** ${f.adaptationByLevel.lycee}`,
      "",
      "## \u00c9valuation",
      ...f.evaluation.map((e) => `- ${typeof e === 'string' ? e : Object.values(e as Record<string, string>).join(' — ')}`),
    ];
    const md = lines.join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fiche-cours-${level}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (checkingAuth) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <PageShell maxWidth="lg">
      <DashboardHeader
        backHref="/dashboard"
        backLabel="Dashboard"
        actions={
          fiche ? (
            <Button variant="teal" size="sm" onClick={() => downloadMarkdown(fiche)}>
              Télécharger .md
            </Button>
          ) : undefined
        }
      />
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-cinema tracking-wide uppercase">Fiche de Cours</h1>
          <p className="text-bw-muted">G\u00e9n\u00e9rez une fiche p\u00e9dagogique avant votre session</p>
        </div>

        {/* Level selector */}
        <Card className="p-6 space-y-4">
          <label className="text-sm font-medium text-bw-muted">Niveau</label>
          <div className="flex gap-3">
            {LEVEL_OPTIONS.map((opt) => (
              <Button key={opt.value}
                variant={level === opt.value ? "teal" : "outline"}
                onClick={() => setLevel(opt.value)}
                className="flex-1"
              >
                {opt.label}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Génération en cours..." : "Générer la fiche"}
          </Button>
        </Card>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-8">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-bw-violet border-t-transparent rounded-full" />
            <span className="text-sm text-bw-muted">L&apos;IA pr\u00e9pare la fiche p\u00e9dagogique...</span>
          </div>
        )}

        {fiche && (
          <div className="space-y-4">
            {provider && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-bw-bg/50 text-bw-muted border border-white/[0.06]">
                {provider === "fallback" ? "Template" : provider}
              </span>
            )}

            {/* Title + Duration */}
            <div className="bg-bw-surface rounded-xl p-5 border-l-4 border-bw-violet">
              <h3 className="text-lg font-semibold">{fiche.title}</h3>
              <p className="text-sm text-bw-muted mt-1">{fiche.duration}</p>
            </div>

            {/* Objectives */}
            <Card className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted mb-3 block">Objectifs</span>
              <div className="space-y-2">
                {fiche.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${SOCLE_COLORS[obj.socleCommun] || "#666"}20`,
                        color: SOCLE_COLORS[obj.socleCommun] || "#666",
                      }}>
                      {obj.socleCommun}
                    </span>
                    <span className="text-sm text-bw-text">{obj.objective}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Competencies accordion */}
            <Card className="p-0 overflow-hidden">
              <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted px-5 pt-5 block">Compétences du socle commun</span>
              {(["domaine1", "domaine3", "domaine5"] as const).map((key) => {
                const domaine = fiche.competencies[key];
                if (!domaine) return null;
                const isOpen = openDomaine === key;
                const color = key === "domaine1" ? "#3B82F6" : key === "domaine3" ? "#10B981" : "#8B5CF6";
                return (
                  <div key={key} className="border-t border-bw-border">
                    <button
                      onClick={() => setOpenDomaine(isOpen ? null : key)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-medium" style={{ color }}>{domaine.title}</span>
                      <span className="text-xs text-bw-muted">{isOpen ? "\u25B2" : "\u25BC"}</span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 space-y-1">
                        {domaine.skills.map((skill, i) => (
                          <p key={i} className="text-sm text-bw-text pl-3 border-l-2" style={{ borderLeftColor: color }}>
                            {skill}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </Card>

            {/* Animation tips */}
            <Card className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted mb-3 block">Conseils d&apos;animation</span>
              <div className="space-y-3">
                {fiche.animationTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs font-mono text-bw-violet bg-bw-violet/10 px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                      {tip.timing}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-bw-ink">{tip.phase}</span>
                      <p className="text-sm text-bw-placeholder mt-0.5">{tip.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Relaunch tips */}
            <Card className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted mb-3 block">Relancer les élèves</span>
              <ul className="space-y-2">
                {fiche.relaunchTips.map((tip, i) => (
                  <li key={i} className="text-sm text-bw-text pl-3 border-l-2 border-bw-amber">{tip}</li>
                ))}
              </ul>
            </Card>

            {/* Adaptation by level */}
            <Card className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted mb-3 block">Adaptation par niveau</span>
              <div className="flex gap-2 mb-3">
                {(["primaire", "college", "lycee"] as const).map((lvl) => (
                  <Button key={lvl}
                    variant={adaptTab === lvl ? "teal" : "ghost"}
                    size="xs"
                    onClick={() => setAdaptTab(lvl)}
                    className="rounded-full"
                  >
                    {lvl === "primaire" ? "Primaire" : lvl === "college" ? "Collège" : "Lycée"}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-bw-text">{fiche.adaptationByLevel[adaptTab]}</p>
            </Card>

            {/* Evaluation */}
            <Card className="p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted mb-3 block">Critères d&apos;évaluation</span>
              <ul className="space-y-2">
                {fiche.evaluation.map((crit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-bw-text">
                    <span className="text-bw-green flex-shrink-0 mt-0.5">&#10003;</span>
                    {typeof crit === 'string' ? crit : Object.values(crit as Record<string, string>).join(' — ')}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
    </PageShell>
  );
}
