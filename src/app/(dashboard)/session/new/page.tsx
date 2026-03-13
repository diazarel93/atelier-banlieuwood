"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { TEMPLATES, THEMATIQUES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/page-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { ROUTES } from "@/lib/routes";

const LEVELS = [
  { value: "primaire", label: "Primaire", desc: "6-9 ans" },
  { value: "college", label: "Collège", desc: "10-13 ans" },
  { value: "lycee", label: "Lycée", desc: "14-18 ans" },
];

export default function NewSessionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("college");
  const [template, setTemplate] = useState<string | null>(null);
  const [thematique, setThematique] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [questionTimer, setQuestionTimer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [quickStartMode, setQuickStartMode] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(ROUTES.login);
        return;
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  async function handleCreate(overrideTitle?: string) {
    const finalTitle = overrideTitle ?? title;
    if (!finalTitle.trim()) {
      toast.error("Donne un titre à ta partie");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle.trim(),
          level,
          template,
          thematique,
          description: description.trim() || undefined,
          question_timer: questionTimer || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur de création");
        setLoading(false);
        return;
      }

      const session = await res.json();
      toast.success("Partie créée !");
      router.push(ROUTES.sessionDetail(session.id));
    } catch {
      toast.error("Erreur de connexion");
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <PageShell maxWidth="md">
      <DashboardHeader backHref={ROUTES.legacyDashboard} backLabel="Retour" />
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #D4A843)",
              boxShadow: "0 8px 32px rgba(255,107,53,0.25)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" />
              <path d="M7 2v20M17 2v20M2 12h20" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold font-cinema tracking-wider">Nouvelle partie</h1>
          <p className="text-bw-muted text-sm">
            Configure ta partie avant d&apos;accueillir les joueurs
          </p>
        </div>

        {/* Quick-start mode */}
        {!quickStartMode ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setQuickStartMode(true)}
            className="w-full p-4 rounded-xl border-2 border-dashed border-bw-primary/30 hover:border-bw-primary/60 bg-bw-primary/5 hover:bg-bw-primary/10 transition-all cursor-pointer text-center space-y-1"
          >
            <span className="text-sm font-semibold text-bw-primary block">Demarrage rapide</span>
            <span className="text-xs text-bw-muted">Titre + niveau → c&apos;est parti !</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-bw-primary/30 bg-bw-primary/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-bw-primary">Demarrage rapide</span>
              <button onClick={() => setQuickStartMode(false)} className="text-xs text-bw-muted hover:text-white cursor-pointer">Mode complet</button>
            </div>
            <Input
              type="text"
              placeholder='Ex: "Film 3B"'
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              maxLength={60}
              className="h-12 px-4 bg-bw-surface text-bw-ink"
              autoFocus
            />
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    level === l.value
                      ? "bg-bw-primary/15 border-bw-primary text-bw-primary"
                      : "bg-bw-surface border-bw-border text-bw-muted hover:border-bw-gold/40"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <Button
              size="lg"
              onClick={() => handleCreate(quickTitle)}
              disabled={!quickTitle.trim() || loading}
              className="w-full"
            >
              {loading ? "Creation..." : "Creer"}
            </Button>
          </motion.div>
        )}

        {/* Quick templates */}
        <div className="space-y-3">
          <label className="text-sm text-bw-muted block">
            Templates rapides
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Atelier 1h - College", title: "Atelier cinema", level: "college", timer: 120 },
              { label: "Session rapide 20min", title: "Session rapide", level: "college", timer: 60 },
              { label: "Seance longue - Lycee", title: "Seance cinema", level: "lycee", timer: 300 },
              { label: "Decouverte - Primaire", title: "Mon premier film", level: "primaire", timer: null as number | null },
            ].map((tpl) => (
              <motion.button
                key={tpl.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setTitle(tpl.title);
                  setLevel(tpl.level);
                  setQuestionTimer(tpl.timer);
                }}
                className="text-left p-3 rounded-xl border border-bw-border bg-bw-surface hover:border-bw-gold/40 transition-all cursor-pointer"
              >
                <span className="text-xs font-medium block">{tpl.label}</span>
                <span className="text-xs text-bw-muted">{tpl.timer ? `Timer: ${tpl.timer / 60}min` : "Sans timer"}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Genre picker */}
        <div className="space-y-3">
          <label className="text-sm text-bw-muted block">
            Genre
          </label>
          <div className="grid grid-cols-3 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setTemplate(null)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all cursor-pointer ${
                template === null
                  ? "bg-bw-primary/10 border-bw-primary"
                  : "bg-bw-surface border-bw-border hover:border-bw-gold/40"
              }`}
            >
              <span className="text-xs font-medium">Tous</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95, rotate: [0, -10, 10, -5, 5, 0] }}
              onClick={() => {
                const random = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
                setTemplate(random.key);
              }}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border transition-all cursor-pointer bg-gradient-to-br from-bw-primary/5 to-bw-violet/5 border-bw-border hover:border-bw-gold/40"
            >
              <span className="text-xs font-medium">Surprise</span>
            </motion.button>
            {TEMPLATES.map((t) => (
              <motion.button
                key={t.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTemplate(t.key)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all cursor-pointer ${
                  template === t.key
                    ? "bg-bw-primary/10 border-bw-primary"
                    : "bg-bw-surface border-bw-border hover:border-bw-gold/40"
                }`}
              >
                <span className="text-xs font-medium">{t.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Thématique picker */}
        <div className="space-y-3">
          <label className="text-sm text-bw-muted block">
            Thématique (optionnel)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {THEMATIQUES.map((t) => (
              <motion.button
                key={t.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setThematique(thematique === t.key ? null : t.key)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                  thematique === t.key
                    ? "border-current bg-current/10"
                    : "bg-bw-surface border-bw-border hover:border-bw-gold/40"
                }`}
                style={thematique === t.key ? { color: t.color, borderColor: t.color, backgroundColor: `${t.color}15` } : {}}
              >
                <span className={`text-xs font-medium ${thematique === t.key ? "" : "text-bw-text"}`}>{t.label}</span>
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-bw-placeholder">
            La thématique guide le sujet de fond de l&apos;histoire — les élèves restent libres de l&apos;interpréter.
          </p>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <label className="text-sm text-bw-muted block">
            Titre de la partie
          </label>
          <Input
            type="text"
            placeholder='Ex: "Film 3B - Mardi"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            className="h-14 px-4 bg-bw-surface text-bw-ink text-lg"
            autoFocus
          />
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-sm text-bw-muted block">
            Description (optionnel)
          </label>
          <textarea
            placeholder="Notes pour vous-meme (non visible aux eleves)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            rows={2}
            className="w-full px-4 py-3 bg-bw-surface border border-bw-border rounded-xl text-sm text-bw-ink placeholder:text-bw-placeholder focus:border-bw-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Objectifs pedagogiques */}
        <div className="space-y-3">
          <label className="text-sm text-bw-muted block">
            Objectifs pedagogiques (optionnel)
          </label>
          <div className="flex gap-2 flex-wrap">
            {[
              "Creativite",
              "Travail d'equipe",
              "Expression ecrite",
              "Esprit critique",
              "Ecoute active",
              "Argumentation",
            ].map((obj) => {
              const isSelected = description.includes(`[${obj}]`);
              return (
                <button
                  key={obj}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setDescription(d => d.replace(`[${obj}] `, "").replace(`[${obj}]`, "").trim());
                    } else {
                      setDescription(d => (d ? `${d} [${obj}]` : `[${obj}]`).slice(0, 200));
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-bw-teal/15 border-bw-teal/40 text-bw-teal"
                      : "bg-bw-surface border-bw-border text-bw-muted hover:border-bw-gold/40"
                  }`}
                >
                  {obj}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-bw-placeholder">
            Les objectifs sont ajoutes a la description pour vos notes.
          </p>
        </div>

        {/* Timer par question */}
        <div className="space-y-3">
          <label className="text-sm text-bw-muted block">
            Timer par question
          </label>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: null, label: "Pas de timer" },
              { value: 60, label: "1 min" },
              { value: 120, label: "2 min" },
              { value: 300, label: "5 min" },
            ].map((opt) => (
              <motion.button
                key={opt.value ?? "none"}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuestionTimer(opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                  questionTimer === opt.value
                    ? "bg-bw-primary/10 border-bw-primary text-bw-primary"
                    : "bg-bw-surface border-bw-border text-bw-text hover:border-bw-gold/40"
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Level picker */}
        <div className="space-y-3">
          <label className="text-sm text-bw-muted block">
            Tranche d&apos;âge
          </label>
          <div className="grid gap-3">
            {LEVELS.map((l) => (
              <motion.button
                key={l.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLevel(l.value)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  level === l.value
                    ? "bg-bw-primary/10 border-bw-primary"
                    : "bg-bw-surface border-bw-border hover:border-bw-gold/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold">{l.label}</p>
                    <p className="text-xs text-bw-muted">{l.desc}</p>
                  </div>
                  {level === l.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-5 h-5 rounded-full bg-bw-primary flex items-center justify-center"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Info box */}
        <div className="bg-bw-surface rounded-xl p-4 border border-bw-border/60">
          <div className="flex gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            <div className="text-sm text-bw-muted space-y-1">
              <p>Le niveau adapte le vocabulaire des situations.</p>
              <p>
                Un <strong className="text-bw-ink">code à 6 caractères</strong> sera
                généré pour que les joueurs rejoignent la partie.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          size="xl"
          onClick={() => handleCreate()}
          disabled={!title.trim() || loading}
          className="w-full"
        >
          {loading ? "Création..." : "Créer la partie"}
        </Button>
    </PageShell>
  );
}
