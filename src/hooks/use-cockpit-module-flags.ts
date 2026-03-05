"use client";

import { useMemo } from "react";
import { getSeanceMax } from "@/lib/constants";

interface Session {
  current_module: number;
  current_seance?: number;
  current_situation_index?: number;
}

/**
 * Centralizes the 16+ boolean module flags used in CockpitContent.
 * Prevents scattering conditionals throughout the component.
 */
export function useCockpitModuleFlags(session: Session) {
  return useMemo(() => {
    const mod = session.current_module;
    const seance = session.current_seance || 1;
    const sitIdx = session.current_situation_index || 0;

    const isBudgetQuiz = mod === 9 && seance === 2;
    const isM1Positioning = mod === 1 && seance === 1;
    const isM1Image = mod === 1 && seance >= 2 && seance <= 4;
    const isM1Notebook = mod === 1 && seance === 5;
    const isM2ECChecklist = mod === 2 && seance === 1 && sitIdx === 0;
    const isM2ECSceneBuilder = mod === 2 && seance === 2 && sitIdx === 1;
    const isM2ECComparison = mod === 2 && seance === 3 && sitIdx === 0;
    const isM10Etsi = mod === 10 && seance === 1;
    const isM10Pitch = mod === 10 && seance === 2;
    const isM10Any = mod === 10;
    const isM10SpecialPosition = isM10Any && !(isM10Etsi && sitIdx === 1);
    const isM2ECSpecial = isM2ECChecklist || isM2ECSceneBuilder;
    const isM2ECAny = mod === 2;
    const isQAModule = mod === 3 || mod === 4 || isM1Positioning || mod === 9 || (mod === 2 && !isM2ECSpecial && !isM2ECComparison) || (isM10Any && !isM10SpecialPosition);

    const maxSituations = isM1Positioning ? 8
      : (isM1Image || isM1Notebook) ? 1
      : mod === 4 ? 8
      : getSeanceMax(mod, seance);

    const canGoNext = (isQAModule || isM2ECAny || isM10Any) && sitIdx < maxSituations - 1;
    const canGoPrev = (isQAModule || isM2ECAny || isM10Any) && sitIdx > 0;

    return {
      isBudgetQuiz,
      isM1Positioning,
      isM1Image,
      isM1Notebook,
      isM2ECChecklist,
      isM2ECSceneBuilder,
      isM2ECComparison,
      isM10Etsi,
      isM10Pitch,
      isM10Any,
      isM10SpecialPosition,
      isM2ECSpecial,
      isM2ECAny,
      isQAModule,
      maxSituations,
      canGoNext,
      canGoPrev,
      seance,
    };
  }, [session.current_module, session.current_seance, session.current_situation_index]);
}
