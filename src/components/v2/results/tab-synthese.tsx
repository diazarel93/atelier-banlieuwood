"use client";

import FilmPosterExport from "@/components/film-poster-export";
import { FestivalPalmares } from "@/components/festival-palmares";
import { SessionComparison } from "@/components/session-comparison";
import { SessionReplay } from "@/components/pilot/session-replay";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { SessionInsightsCard } from "./session-insights-card";
import { PedagogicalTipsCard } from "./pedagogical-tips-card";
import { NotableResponsesCard, type NotableResponses } from "./notable-responses-card";
import { SessionTimeline } from "./session-timeline";
import { CollectiveStoryCards } from "./collective-story-cards";
import { BudgetBarsCard } from "./budget-bars-card";
import { PitchListCard } from "./pitch-list-card";
import { StudentDetailCard } from "./student-detail-card";
import type { ExportData, M10Pitch, ReplayData, BilanData, FeedbackData } from "@/hooks/use-results-data";
import type { PosterChoice, PosterStudent } from "@/components/film-poster";

interface TabSyntheseProps {
  sessionId: string;
  exportData: ExportData;
  budgetAverages: Record<string, number> | null;
  pitchData: { pitchs: M10Pitch[]; count: number } | null;
  posterData: { choices: PosterChoice[]; students: PosterStudent[] } | null;
  template: string | null;
  showReplay: boolean;
  setShowReplay: (v: boolean) => void;
  replayData: ReplayData | null;
  bilan: BilanData | null;
  onSwitchToIaTab: () => void;
  notableResponses: NotableResponses | null;
  feedback: FeedbackData | null;
}

export function TabSynthese({
  sessionId,
  exportData,
  budgetAverages,
  pitchData,
  posterData,
  template,
  showReplay,
  setShowReplay,
  replayData,
  bilan,
  onSwitchToIaTab,
  notableResponses,
  feedback,
}: TabSyntheseProps) {
  const lines = exportData.markdown.split("\n");

  return (
    <div className="space-y-8">
      {/* AI Insights */}
      <SessionInsightsCard bilan={bilan} onViewFull={onSwitchToIaTab} />
      {bilan && (
        <PedagogicalTipsCard recommendations={bilan.pedagogicalRecommendations} keyMoments={bilan.keyMoments} />
      )}

      {/* Notable responses */}
      <NotableResponsesCard data={notableResponses} />

      {/* Per-student detail */}
      <StudentDetailCard sessionId={sessionId} feedback={feedback} />

      {/* Session timeline */}
      {replayData && replayData.events.length > 0 && (
        <SessionTimeline events={replayData.events} totalDurationMs={replayData.totalDurationMs} />
      )}

      {/* Replay toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowReplay(!showReplay)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border border-[var(--color-bw-border)] hover:bg-[var(--color-bw-surface-dim)] cursor-pointer transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polygon points="5,3 19,12 5,21" />
          </svg>
          {showReplay ? "Fermer le replay" : "Revoir la séance"}
        </button>
      </div>

      {/* Session Replay */}
      {showReplay && replayData && replayData.events.length > 0 && (
        <GlassCardV2 className="p-4">
          <SessionReplay
            events={replayData.events}
            totalDurationMs={replayData.totalDurationMs}
            students={replayData.students}
            responses={replayData.responses}
            onClose={() => setShowReplay(false)}
          />
        </GlassCardV2>
      )}
      {showReplay && replayData && replayData.events.length === 0 && (
        <GlassCardV2 className="p-6 text-center">
          <p className="text-sm text-bw-muted">Aucun événement enregistré pour cette séance.</p>
        </GlassCardV2>
      )}

      {/* Collective story */}
      <CollectiveStoryCards markdownLines={lines} />

      {/* Film poster */}
      {posterData && posterData.choices.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-bw-heading uppercase tracking-wide">Affiche du film</h3>
          <FilmPosterExport
            title={exportData.session.title}
            template={template}
            collectiveChoices={posterData.choices}
            students={posterData.students}
          />
        </div>
      )}

      {/* Budget */}
      {budgetAverages && <BudgetBarsCard averages={budgetAverages} />}

      {/* Pitchs M10 */}
      {pitchData && pitchData.pitchs.length > 0 && <PitchListCard pitchs={pitchData.pitchs} count={pitchData.count} />}

      {/* Festival & comparison */}
      <GlassCardV2 className="p-5">
        <FestivalPalmares sessionId={sessionId} />
      </GlassCardV2>

      <GlassCardV2 className="p-5">
        <SessionComparison sessionId={sessionId} />
      </GlassCardV2>
    </div>
  );
}
