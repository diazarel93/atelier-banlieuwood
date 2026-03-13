"use client";

import { motion } from "motion/react";
import { CONTENT_CATALOG, EMOTIONS, MAX_SLOTS, MAX_TOKENS, getElement } from "@/lib/module5-data";
import { Module5EmotionDistribution } from "@/components/pilot/module5-emotion-distribution";
import { GenericInlineActions } from "@/components/pilot/response-actions";

interface M2ECScene {
  id: string;
  student_id: string;
  emotion: string;
  intention: string;
  obstacle: string;
  changement: string;
  elements: { key: string }[];
  tokens_used: number;
  slots_used: number;
  students: { display_name: string; avatar: string } | null;
}

interface Module2ECCockpitProps {
  showChecklist: boolean;
  showSceneBuilder: boolean;
  showComparison: boolean;
  module5Data: {
    type: string;
    submittedCount?: number;
    topItems?: { key: string; count: number }[];
    emotionDistribution?: Record<string, number>;
  } | undefined;
  scenesData: { scenes: M2ECScene[]; emotionDistribution: Record<string, number>; count: number } | undefined;
  isPreviewing: boolean;
  cardSearch: string;
  selectedSceneIds: string[];
  setSelectedSceneIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectComparison: { mutate: (args: { sceneAId: string; sceneBId: string }) => void; isPending: boolean };
  activeStudentCount: number;
  sessionStatus: string;
  studentWarnings: Record<string, number>;
  onBroadcast: (msg: string) => void;
  onWarn: (studentId: string) => void;
  isWarnPending: boolean;
  onOpenBroadcast: () => void;
}

export function Module2ECCockpit({
  showChecklist,
  showSceneBuilder,
  showComparison,
  module5Data,
  scenesData,
  isPreviewing,
  cardSearch,
  selectedSceneIds,
  setSelectedSceneIds,
  selectComparison,
  activeStudentCount,
  sessionStatus,
  studentWarnings,
  onBroadcast,
  onWarn,
  isWarnPending,
  onOpenBroadcast,
}: Module2ECCockpitProps) {
  return (
    <>
      {/* ── CHECKLIST ── */}
      {showChecklist && (
        <>
          {!isPreviewing && (
            <div className="glass-card !border-bw-pink/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="led led-writing" style={{ background: "#EC4899", boxShadow: "0 0 8px rgba(236,72,153,0.5)" }} />
                <span className="text-sm font-semibold text-bw-pink">Étape 1 — Checklist</span>
              </div>
              <p className="text-xs text-bw-muted leading-relaxed">
                Les élèves choisissent <span className="text-bw-heading font-medium">3 contenus minimum</span> parmi ces 20 oeuvres,
                puis sélectionnent <span className="text-bw-heading font-medium">celui qui les touche le plus</span>.
              </p>
            </div>
          )}

          {module5Data?.topItems && module5Data.topItems.length > 0 && (
            <div className="bg-bw-surface rounded-xl p-4 border border-black/[0.06] space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-bw-muted">Top contenus choisis</span>
              {module5Data.topItems.map((item, i) => {
                const catalog = CONTENT_CATALOG.find(c => c.key === item.key);
                const maxCount = module5Data.topItems![0].count;
                const pct = maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
                return (
                  <motion.div key={item.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base w-6 text-center">{catalog?.emoji || "🎬"}</span>
                      <span className="text-sm text-bw-heading flex-1 font-medium">{catalog?.label || item.key}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-bw-pink/10 text-bw-pink font-bold tabular-nums">{item.count} vote{item.count > 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-1.5 bg-bw-bg rounded-full overflow-hidden ml-8">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="h-full bg-bw-pink/60 rounded-full" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {(!module5Data || module5Data.type !== "checklist") && sessionStatus === "responding" && (
            <div className="bg-bw-surface rounded-xl border border-black/[0.06] p-6 text-center space-y-3">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl">📋</motion.div>
              <div>
                <p className="text-lg font-bold tabular-nums text-bw-teal">{module5Data?.submittedCount || 0}/{activeStudentCount}</p>
                <p className="text-xs text-bw-muted mt-0.5">checklists soumises</p>
              </div>
              <p className="text-xs text-bw-muted/70">Les choix des eleves apparaitront ici.</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={onOpenBroadcast}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-bw-elevated border border-black/[0.06] text-bw-muted hover:text-bw-primary hover:border-bw-primary/30 cursor-pointer transition-colors">
                  📢 Message classe
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── SCENE BUILDER ── */}
      {showSceneBuilder && (
        <>
          {!isPreviewing && (
            <div className="glass-card !border-bw-pink/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="led led-writing" style={{ background: "#EC4899", boxShadow: "0 0 8px rgba(236,72,153,0.5)" }} />
                <span className="text-sm font-semibold text-bw-pink">Étape 2 — Construction de scène</span>
              </div>
              <p className="text-xs text-bw-muted leading-relaxed">
                Chaque élève construit une scène autour de <span className="text-bw-heading font-medium">l&apos;émotion qu&apos;il a choisie</span>.
                Il rédige <span className="text-bw-heading font-medium">intention + obstacle + changement</span>,
                puis choisit des éléments de mise en scène.
              </p>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-bw-bg border border-black/[0.06]">
                  <span>📦</span><span className="text-bw-text">{MAX_SLOTS} emplacements</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-bw-bg border border-black/[0.06]">
                  <span>🪙</span><span className="text-bw-text">{MAX_TOKENS} jetons max</span>
                </div>
              </div>
            </div>
          )}

          {module5Data?.emotionDistribution && Object.keys(module5Data.emotionDistribution).length > 0 && (
            <Module5EmotionDistribution emotionDistribution={module5Data.emotionDistribution} />
          )}

          {scenesData && scenesData.scenes.length > 0 && (
            <div className="space-y-2">
              {scenesData.scenes.filter((sc) => !cardSearch || (sc.students?.display_name || "").toLowerCase().includes(cardSearch.toLowerCase()) || sc.intention?.toLowerCase().includes(cardSearch.toLowerCase()) || sc.obstacle?.toLowerCase().includes(cardSearch.toLowerCase())).map((sc, i) => {
                const emo = EMOTIONS.find(e => e.key === sc.emotion);
                return (
                  <motion.div key={sc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-bw-surface rounded-xl p-3 border border-black/[0.06] space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sc.students?.avatar || "👤"}</span>
                      <span className="text-sm font-medium text-bw-heading">{sc.students?.display_name || "Élève"}</span>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${emo?.color || "#EC4899"}20`, color: emo?.color || "#EC4899" }}>
                        {emo?.label || sc.emotion}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-bw-muted">
                      <div><span className="text-bw-muted">Intention:</span> {sc.intention}</div>
                      <div><span className="text-bw-muted">Obstacle:</span> {sc.obstacle}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {sc.elements.map((el) => {
                        const def = getElement(el.key);
                        return (
                          <span key={el.key} className="text-xs px-1.5 py-0.5 rounded bg-black/[0.04] text-bw-text">
                            {def?.label || el.key}
                          </span>
                        );
                      })}
                      <span className="ml-auto text-xs text-bw-muted tabular-nums">{sc.tokens_used}🪙 {sc.slots_used}/5📦</span>
                    </div>
                    <GenericInlineActions
                      entityId={sc.id}
                      studentId={sc.student_id}
                      studentName={sc.students?.display_name || "Élève"}
                      onBroadcast={onBroadcast}
                      onWarn={onWarn}
                      isWarnPending={isWarnPending}
                      warnings={studentWarnings[sc.student_id] || 0}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}

          {(!scenesData || scenesData.scenes.length === 0) && sessionStatus === "responding" && (
            <div className="bg-bw-surface rounded-xl border border-black/[0.06] p-6 text-center space-y-3">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl">🎬</motion.div>
              <div>
                <p className="text-lg font-bold tabular-nums text-bw-teal">{scenesData?.count || 0}/{activeStudentCount}</p>
                <p className="text-xs text-bw-muted mt-0.5">scenes construites</p>
              </div>
              <p className="text-xs text-bw-muted/70">Les scenes apparaitront ici au fur et a mesure.</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={onOpenBroadcast}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-bw-elevated border border-black/[0.06] text-bw-muted hover:text-bw-primary hover:border-bw-primary/30 cursor-pointer transition-colors">
                  📢 Message classe
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── COMPARISON ── */}
      {showComparison && (
        <>
          {!isPreviewing && (
            <div className="glass-card !border-bw-pink/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="led led-writing" style={{ background: "#EC4899", boxShadow: "0 0 8px rgba(236,72,153,0.5)" }} />
                <span className="text-sm font-semibold text-bw-pink">Étape 3 — Confrontation</span>
              </div>
              <p className="text-xs text-bw-muted leading-relaxed">
                Sélectionnez <span className="text-bw-heading font-medium">2 scènes</span> à projeter côte-à-côte.
                La classe compare les choix narratifs et les éléments de mise en scène.
              </p>
            </div>
          )}

          {scenesData && scenesData.scenes.length > 0 && (
            <div className="space-y-3">
              <div className="bg-bw-pink/10 rounded-xl p-4 border border-bw-pink/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-bw-pink font-medium">{scenesData.count} scène{scenesData.count > 1 ? "s" : ""} disponible{scenesData.count > 1 ? "s" : ""}</span>
                  <span className="text-xs text-bw-muted">{selectedSceneIds.length}/2 sélectionnée{selectedSceneIds.length > 1 ? "s" : ""}</span>
                </div>
                {selectedSceneIds.length === 2 && (
                  <button
                    onClick={() => selectComparison.mutate({ sceneAId: selectedSceneIds[0], sceneBId: selectedSceneIds[1] })}
                    disabled={selectComparison.isPending}
                    className="btn-glow w-full py-2 bg-bw-pink text-white rounded-xl text-sm font-medium cursor-pointer hover:brightness-110 disabled:opacity-50 transition-all duration-200 shadow-md shadow-bw-pink/20">
                    {selectComparison.isPending ? "Envoi..." : "Projeter ces 2 scènes"}
                  </button>
                )}
                {selectedSceneIds.length > 0 && selectedSceneIds.length < 2 && (
                  <p className="text-xs text-bw-amber">Encore {2 - selectedSceneIds.length} scène à sélectionner</p>
                )}
              </div>

              <div className="space-y-2">
                {scenesData.scenes.filter((sc) => !cardSearch || (sc.students?.display_name || "").toLowerCase().includes(cardSearch.toLowerCase()) || sc.intention?.toLowerCase().includes(cardSearch.toLowerCase())).map((sc, i) => {
                  const emo = EMOTIONS.find(e => e.key === sc.emotion);
                  const isSelected = selectedSceneIds.includes(sc.id);
                  return (
                    <motion.div key={sc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        setSelectedSceneIds(prev => {
                          if (prev.includes(sc.id)) return prev.filter(id => id !== sc.id);
                          if (prev.length >= 2) return [prev[1], sc.id];
                          return [...prev, sc.id];
                        });
                      }}
                      className={`bg-bw-surface rounded-xl p-3 border-2 cursor-pointer transition-all space-y-2 ${
                        isSelected ? "border-bw-pink/60 bg-bw-pink/5" : "border-black/[0.06] hover:border-black/[0.10]"
                      }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                          isSelected ? "border-bw-pink bg-bw-pink text-white" : "border-bw-muted"
                        }`}>
                          {isSelected && (selectedSceneIds.indexOf(sc.id) === 0 ? "A" : "B")}
                        </div>
                        <span className="text-base">{sc.students?.avatar || "👤"}</span>
                        <span className="text-sm font-medium text-bw-heading">{sc.students?.display_name || "Élève"}</span>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${emo?.color || "#EC4899"}20`, color: emo?.color || "#EC4899" }}>
                          {emo?.label || sc.emotion}
                        </span>
                      </div>
                      <div className="text-xs text-bw-muted pl-7 space-y-0.5">
                        <div><span className="text-bw-muted">Intention:</span> {sc.intention}</div>
                        <div><span className="text-bw-muted">Obstacle:</span> {sc.obstacle}</div>
                        <div><span className="text-bw-muted">Changement:</span> {sc.changement}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap pl-7">
                        {sc.elements.map((el) => {
                          const def = getElement(el.key);
                          return (
                            <span key={el.key} className="text-xs px-1.5 py-0.5 rounded bg-black/[0.04] text-bw-text">
                              {def?.label || el.key}
                            </span>
                          );
                        })}
                        <span className="ml-auto text-xs text-bw-muted tabular-nums">{sc.tokens_used}🪙 {sc.slots_used}/5📦</span>
                      </div>
                      <div className="pl-7">
                        <GenericInlineActions
                          entityId={sc.id}
                          studentId={sc.student_id}
                          studentName={sc.students?.display_name || "Élève"}
                          onBroadcast={onBroadcast}
                          onWarn={onWarn}
                          isWarnPending={isWarnPending}
                          warnings={studentWarnings[sc.student_id] || 0}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {(!scenesData || scenesData.scenes.length === 0) && (
            <div className="bg-bw-surface rounded-xl border border-black/[0.06] p-6 text-center space-y-3">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                className="text-3xl">⚔️</motion.div>
              <div>
                <p className="text-lg font-bold tabular-nums text-bw-teal">{scenesData?.count || 0}/{activeStudentCount}</p>
                <p className="text-xs text-bw-muted mt-0.5">scenes disponibles</p>
              </div>
              <p className="text-xs text-bw-muted/70">Les scenes des eleves apparaitront ici pour la confrontation.</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={onOpenBroadcast}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-bw-elevated border border-black/[0.06] text-bw-muted hover:text-bw-primary hover:border-bw-primary/30 cursor-pointer transition-colors">
                  📢 Message classe
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
