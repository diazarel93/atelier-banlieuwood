"use client";

import { useMemo } from "react";
import { MODULES } from "@/lib/modules-data";
import { getQuestionGuide } from "@/lib/guide-data";
import type { Session } from "@/hooks/use-pilot-session";

interface ModuleStateResult {
  module1Data: Record<string, unknown> | undefined;
  module10Data: { type: string; allSubmissions?: { studentId: string; text: string }[] } | undefined;
  module12Data: { mancheLabel: string; manche: number } | undefined;
  module13Data: { stepEmoji: string; stepLabel: string } | undefined;
  module6Data: { type: string } | undefined;
  module7Data: { type: string } | undefined;
  module8Data: { type: string } | undefined;
  moduleLabel: string;
  moduleColor: string;
  questionGuide: ReturnType<typeof getQuestionGuide>;
  moduleSubmittedIds: Set<string>;
  universalQuestionText: string | null;
  universalCategoryLabel: string;
  unifiedRespondedCount: number;
  isStandardQA: boolean;
  budgetSubmitted: number;
}

export function useCockpitModuleState(
  session: Session,
  situationData: Record<string, unknown> | null,
  responses: { student_id: string }[],
  situation: { prompt?: string; restitutionLabel?: string; category?: string } | undefined,
  moduleFlags: Record<string, boolean | number | undefined>,
): ModuleStateResult {
  const module1Data = (situationData as { module1?: Record<string, unknown> })?.module1;
  const module10Data = (
    situationData as { module10?: { type: string; allSubmissions?: { studentId: string; text: string }[] } }
  )?.module10;
  const module12Data = (situationData as { module12?: { mancheLabel: string; manche: number } })?.module12;
  const module13Data = (situationData as { module13?: { stepEmoji: string; stepLabel: string } })?.module13;
  const module6Data = (situationData as { module6?: { type: string } })?.module6;
  const module7Data = (situationData as { module7?: { type: string } })?.module7;
  const module8Data = (situationData as { module8?: { type: string } })?.module8;

  const budgetStats = (situationData as { budgetStats?: { submittedCount: number } })?.budgetStats;
  const budgetSubmitted = budgetStats?.submittedCount || 0;

  const currentMod = MODULES.find(
    (m) => m.dbModule === session.current_module && m.dbSeance === (session.current_seance || 1),
  );
  const moduleLabel = currentMod?.title || "Module";
  const moduleColor = currentMod?.color || "#FF6B35";

  const questionGuide = getQuestionGuide(
    session.current_seance || 1,
    (session.current_situation_index || 0) + 1,
    session.current_module,
  );

  const moduleSubmittedIds = (() => {
    const ids = new Set<string>();
    if (module10Data?.allSubmissions) {
      for (const s of module10Data.allSubmissions) ids.add(s.studentId);
    }
    return ids;
  })();

  const universalQuestionText = useMemo((): string | null => {
    if (situation?.prompt) return situation.prompt;
    if (
      moduleFlags.isM1Positioning &&
      (module1Data as { questions?: { text: string }[] })?.questions?.[session.current_situation_index || 0]
    )
      return (module1Data as { questions: { text: string }[] }).questions[session.current_situation_index || 0].text;
    if ((module1Data as { question?: { text: string } })?.question?.text)
      return (module1Data as { question: { text: string } }).question.text;
    if (module12Data) return module12Data.mancheLabel || `Manche ${module12Data.manche || 1}`;
    if (module13Data) return `${module13Data.stepEmoji} ${module13Data.stepLabel}`;
    return null;
  }, [
    situation,
    moduleFlags.isM1Positioning,
    module1Data,
    module12Data,
    module13Data,
    session.current_situation_index,
  ]);

  const universalCategoryLabel = useMemo((): string => {
    if (situation?.restitutionLabel || situation?.category)
      return situation.restitutionLabel || situation.category || "";
    if (moduleFlags.isM1Positioning) return "Positionnement";
    if (moduleFlags.isM1Image) return "Image";
    if (moduleFlags.isM1Notebook) return "Carnet";
    if (moduleFlags.isBudgetQuiz) return "Budget";
    if (moduleFlags.isM10Any && moduleFlags.isM10Etsi) return "Et si...";
    if (moduleFlags.isM10Any && moduleFlags.isM10Pitch) return "Pitch";
    if (moduleFlags.isM2ECChecklist) return "Checklist";
    if (moduleFlags.isM2ECSceneBuilder) return "Scène";
    if (moduleFlags.isM2ECComparison) return "Confrontation";
    if (moduleFlags.isM12Any) return "Construction";
    if (moduleFlags.isM13Any) return "Post-prod";
    if (moduleFlags.isM6Any) return "Scénario";
    if (moduleFlags.isM7Any) return "Mise en scène";
    if (moduleFlags.isM8Any) return "Équipe";
    return moduleLabel;
  }, [situation, moduleFlags, moduleLabel]);

  const unifiedRespondedCount = useMemo(() => {
    if (moduleFlags.isM1Positioning) {
      const dist = (module1Data as { optionDistribution?: Record<string, number> })?.optionDistribution || {};
      return Object.values(dist).reduce((sum, v) => sum + v, 0);
    }
    if (moduleFlags.isBudgetQuiz) return budgetSubmitted;
    if (
      (moduleFlags.isM1Image || moduleFlags.isM1Notebook) &&
      (module1Data as { responsesCount?: number })?.responsesCount
    )
      return (module1Data as { responsesCount: number }).responsesCount;
    if (moduleFlags.isM10Any && module10Data?.allSubmissions) return module10Data.allSubmissions.length;
    return responses.length;
  }, [moduleFlags, module1Data, budgetSubmitted, module10Data, responses.length]);

  const isStandardQA = useMemo(() => {
    const mod = session.current_module;
    const isM3orM4 = mod === 3 || mod === 4;
    const isM9QA = mod === 9 && !Boolean(moduleFlags.isBudgetQuiz);
    const isM2ECQA = mod === 2 && !Boolean(moduleFlags.isM2ECSpecial) && !Boolean(moduleFlags.isM2ECComparison);
    const isM10QA = Boolean(moduleFlags.isM10Any) && !Boolean(moduleFlags.isM10SpecialPosition);
    return isM3orM4 || isM9QA || isM2ECQA || isM10QA;
  }, [session.current_module, moduleFlags]);

  return {
    module1Data,
    module10Data,
    module12Data,
    module13Data,
    module6Data,
    module7Data,
    module8Data,
    moduleLabel,
    moduleColor,
    questionGuide,
    moduleSubmittedIds,
    universalQuestionText,
    universalCategoryLabel,
    unifiedRespondedCount,
    isStandardQA,
    budgetSubmitted,
  };
}
