"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORY_COLORS } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { ETSI_IMAGES, getEtsiImage, OBJECTIFS, OBSTACLES, TRAITS } from "@/lib/module10-data";
import { EMOTIONS } from "@/lib/module5-data";
import { BrandLogo } from "@/components/brand-logo";
import { DiceBearAvatar } from "@/components/avatar-dicebear";
import { SafeImage } from "@/components/safe-image";

// ——— Types ———

interface BiblioData {
  session: {
    id: string;
    title: string;
    status: string;
    currentModule: number;
    currentSeance: number;
    sharingEnabled: boolean;
    level: string;
  };
  student: { id: string; displayName: string; avatar: string };
  myResponses: {
    id: string;
    situationId: string;
    text: string;
    submittedAt: string;
    teacherComment: string | null;
    teacherScore: number | null;
    aiScore: number | null;
    hasRelance: boolean;
    relanceResponse: string | null;
  }[];
  collectiveChoices: {
    id: string;
    category: string;
    restitutionLabel: string;
    chosenText: string;
    isMine: boolean;
  }[];
  myChosenCount: number;
  totalChoices: number;
  classGallery: { situationId: string; responses: { id: string; text: string }[] }[];
  studentCount: number;
  etsiTexts: { imageId: string; text: string; helpUsed: boolean }[];
  personnage: { prenom: string; trait: string; avatar: Record<string, string> } | null;
  pitch: { objectif: string; obstacle: string; text: string; chronoSeconds: number | null } | null;
  ideaBank: { id: string; text: string; category: string | null; votes: number; isMine: boolean }[];
  scenes: {
    id: string;
    emotion: string;
    intention: string;
    obstacle: string;
    changement: string;
    elements: string[];
    tokensUsed: number;
    aiFeedback: string | null;
  }[];
  budget: { choices: Record<string, string>; totalSpent: number; budgetText: string } | null;
}

type TabId = "contributions" | "film" | "galerie" | "imagination" | "creation";

export default function BibliothequePage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const [data, setData] = useState<BiblioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("contributions");

  useEffect(() => {
    let studentId: string | null = null;
    try {
      const stored = localStorage.getItem(`bw-student-${sessionId}`);
      if (stored) studentId = JSON.parse(stored).studentId;
    } catch { /* no student */ }

    if (!studentId) {
      setLoading(false);
      return;
    }

    fetch(`/api/sessions/${sessionId}/bibliotheque?studentId=${studentId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bw-bg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-bw-bg gap-4 px-4">
        <p className="text-bw-muted">Bibliothèque introuvable</p>
        <a href={ROUTES.play(sessionId)} className="text-bw-primary text-sm">Retour</a>
      </div>
    );
  }

  // Build available tabs dynamically
  const availableTabs: { id: TabId; label: string; icon: string }[] = [
    { id: "contributions", label: "Mes idées", icon: "pencil" },
    { id: "film", label: "Le Film", icon: "film" },
  ];

  if (data.session.sharingEnabled && data.classGallery.length > 0) {
    availableTabs.push({ id: "galerie", label: "Galerie classe", icon: "users" });
  }

  const hasImagination = data.etsiTexts.length > 0 || data.personnage || data.pitch || data.ideaBank.length > 0;
  if (hasImagination) {
    availableTabs.push({ id: "imagination", label: "Imagination", icon: "sparkle" });
  }

  const hasCreation = data.scenes.length > 0 || data.budget;
  if (hasCreation) {
    availableTabs.push({ id: "creation", label: "Création", icon: "palette" });
  }

  return (
    <div className="min-h-dvh bg-bw-bg text-bw-heading">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bw-bg/90 backdrop-blur-md border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center justify-between">
          <a href={ROUTES.play(sessionId)} className="text-bw-muted text-xs hover:text-white transition-colors">
            &larr; Retour
          </a>
          <span className="font-cinema text-base tracking-[0.15em] uppercase">
            <BrandLogo />
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{data.student.avatar}</span>
            <span className="text-xs text-bw-muted">{data.student.displayName}</span>
          </div>
        </div>

        {/* Tabs — horizontal scroll */}
        <div className="flex px-4 gap-1 overflow-x-auto no-scrollbar pb-0.5">
          {availableTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 py-2 px-3 text-xs font-medium text-center rounded-t-lg transition-colors cursor-pointer whitespace-nowrap ${
                tab === t.id
                  ? "text-white bg-white/[0.05] border-b-2 border-bw-primary"
                  : "text-bw-muted hover:text-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {tab === "contributions" && (
            <ContributionsTab key="contributions" data={data} />
          )}
          {tab === "film" && (
            <FilmTab key="film" data={data} />
          )}
          {tab === "galerie" && (
            <GalerieTab key="galerie" data={data} />
          )}
          {tab === "imagination" && (
            <ImaginationTab key="imagination" data={data} />
          )}
          {tab === "creation" && (
            <CreationTab key="creation" data={data} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ——— Tab: Mes contributions ———
function ContributionsTab({ data }: { data: BiblioData }) {
  const myResponses = data.myResponses;
  const hasContent = myResponses.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard value={myResponses.length} label="Réponses" color="text-bw-primary" />
        <StatCard value={data.myChosenCount} label="Retenues" color="text-bw-amber" />
        <StatCard
          value={data.totalChoices > 0 ? Math.round((data.myChosenCount / data.totalChoices) * 100) : 0}
          label="Impact %"
          color="text-bw-teal"
        />
      </div>

      {!hasContent && (
        <EmptyState message="Aucune contribution pour le moment. Joue pour remplir ta bibliothèque !" />
      )}

      {/* Response list */}
      <div className="space-y-3">
        {myResponses.map((resp, i) => {
          const wasChosen = data.collectiveChoices.some(
            (c) => c.isMine && c.chosenText === resp.text
          );
          return (
            <motion.div
              key={resp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-xl p-4 border space-y-2 ${
                wasChosen
                  ? "bg-bw-amber/5 border-bw-amber/30"
                  : "bg-bw-elevated border-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-relaxed flex-1">{resp.text}</p>
                {wasChosen && (
                  <span className="text-xs font-bold text-bw-amber bg-bw-amber/20 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                    Retenue
                  </span>
                )}
              </div>
              {resp.teacherComment && (
                <div className="flex items-start gap-2 mt-2 pt-2 border-t border-white/[0.04]">
                  <span className="text-xs text-bw-teal font-semibold flex-shrink-0">Prof :</span>
                  <p className="text-xs text-bw-muted">{resp.teacherComment}</p>
                </div>
              )}
              {resp.teacherScore != null && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }, (_, j) => (
                    <span key={j} className={`text-xs ${j < resp.teacherScore! ? "text-bw-amber" : "text-white/10"}`}>
                      ★
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ——— Tab: Le Film ———
function FilmTab({ data }: { data: BiblioData }) {
  const story = data.collectiveChoices;

  if (story.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <EmptyState message="L'histoire n'a pas encore commencé..." />
      </motion.div>
    );
  }

  let currentCategory = "";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="text-center py-4 space-y-2">
        <h2 className="text-xl font-bold">{data.session.title || "Notre Film"}</h2>
        <p className="text-xs text-bw-muted">{story.length} choix collectifs</p>
      </div>

      {story.map((choice) => {
        const color = CATEGORY_COLORS[choice.category] || "#FF6B35";
        const showCategoryHeader = choice.category !== currentCategory;
        currentCategory = choice.category;

        return (
          <div key={choice.id}>
            {showCategoryHeader && (
              <div className="flex items-center gap-2 mt-5 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
                  {choice.restitutionLabel || choice.category}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: `${color}20` }} />
              </div>
            )}
            <div
              className={`rounded-xl p-4 border ${
                choice.isMine
                  ? "bg-bw-amber/5 border-bw-amber/30"
                  : "bg-bw-elevated border-white/[0.06]"
              }`}
            >
              {choice.isMine && (
                <span className="text-xs font-bold text-bw-amber bg-bw-amber/20 px-2 py-0.5 rounded-full mb-2 inline-block">
                  Ton idée
                </span>
              )}
              <p className="text-sm leading-relaxed">{choice.chosenText}</p>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

// ——— Tab: Galerie classe (partage activé par le prof) ———
function GalerieTab({ data }: { data: BiblioData }) {
  const gallery = data.classGallery;

  if (gallery.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <EmptyState message="Pas encore de réponses partagées." />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="text-center py-2 space-y-1">
        <h2 className="text-lg font-bold">Galerie de la classe</h2>
        <p className="text-xs text-bw-muted">{data.studentCount} élèves dans la session</p>
      </div>

      {gallery.map((group, gi) => (
        <div key={group.situationId} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-bw-violet" />
            <span className="text-xs font-medium text-bw-muted uppercase tracking-wider">
              Question {gi + 1}
            </span>
          </div>
          <div className="grid gap-2">
            {group.responses.map((r) => (
              <div
                key={r.id}
                className="rounded-lg p-3 bg-bw-elevated border border-white/[0.06] text-sm leading-relaxed"
              >
                {r.text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ——— Tab: Imagination (Module 10) ———
function ImaginationTab({ data }: { data: BiblioData }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Et si... texts */}
      {data.etsiTexts.length > 0 && (
        <Section title="Mes « Et si... »">
          {data.etsiTexts.map((etsi) => {
            const img = getEtsiImage(etsi.imageId);
            return (
              <div key={etsi.imageId} className="rounded-xl overflow-hidden border border-white/[0.06]">
                {img && (
                  <div className="p-3 bg-bw-elevated/50 flex items-center gap-3">
                    <SafeImage src={img.url} alt={img.title} width={64} height={48} className="w-16 h-12 rounded-lg object-cover bg-bw-bg" />
                    <div>
                      <p className="text-xs font-medium">{img.title}</p>
                      <p className="text-xs text-bw-muted">{img.description}</p>
                    </div>
                  </div>
                )}
                <div className="p-3 bg-bw-elevated">
                  <p className="text-sm leading-relaxed italic">&laquo; {etsi.text} &raquo;</p>
                </div>
              </div>
            );
          })}
        </Section>
      )}

      {/* Personnage */}
      {data.personnage && (
        <Section title="Mon personnage">
          <div className="rounded-xl p-4 bg-bw-elevated border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-3">
              <DiceBearAvatar options={data.personnage.avatar || {}} size={56} />
              <div>
                <p className="font-bold text-lg">{data.personnage.prenom}</p>
                <p className="text-xs text-bw-muted">
                  {data.personnage.trait && TRAITS.find((t) => t.key === data.personnage!.trait)?.label || data.personnage.trait}
                </p>
              </div>
            </div>
            {/* Avatar attributes */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.personnage.avatar || {}).map(([key, val]) => (
                <span key={key} className="text-xs bg-white/[0.05] px-2 py-1 rounded-full text-bw-muted">
                  {key}: {val}
                </span>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Pitch */}
      {data.pitch && (
        <Section title="Mon pitch">
          <div className="rounded-xl p-4 bg-bw-elevated border border-white/[0.06] space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2 bg-white/[0.03]">
                <p className="text-xs text-bw-teal font-semibold uppercase">Objectif</p>
                <p className="text-xs mt-0.5">
                  {OBJECTIFS.find((o) => o.key === data.pitch!.objectif)?.label || data.pitch!.objectif}
                </p>
              </div>
              <div className="rounded-lg p-2 bg-white/[0.03]">
                <p className="text-xs text-bw-primary font-semibold uppercase">Obstacle</p>
                <p className="text-xs mt-0.5">
                  {OBSTACLES.find((o) => o.key === data.pitch!.obstacle)?.label || data.pitch!.obstacle}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.04]">
              <p className="text-sm leading-relaxed">{data.pitch.text}</p>
            </div>
            {data.pitch.chronoSeconds != null && (
              <p className="text-xs text-bw-muted">Chrono : {data.pitch.chronoSeconds}s</p>
            )}
          </div>
        </Section>
      )}

      {/* Idea bank */}
      {data.ideaBank.length > 0 && (
        <Section title={`Banque d'idées (${data.ideaBank.length})`}>
          <div className="space-y-2">
            {data.ideaBank.slice(0, 15).map((idea) => (
              <div
                key={idea.id}
                className={`rounded-lg p-3 border flex items-start justify-between gap-2 ${
                  idea.isMine
                    ? "bg-cyan-500/5 border-cyan-500/20"
                    : "bg-bw-elevated border-white/[0.06]"
                }`}
              >
                <p className="text-sm flex-1">{idea.text}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs text-bw-primary">{idea.votes}</span>
                  <span className="text-xs">❤️</span>
                  {idea.isMine && (
                    <span className="text-xs text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded-full ml-1">
                      Moi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </motion.div>
  );
}

// ——— Tab: Création (Module 5 + Module 9) ———
function CreationTab({ data }: { data: BiblioData }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Scenes */}
      {data.scenes.length > 0 && (
        <Section title="Mes scènes">
          {data.scenes.map((scene, i) => {
            const emotionObj = EMOTIONS?.find((e) => e.key === scene.emotion);
            return (
              <div key={scene.id} className="rounded-xl p-4 bg-bw-elevated border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎭</span>
                  <div>
                    <p className="text-sm font-medium">Scène {i + 1}</p>
                    <p className="text-xs text-bw-muted">
                      {emotionObj?.label || scene.emotion} — {scene.tokensUsed} jetons
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 text-xs">
                  {scene.intention && (
                    <div className="rounded-lg p-2 bg-white/[0.03]">
                      <span className="text-bw-teal font-semibold">Intention : </span>
                      {scene.intention}
                    </div>
                  )}
                  {scene.obstacle && (
                    <div className="rounded-lg p-2 bg-white/[0.03]">
                      <span className="text-bw-primary font-semibold">Obstacle : </span>
                      {scene.obstacle}
                    </div>
                  )}
                  {scene.changement && (
                    <div className="rounded-lg p-2 bg-white/[0.03]">
                      <span className="text-bw-violet font-semibold">Changement : </span>
                      {scene.changement}
                    </div>
                  )}
                </div>
                {scene.aiFeedback && (
                  <div className="pt-2 border-t border-white/[0.04]">
                    <p className="text-xs text-bw-muted italic">{scene.aiFeedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </Section>
      )}

      {/* Budget */}
      {data.budget && (
        <Section title="Mon budget de production">
          <div className="rounded-xl p-4 bg-bw-elevated border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Budget dépensé</p>
              <p className="text-lg font-bold text-bw-amber">{data.budget.totalSpent} crédits</p>
            </div>
            {data.budget.budgetText && (
              <p className="text-xs text-bw-muted leading-relaxed">{data.budget.budgetText}</p>
            )}
            <div className="grid gap-1.5">
              {Object.entries(data.budget.choices || {}).map(([cat, choice]) => (
                <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                  <span className="text-bw-muted capitalize">{cat}</span>
                  <span>{choice}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {!data.scenes.length && !data.budget && (
        <EmptyState message="Pas encore de créations. Continue à jouer !" />
      )}
    </motion.div>
  );
}

// ——— Shared components ———

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-bw-elevated rounded-xl p-3 text-center border border-white/[0.06]">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-bw-muted mt-0.5">{label}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-bw-muted uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-white/[0.03] mx-auto flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-bw-muted">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      </div>
      <p className="text-bw-muted text-sm">{message}</p>
    </div>
  );
}
