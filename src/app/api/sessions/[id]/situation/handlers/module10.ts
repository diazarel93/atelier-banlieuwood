import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/api-utils";
import { ETSI_IMAGES, getEtsiImage, generatePitchMiroir } from "@/lib/module10-data";
import type { AdminClient } from "./types";

// ── MODULE 10 handler — Et si... + Pitch ──
export async function handleModule10(
  req: NextRequest,
  session: Record<string, unknown>,
  sessionId: string,
  admin: AdminClient,
) {
  const currentSeance = (session.current_seance as number) || 1;
  const currentIndex = (session.current_situation_index as number) || 0;
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (studentId && !isValidUUID(studentId)) {
    return NextResponse.json({ error: "studentId invalide" }, { status: 400 });
  }

  // Connected count
  const { count: connectedCount } = await admin
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_active", true);

  const helpEnabled = (session.help_enabled as boolean) || false;

  const sessionBase = {
    id: session.id,
    status: session.status,
    currentModule: 10,
    currentSeance: currentSeance,
    currentSituationIndex: currentIndex,
    level: session.level,
    title: session.title,
    joinCode: session.join_code,
    template: (session.template as string) || null,
    timerEndsAt: (session.timer_ends_at as string) || null,
    mode: (session.mode as string) || "guided",
    sharingEnabled: (session.sharing_enabled as boolean) || false,
    broadcastMessage: (session.broadcast_message as string) || null,
    broadcastAt: (session.broadcast_at as string) || null,
    revealPhase: (session.reveal_phase as string) ?? null,
    helpEnabled,
  };

  const baseResponse = {
    situation: null,
    hasResponded: false,
    hasVoted: false,
    voteOptions: [],
    collectiveChoice: null,
    connectedCount: connectedCount || 0,
    responsesCount: 0,
    budgetStats: null,
  };

  // ── SÉANCE 1: Et si... (2 positions: workspace complet + idea bank) ──
  if (currentSeance === 1) {
    // pos 0 = Image selection + "Et si..." writing + QCMs intégrés (single workspace)
    if (currentIndex === 0) {
      // Student picks their own image from all 10 — return all images
      let etsiText: string | undefined;
      let chosenImage: (typeof ETSI_IMAGES)[0] | undefined;
      let helpUsed = false;
      let submitted = false;
      let qcmAnswers: Record<string, string> = {};

      if (studentId) {
        // Check if student already submitted any etsi
        const { data: etsi } = await admin
          .from("module10_etsi")
          .select("*")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (etsi) {
          etsiText = etsi.etsi_text;
          helpUsed = etsi.help_used;
          submitted = true;
          chosenImage = getEtsiImage(etsi.image_id);
          qcmAnswers = (etsi.qcm_answers as Record<string, string>) || {};
        }
      }

      // Count all submissions
      const { count: etsiCount } = await admin
        .from("module10_etsi")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);

      // Facilitator view: return all submissions
      let allSubmissions: { studentName: string; text: string; studentId: string }[] | undefined;
      if (!studentId) {
        const { data: allEtsi } = await admin
          .from("module10_etsi")
          .select("etsi_text, student_id, students(display_name)")
          .eq("session_id", sessionId)
          .order("submitted_at", { ascending: true });

        if (allEtsi) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          allSubmissions = allEtsi.map((e: any) => ({
            studentName: e.students?.display_name || "?",
            text: e.etsi_text,
            studentId: e.student_id,
          }));
        }
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "etsi" as const,
          image: chosenImage || null,
          images: ETSI_IMAGES, // All 10 images for selection
          etsiText,
          qcmAnswers,
          helpUsed,
          helpEnabled,
          submitted,
          submittedCount: etsiCount || 0,
          allSubmissions,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: etsiCount || 0,
      });
    }

    // pos 1 = Idea bank (special component)
    if (currentIndex === 1) {
      const { data: ideas } = await admin
        .from("module10_idea_bank")
        .select("id, text, votes, student_id")
        .eq("session_id", sessionId)
        .order("votes", { ascending: false });

      let submitted = false;
      if (studentId) {
        const hasIdea = (ideas || []).some((i: { student_id: string }) => i.student_id === studentId);
        submitted = hasIdea;
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "idea-bank" as const,
          ideaBankItems: (ideas || []).map((i: { id: string; text: string; votes: number }) => ({
            id: i.id,
            text: i.text,
            votes: i.votes || 0,
          })),
          ideaBankCount: ideas?.length || 0,
          submitted,
          submittedCount: ideas?.length || 0,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: ideas?.length || 0,
      });
    }
  }

  // ── SÉANCE 2: Pitch ──
  if (currentSeance === 2) {
    // pos 0 = Avatar builder (special component)
    if (currentIndex === 0) {
      let personnage = null;
      let submitted = false;

      if (studentId) {
        const { data } = await admin
          .from("module10_personnages")
          .select("*")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (data) {
          personnage = {
            prenom: data.prenom,
            trait: data.trait_dominant,
            avatar: data.avatar_data,
          };
          submitted = true;
        }
      }

      const { count: persoCount } = await admin
        .from("module10_personnages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);

      // Facilitator view: return all personnages
      let allSubmissions:
        | { studentName: string; text: string; studentId: string; avatar?: Record<string, unknown> }[]
        | undefined;
      if (!studentId) {
        const { data: allPerso } = await admin
          .from("module10_personnages")
          .select("prenom, age, trait_dominant, avatar_data, student_id, students(display_name)")
          .eq("session_id", sessionId)
          .order("submitted_at", { ascending: true });

        if (allPerso) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          allSubmissions = allPerso.map((p: any) => ({
            studentName: p.students?.display_name || "?",
            text: `${p.prenom}${p.trait_dominant ? ` — ${p.trait_dominant}` : ""}`,
            studentId: p.student_id,
            avatar: p.avatar_data,
          }));
        }
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "avatar" as const,
          personnage,
          submitted,
          submittedCount: persoCount || 0,
          allSubmissions,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: persoCount || 0,
      });
    }

    // pos 1 = Objectif + obstacle (special component)
    if (currentIndex === 1) {
      let objectif: string | null = null;
      let objectifReason: string | null = null;
      let obstacle: string | null = null;
      let submitted = false;

      if (studentId) {
        const { data: pitch } = await admin
          .from("module10_pitchs")
          .select("objectif, objectif_reason, obstacle")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (pitch) {
          objectif = pitch.objectif;
          objectifReason = pitch.objectif_reason || null;
          obstacle = pitch.obstacle;
          submitted = true;
        }
      }

      // Also get personnage for context
      let personnage = null;
      if (studentId) {
        const { data: perso } = await admin
          .from("module10_personnages")
          .select("prenom, trait_dominant, avatar_data")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (perso) {
          personnage = {
            prenom: perso.prenom,
            age: null,
            trait: perso.trait_dominant,
            avatar: perso.avatar_data,
          };
        }
      }

      // Facilitator view: return all objectif+obstacle submissions
      let allSubmissions: { studentName: string; text: string; studentId: string }[] | undefined;
      let submittedCount = 0;
      if (!studentId) {
        const { data: allPitchs } = await admin
          .from("module10_pitchs")
          .select("objectif, obstacle, student_id, students(display_name)")
          .eq("session_id", sessionId)
          .not("objectif", "is", null)
          .order("created_at", { ascending: true });

        if (allPitchs) {
          submittedCount = allPitchs.length;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          allSubmissions = allPitchs.map((p: any) => ({
            studentName: p.students?.display_name || "?",
            text: `\u{1F3AF} ${p.objectif || "?"} — \u{1F9F1} ${p.obstacle || "?"}`,
            studentId: p.student_id,
          }));
        }
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "objectif" as const,
          personnage,
          objectif,
          objectifReason,
          obstacle,
          submitted,
          submittedCount,
          allSubmissions,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: submittedCount,
      });
    }

    // pos 2 = Pitch assembly (special component)
    if (currentIndex === 2) {
      let pitchText: string | null = null;
      let objectif: string | null = null;
      let obstacle: string | null = null;
      let submitted = false;
      let personnage = null;

      if (studentId) {
        const { data: pitch } = await admin
          .from("module10_pitchs")
          .select("*")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (pitch) {
          objectif = pitch.objectif;
          obstacle = pitch.obstacle;
          pitchText = pitch.pitch_text;
          submitted = !!pitch.pitch_text;
        }

        const { data: perso } = await admin
          .from("module10_personnages")
          .select("prenom, trait_dominant, avatar_data")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (perso) {
          personnage = {
            prenom: perso.prenom,
            age: null,
            trait: perso.trait_dominant,
            avatar: perso.avatar_data,
          };
        }
      }

      // Get student's "Et si..." + QCM answers for context + pitch miroir
      let etsiText: string | undefined;
      let pitchMiroir: string | undefined;
      if (studentId) {
        const { data: etsi } = await admin
          .from("module10_etsi")
          .select("etsi_text, qcm_answers")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .limit(1)
          .maybeSingle();

        etsiText = etsi?.etsi_text;
        if (etsi?.etsi_text) {
          const qcm = (etsi.qcm_answers as Record<string, string>) || {};
          pitchMiroir = generatePitchMiroir(etsi.etsi_text, qcm);
        }
      }

      const { count: pitchCount } = await admin
        .from("module10_pitchs")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .not("pitch_text", "is", null);

      // Facilitator view: return all pitch texts
      let allSubmissions: { studentName: string; text: string; studentId: string }[] | undefined;
      if (!studentId) {
        const { data: allPitchs } = await admin
          .from("module10_pitchs")
          .select("pitch_text, student_id, students(display_name)")
          .eq("session_id", sessionId)
          .not("pitch_text", "is", null)
          .order("created_at", { ascending: true });

        if (allPitchs) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          allSubmissions = allPitchs.map((p: any) => ({
            studentName: p.students?.display_name || "?",
            text: p.pitch_text,
            studentId: p.student_id,
          }));
        }
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "pitch" as const,
          personnage,
          objectif,
          obstacle,
          pitchText,
          etsiText,
          pitchMiroir,
          helpEnabled,
          submitted,
          submittedCount: pitchCount || 0,
          allSubmissions,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: pitchCount || 0,
      });
    }

    // pos 3 = Chrono test (special component)
    if (currentIndex === 3) {
      let pitchText: string | null = null;
      let chronoSeconds: number | null = null;
      let submitted = false;

      if (studentId) {
        const { data: pitch } = await admin
          .from("module10_pitchs")
          .select("pitch_text, chrono_seconds")
          .eq("session_id", sessionId)
          .eq("student_id", studentId)
          .maybeSingle();

        if (pitch) {
          pitchText = pitch.pitch_text;
          chronoSeconds = pitch.chrono_seconds;
          submitted = chronoSeconds != null;
        }
      }

      const { count: chronoCount } = await admin
        .from("module10_pitchs")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .not("chrono_seconds", "is", null);

      // Facilitator view: return all chrono results
      let allSubmissions: { studentName: string; text: string; studentId: string }[] | undefined;
      if (!studentId) {
        const { data: allChronos } = await admin
          .from("module10_pitchs")
          .select("chrono_seconds, student_id, students(display_name), module10_personnages(prenom)")
          .eq("session_id", sessionId)
          .not("chrono_seconds", "is", null)
          .order("chrono_seconds", { ascending: true });

        if (allChronos) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          allSubmissions = allChronos.map((c: any) => ({
            studentName: c.students?.display_name || "?",
            text: `${c.module10_personnages?.prenom || "?"} — ${c.chrono_seconds}s`,
            studentId: c.student_id,
          }));
        }
      }

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "chrono" as const,
          pitchText,
          chronoSeconds,
          submitted,
          submittedCount: chronoCount || 0,
          allSubmissions,
        },
        ...baseResponse,
        hasResponded: submitted,
        responsesCount: chronoCount || 0,
      });
    }

    // pos 4 = Confrontation + vote (special component)
    if (currentIndex === 4) {
      // Get all pitchs for confrontation selection
      const { data: allPitchs } = await admin
        .from("module10_pitchs")
        .select("pitch_text, student_id, module10_personnages(prenom)")
        .eq("session_id", sessionId)
        .not("pitch_text", "is", null);

      // Teacher can pick specific pitches via query params
      const pickA = req.nextUrl.searchParams.get("pitchA");
      const pickB = req.nextUrl.searchParams.get("pitchB");
      let confrontation = null;
      if (allPitchs && allPitchs.length >= 2) {
        // Use teacher's picks if provided, otherwise first 2
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pA = (pickA && allPitchs.find((p: any) => p.student_id === pickA)) || allPitchs[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pB = (pickB && allPitchs.find((p: any) => p.student_id === pickB)) || allPitchs[1];
        confrontation = {
          pitchA: {
            text: pA.pitch_text,
            studentId: pA.student_id,
            prenom: (pA.module10_personnages as unknown as { prenom: string } | null)?.prenom || "?",
          },
          pitchB: {
            text: pB.pitch_text,
            studentId: pB.student_id,
            prenom: (pB.module10_personnages as unknown as { prenom: string } | null)?.prenom || "?",
          },
        };
      }

      // Also return all pitchs for teacher picker
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pitchList = (allPitchs || []).map((p: any) => ({
        studentId: p.student_id,
        prenom: (p.module10_personnages as unknown as { prenom: string } | null)?.prenom || "?",
        text: typeof p.pitch_text === "string" ? p.pitch_text.slice(0, 80) : "",
      }));

      return NextResponse.json({
        session: sessionBase,
        module10: {
          type: "confrontation" as const,
          confrontation,
          pitchList,
          submittedCount: allPitchs?.length || 0,
        },
        ...baseResponse,
        responsesCount: allPitchs?.length || 0,
      });
    }
  }

  // Fallback: use standard situation handler
  return handleStandardWithModule10(req, session, sessionId, admin, sessionBase, connectedCount || 0, null);
}

// Standard situation handler with optional module10 data
export async function handleStandardWithModule10(
  req: NextRequest,
  session: Record<string, unknown>,
  sessionId: string,
  admin: AdminClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessionBase: any,
  connectedCount: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module10Data: any,
) {
  const studentId = req.nextUrl.searchParams.get("studentId");

  // Get situation by module, seance, position
  const { data: variants } = await admin
    .from("situations")
    .select("*")
    .eq("module", session.current_module)
    .eq("seance", session.current_seance)
    .eq("position", (session.current_situation_index as number) + 1);

  let situation = variants?.[0] || null;
  if (variants && variants.length > 1) {
    const hash = sessionId.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const variantIndex = (hash + (session.current_situation_index as number)) % variants.length;
    situation = variants[variantIndex];
  }

  let hasResponded = false;
  let teacherNudge: string | null = null;
  let studentResponseId: string | null = null;

  if (studentId && situation) {
    const { data: response } = await admin
      .from("responses")
      .select("id, teacher_nudge")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .eq("situation_id", situation.id)
      .is("reset_at", null)
      .single();

    hasResponded = !!response;
    teacherNudge = response?.teacher_nudge || null;
    studentResponseId = response?.id || null;
  }

  // Vote options
  let voteOptions: { id: string; text: string }[] = [];
  let hasVoted = false;

  if (session.status === "voting" && situation) {
    const { data: responses } = await admin
      .from("responses")
      .select("id, text")
      .eq("session_id", sessionId)
      .eq("situation_id", situation.id)
      .eq("is_hidden", false)
      .eq("is_vote_option", true)
      .is("reset_at", null);

    voteOptions = responses || [];

    if (studentId) {
      const { data: vote } = await admin
        .from("votes")
        .select("id")
        .eq("session_id", sessionId)
        .eq("student_id", studentId)
        .eq("situation_id", situation.id)
        .single();

      hasVoted = !!vote;
    }
  }

  // Collective choice
  let collectiveChoice = null;
  if (situation) {
    const { data: choice } = await admin
      .from("collective_choices")
      .select("*")
      .eq("session_id", sessionId)
      .eq("situation_id", situation.id)
      .single();

    collectiveChoice = choice;
  }

  // Responses count (exclude reset)
  let responsesCount = 0;
  if (situation) {
    const { count: rCount } = await admin
      .from("responses")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("situation_id", situation.id)
      .is("reset_at", null);
    responsesCount = rCount || 0;
  }

  // Level prompt
  let prompt = "";
  if (situation) {
    const levelMap: Record<string, string> = {
      primaire: "prompt_6_9",
      college: "prompt_10_13",
      lycee: "prompt_14_18",
    };
    const field = levelMap[session.level as string] || "prompt_10_13";
    prompt = situation[field as keyof typeof situation] as string;
  }

  return NextResponse.json({
    session: sessionBase,
    situation: situation
      ? {
          id: situation.id,
          position: situation.position,
          category: situation.category,
          restitutionLabel: situation.restitution_label,
          prompt,
          nudgeText: situation.nudge_text,
          questionType: situation.question_type,
          options: situation.options,
        }
      : null,
    ...(module10Data ? { module10: module10Data } : {}),
    hasResponded,
    hasVoted,
    voteOptions,
    collectiveChoice,
    isMyResponseChosen: !!(
      collectiveChoice &&
      studentResponseId &&
      collectiveChoice.source_response_id === studentResponseId
    ),
    connectedCount,
    responsesCount,
    budgetStats: null,
    teacherNudge,
  });
}
