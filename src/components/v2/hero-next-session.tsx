"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ROUTES } from "@/lib/routes";
import type { SessionSummary } from "@/hooks/use-dashboard-v2";

interface HeroNextSessionProps {
  activeSession?: SessionSummary;
  nextSession?: SessionSummary;
  isProfesseur?: boolean;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/** État 1 — Session en cours : halo vert, CTA cockpit */
function HeroActive({ session, isProfesseur }: { session: SessionSummary; isProfesseur: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl p-5 border"
      style={{
        borderColor: "var(--color-bw-teal-border, rgba(78,205,196,0.25))",
        background: "linear-gradient(135deg, rgba(78,205,196,0.08) 0%, transparent 60%)",
        boxShadow: "0 4px 24px rgba(78,205,196,0.10)",
      }}
    >
      {/* Barre top teal */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: "linear-gradient(90deg, var(--color-bw-teal), var(--color-bw-teal-500))" }}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          {/* Badge live */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--color-bw-teal)] opacity-60" />
              <span className="relative rounded-full h-2.5 w-2.5 bg-[var(--color-bw-teal)]" />
            </span>
            <span className="label-caps text-[var(--color-bw-teal-readable,#2ab5a8)]">
              En cours
            </span>
          </div>

          <h2 className="text-heading-sm font-bold text-bw-heading">{session.title}</h2>
          <p className="text-body-xs text-bw-muted mt-0.5">
            {session.classLabel ? `${session.classLabel} — ` : ""}
            {session.studentCount} élève{session.studentCount !== 1 ? "s" : ""} connecté
            {session.studentCount !== 1 ? "s" : ""}
          </p>
        </div>

        {!isProfesseur && (
          <Link
            href={ROUTES.pilot(session.id)}
            className="shrink-0 inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-[0_4px_20px_rgba(78,205,196,0.35)] active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, var(--color-bw-teal), var(--color-bw-teal-500))" }}
          >
            Retourner au cockpit →
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/** État 2 — Prochaine séance planifiée : halo orange, CTA lancer */
function HeroNext({ session, isProfesseur }: { session: SessionSummary; isProfesseur: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl p-5 border"
      style={{
        borderColor: "var(--color-bw-primary-border, rgba(255,107,53,0.25))",
        background: "linear-gradient(135deg, rgba(255,107,53,0.06) 0%, transparent 60%)",
        boxShadow: "0 4px 24px rgba(255,107,53,0.08)",
      }}
    >
      {/* Barre top orange */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: "linear-gradient(90deg, var(--color-bw-primary), var(--color-bw-gold))" }}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-bw-muted)] mb-1.5">
            Prochaine séance · {formatTime(session.scheduledAt)}
          </p>
          <h2 className="text-heading-sm font-bold text-bw-heading">{session.title}</h2>
          <p className="text-body-xs text-bw-muted mt-0.5">
            {session.classLabel ? `${session.classLabel} — ` : ""}
            {session.studentCount} élève{session.studentCount !== 1 ? "s" : ""}
          </p>
        </div>

        {!isProfesseur && (
          <Link
            href={ROUTES.pilot(session.id)}
            className="shrink-0 inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-[0_4px_20px_rgba(255,107,53,0.30)] active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, var(--color-bw-primary), var(--color-bw-gold))" }}
          >
            Lancer →
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/** État 3 — Pas de séance aujourd'hui */
function HeroEmpty({ isProfesseur }: { isProfesseur: boolean }) {
  if (isProfesseur) return null;
  return (
    <div
      className="rounded-2xl border p-5 flex items-center justify-between gap-4"
      style={{
        borderColor: "var(--color-bw-border-subtle)",
        background: "var(--color-bw-surface-dim)",
      }}
    >
      <p className="text-body-sm text-bw-muted">Aucune séance prévue aujourd&apos;hui.</p>
      <Link
        href={ROUTES.seanceNew}
        className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl text-sm font-semibold text-bw-primary bg-bw-primary/[0.08] hover:bg-bw-primary/[0.14] transition-colors"
      >
        + Nouvelle séance
      </Link>
    </div>
  );
}

export function HeroNextSession({ activeSession, nextSession, isProfesseur = false }: HeroNextSessionProps) {
  if (activeSession) {
    return <HeroActive session={activeSession} isProfesseur={isProfesseur} />;
  }
  if (nextSession) {
    return <HeroNext session={nextSession} isProfesseur={isProfesseur} />;
  }
  return <HeroEmpty isProfesseur={isProfesseur} />;
}
