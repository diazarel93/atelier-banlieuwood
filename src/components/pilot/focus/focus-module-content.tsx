"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCockpitData, useCockpitActions } from "@/components/pilot/cockpit-context";
import { useCockpitModuleFlags } from "@/hooks/use-cockpit-module-flags";
import { toast } from "sonner";

// Lazy-loaded module cockpits (same as page.tsx)
const Module1Cockpit = dynamic(
  () => import("@/components/pilot/module1-cockpit").then((m) => ({ default: m.Module1Cockpit })),
  { ssr: false },
);
const Module9BudgetOverview = dynamic(
  () => import("@/components/pilot/module9-budget-overview").then((m) => ({ default: m.Module9BudgetOverview })),
  { ssr: false },
);
const Module9BudgetCards = dynamic(
  () => import("@/components/pilot/module9-budget-cards").then((m) => ({ default: m.Module9BudgetCards })),
  { ssr: false },
);
const Module10Cockpit = dynamic(
  () => import("@/components/pilot/module10-cockpit").then((m) => ({ default: m.Module10Cockpit })),
  { ssr: false },
);
const Module12Cockpit = dynamic(
  () => import("@/components/pilot/module12-cockpit").then((m) => ({ default: m.Module12Cockpit })),
  { ssr: false },
);
const Module13Cockpit = dynamic(
  () => import("@/components/pilot/module13-cockpit").then((m) => ({ default: m.Module13Cockpit })),
  { ssr: false },
);
const Module6Cockpit = dynamic(
  () => import("@/components/pilot/module6-cockpit").then((m) => ({ default: m.Module6Cockpit })),
  { ssr: false },
);
const Module7Cockpit = dynamic(
  () => import("@/components/pilot/module7-cockpit").then((m) => ({ default: m.Module7Cockpit })),
  { ssr: false },
);
const Module8Cockpit = dynamic(
  () => import("@/components/pilot/module8-cockpit").then((m) => ({ default: m.Module8Cockpit })),
  { ssr: false },
);
const Module2ECCockpit = dynamic(
  () => import("@/components/pilot/module2ec-cockpit").then((m) => ({ default: m.Module2ECCockpit })),
  { ssr: false },
);
const Module11Cockpit = dynamic(
  () => import("@/components/pilot/module11-cockpit").then((m) => ({ default: m.Module11Cockpit })),
  { ssr: false },
);

interface FocusModuleContentProps {
  isPreviewing: boolean;
  currentQIndex: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Renders the appropriate module-specific cockpit based on session flags.
 * Reuses ALL existing module cockpit components unchanged.
 */
export function FocusModuleContent({ isPreviewing, currentQIndex }: FocusModuleContentProps) {
  const { session, sessionId, activeStudents, situationData, studentWarnings } = useCockpitData();
  const { updateSession, warnStudent } = useCockpitActions();
  const flags = useCockpitModuleFlags(session);
  const queryClient = useQueryClient();

  // Extract module data from situationData (typed as any — these are passed straight through to module cockpits)
  const sd = situationData as Record<string, any> | null;
  const module1Data = sd?.module1;
  const module10Data = sd?.module10;
  const module11Data = sd?.module11;
  const module12Data = sd?.module12;
  const module13Data = sd?.module13;
  const module6Data = sd?.module6;
  const module7Data = sd?.module7;
  const module8Data = sd?.module8;
  const module5Data = sd?.module5;
  const budgetStats = sd?.budgetStats;

  // ── M2 EC: scenes data + comparison selection ──
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const isM2ECWithScenes =
    session.current_module === 2 && ((session.current_seance || 1) === 2 || (session.current_seance || 1) === 3);

  const { data: scenesData } = useQuery<{ scenes: any[]; emotionDistribution: Record<string, number>; count: number }>({
    queryKey: ["m2ec-scenes", sessionId, session.current_situation_index],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/scene`);
      if (!res.ok) return { scenes: [], emotionDistribution: {}, count: 0 };
      return res.json();
    },
    enabled: isM2ECWithScenes,
    refetchInterval: isM2ECWithScenes ? 14_000 : false,
    staleTime: 5_000,
  });

  const selectComparison = useMutation({
    mutationFn: async ({ sceneAId, sceneBId }: { sceneAId: string; sceneBId: string }) => {
      const res = await fetch(`/api/sessions/${sessionId}/scene-compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneAId, sceneBId }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Confrontation projetée");
      queryClient.invalidateQueries({ queryKey: ["m2ec-scenes"] });
    },
  });

  // ── M9: budget cards data ──
  const isBudgetWithCards = session.current_module === 9 && (session.current_seance || 1) === 2;

  const { data: budgetData } = useQuery<{ budgets: any[]; averages: Record<string, number>; count: number }>({
    queryKey: ["budget", sessionId, session.current_situation_index],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${sessionId}/budget`);
      if (!res.ok) return { budgets: [], averages: {}, count: 0 };
      return res.json();
    },
    enabled: isBudgetWithCards,
    refetchInterval: isBudgetWithCards ? 12_000 : false,
    staleTime: 5_000,
  });

  const onBroadcast = (msg: string) => {
    updateSession.mutate({ broadcast_message: msg, broadcast_at: new Date().toISOString() });
    toast.success("Envoyé");
  };

  return (
    <>
      {/* M1 Positioning + Image */}
      {(flags.isM1Positioning || flags.isM1Image) && (
        <Module1Cockpit
          isPositioning={flags.isM1Positioning}
          isImage={flags.isM1Image}
          module1Data={module1Data}
          currentQIndex={currentQIndex}
          activeStudentCount={activeStudents.length}
          isPreviewing={isPreviewing}
        />
      )}

      {/* M9 Budget */}
      {flags.isBudgetQuiz && (
        <>
          <Module9BudgetOverview
            budgetSubmitted={budgetData?.count || budgetStats?.submittedCount || 0}
            activeStudentCount={activeStudents.length}
            budgetAverages={budgetData?.averages || budgetStats?.averages || {}}
          />
          <Module9BudgetCards
            budgets={budgetData?.budgets || []}
            cardSearch=""
            activeStudentCount={activeStudents.length}
            budgetSubmitted={budgetData?.count || budgetStats?.submittedCount || 0}
            sessionStatus={session.status}
            studentWarnings={studentWarnings}
            onBroadcast={onBroadcast}
            onWarn={(sid: string) => warnStudent.mutate(sid)}
            isWarnPending={warnStudent.isPending}
            onOpenBroadcast={() => {}}
          />
        </>
      )}

      {/* M10 Et si... + Pitch */}
      {flags.isM10Any && module10Data && (
        <Module10Cockpit
          isEtsi={flags.isM10Etsi}
          isPitch={flags.isM10Pitch}
          module10Data={module10Data}
          isPreviewing={isPreviewing}
          cardSearch=""
          selectedPitchIds={[]}
          setSelectedPitchIds={() => {}}
          sessionId={sessionId}
          currentModule={session.current_module}
          currentSeance={session.current_seance || 1}
          currentSituationIndex={session.current_situation_index || 0}
          studentWarnings={studentWarnings}
          onBroadcast={onBroadcast}
          onWarn={(sid: string) => warnStudent.mutate(sid)}
          isWarnPending={warnStudent.isPending}
        />
      )}

      {/* M12 Construction Collective */}
      {flags.isM12Any && module12Data && (
        <Module12Cockpit
          sessionId={session.id}
          currentSituationIndex={currentQIndex}
          module12={module12Data}
          connectedCount={activeStudents.length}
        />
      )}

      {/* M13 Post-prod */}
      {flags.isM13Any && module13Data && (
        <Module13Cockpit sessionId={session.id} module13={module13Data} connectedCount={activeStudents.length} />
      )}

      {/* M6 Scénario */}
      {flags.isM6Any && module6Data && <Module6Cockpit module6={module6Data} connectedCount={activeStudents.length} />}

      {/* M7 Mise en scène */}
      {flags.isM7Any && module7Data && (
        <Module7Cockpit module7={module7Data} connectedCount={activeStudents.length} sessionId={sessionId} />
      )}

      {/* M8 Équipe */}
      {flags.isM8Any && module8Data && (
        <Module8Cockpit sessionId={session.id} module8={module8Data} connectedCount={activeStudents.length} />
      )}

      {/* M11 Ciné-Débat */}
      {flags.isM11Any && module11Data && <Module11Cockpit module11Data={module11Data} isPreviewing={isPreviewing} />}

      {/* M2 EC */}
      {flags.isM2ECAny && (
        <Module2ECCockpit
          showChecklist={flags.isM2ECChecklist}
          showSceneBuilder={flags.isM2ECSceneBuilder}
          showComparison={flags.isM2ECComparison}
          module5Data={module5Data}
          scenesData={scenesData}
          isPreviewing={isPreviewing}
          cardSearch=""
          selectedSceneIds={selectedSceneIds}
          setSelectedSceneIds={setSelectedSceneIds}
          selectComparison={selectComparison}
          activeStudentCount={activeStudents.length}
          sessionStatus={session.status}
          studentWarnings={studentWarnings}
          onBroadcast={onBroadcast}
          onWarn={(sid: string) => warnStudent.mutate(sid)}
          isWarnPending={warnStudent.isPending}
          onOpenBroadcast={() => {}}
        />
      )}
    </>
  );
}
