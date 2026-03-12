"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Module13Data } from "@/hooks/use-session-polling";
import { MUSIC_GENRES, MUSIC_MOODS, POSTER_STYLES } from "@/lib/module13-data";

interface PostprodStateProps {
  module13: Module13Data;
  sessionId: string;
  studentId: string;
}

export function PostprodState({ module13, sessionId, studentId }: PostprodStateProps) {
  const { position, stepLabel, stepEmoji, stepDescription, hasSubmitted } = module13;

  // Progress dots
  const progressDots = (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 8 }, (_, i) => {
        const p = i + 1;
        const done = module13.allResults.some((r) => r.position === p);
        const isCurrent = p === position;
        return (
          <div
            key={p}
            className={`w-3 h-3 rounded-full transition-all ${
              done
                ? "bg-cyan-400 scale-110"
                : isCurrent
                ? "bg-yellow-400 animate-pulse"
                : "bg-white/20"
            }`}
          />
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
      {progressDots}

      <div className="text-center">
        <p className="text-sm text-white/50 uppercase tracking-wider">
          Étape {position}/8
        </p>
        <h2 className="text-2xl font-bold text-white mt-1">
          {stepEmoji} {stepLabel}
        </h2>
        <p className="text-sm text-white/60 mt-1">{stepDescription}</p>
      </div>

      <AnimatePresence mode="wait">
        {hasSubmitted ? (
          <SubmittedView key="submitted" submittedCount={module13.submittedCount} />
        ) : (
          <motion.div
            key={`form-${position}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            {position === 1 && <MontageForm module13={module13} sessionId={sessionId} studentId={studentId} />}
            {position === 2 && <MusiqueForm module13={module13} sessionId={sessionId} studentId={studentId} />}
            {position === 3 && <TitreForm module13={module13} sessionId={sessionId} studentId={studentId} />}
            {position === 4 && <AfficheForm module13={module13} sessionId={sessionId} studentId={studentId} />}
            {position === 5 && <TrailerForm module13={module13} sessionId={sessionId} studentId={studentId} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results history */}
      {module13.allResults.length > 0 && (
        <div className="w-full mt-4 space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wider">Décisions finales</p>
          {module13.allResults.map((r) => (
            <div key={r.position} className="flex gap-2 text-xs text-white/60">
              <span className="text-cyan-400 font-mono">#{r.position}</span>
              <span className="truncate">
                {(r.data as { summary?: string })?.summary || r.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Submitted state ─────────────────────────────────────
function SubmittedView({ submittedCount }: { submittedCount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="text-4xl mb-3">✅</div>
      <p className="text-cyan-400 font-semibold">Réponse envoyée !</p>
      <p className="text-sm text-white/50 mt-1">
        {submittedCount} réponse{submittedCount !== 1 ? "s" : ""} reçue{submittedCount !== 1 ? "s" : ""}
      </p>
    </motion.div>
  );
}

// ── Position 1: Montage (scene ordering) ────────────────
function MontageForm({ module13, sessionId, studentId }: PostprodStateProps) {
  const scenes = module13.scenes || [];
  const [order, setOrder] = useState<number[]>(scenes.map((s) => s.manche));
  const [submitting, setSubmitting] = useState(false);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...order];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setOrder(next);
  };

  const moveDown = (index: number) => {
    if (index === order.length - 1) return;
    const next = [...order];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setOrder(next);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/postprod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, position: 1, data: { sceneOrder: order } }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (scenes.length === 0) {
    return (
      <div className="text-center text-white/50 py-8">
        <p>Aucune scène disponible.</p>
        <p className="text-sm mt-1">Les scènes seront disponibles après la Construction Collective.</p>
      </div>
    );
  }

  const sceneMap = new Map(scenes.map((s) => [s.manche, s.text]));

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/50 text-center">Réorganise les scènes dans l&apos;ordre du film</p>
      {order.map((manche, i) => (
        <div key={manche} className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/10">
          <span className="text-cyan-400 font-mono text-sm w-6">{i + 1}.</span>
          <p className="flex-1 text-sm text-white truncate">{sceneMap.get(manche)}</p>
          <div className="flex flex-col gap-0.5">
            <button onClick={() => moveUp(i)} disabled={i === 0} className="text-white/40 hover:text-white disabled:opacity-20 text-xs">▲</button>
            <button onClick={() => moveDown(i)} disabled={i === order.length - 1} className="text-white/40 hover:text-white disabled:opacity-20 text-xs">▼</button>
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Envoi..." : "Valider l'ordre"}
      </button>
    </div>
  );
}

// ── Position 2: Musique ─────────────────────────────────
function MusiqueForm({ sessionId, studentId }: PostprodStateProps) {
  const [genre, setGenre] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!genre || !mood) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/postprod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, position: 2, data: { genre, mood, justification } }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-white/50 mb-2">Style musical</p>
        <div className="grid grid-cols-2 gap-2">
          {MUSIC_GENRES.map((g) => (
            <button
              key={g.key}
              onClick={() => setGenre(g.key)}
              className={`p-3 rounded-lg text-left text-sm transition-all ${
                genre === g.key
                  ? "bg-cyan-500/30 border-2 border-cyan-400"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{g.emoji}</span>
              <p className="text-white mt-1">{g.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-white/50 mb-2">Ambiance</p>
        <div className="grid grid-cols-2 gap-2">
          {MUSIC_MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMood(m.key)}
              className={`p-3 rounded-lg text-left text-sm transition-all ${
                mood === m.key
                  ? "border-2"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              style={mood === m.key ? { backgroundColor: `${m.color}30`, borderColor: m.color } : undefined}
            >
              <p className="text-white">{m.label}</p>
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        placeholder="Pourquoi ce choix ? (optionnel)"
        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 resize-none h-20"
      />

      <button
        onClick={handleSubmit}
        disabled={!genre || !mood || submitting}
        className="w-full py-3 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Envoi..." : "Valider"}
      </button>
    </div>
  );
}

// ── Position 3: Titre ───────────────────────────────────
function TitreForm({ sessionId, studentId }: PostprodStateProps) {
  const [titre, setTitre] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!titre.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/postprod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, position: 3, data: { titre: titre.trim() } }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        placeholder="Le titre de votre film..."
        maxLength={80}
        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-lg text-white text-center placeholder:text-white/30 font-semibold"
      />
      <p className="text-xs text-white/40 text-center">{titre.length}/80 caractères</p>
      <button
        onClick={handleSubmit}
        disabled={!titre.trim() || submitting}
        className="w-full py-3 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Envoi..." : "Proposer ce titre"}
      </button>
    </div>
  );
}

// ── Position 4: Affiche ─────────────────────────────────
function AfficheForm({ sessionId, studentId }: PostprodStateProps) {
  const [style, setStyle] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!style || !description.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/postprod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, position: 4, data: { style, description: description.trim(), tagline: tagline.trim() || null } }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-white/50 mb-2">Style de l&apos;affiche</p>
        <div className="grid grid-cols-2 gap-2">
          {POSTER_STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStyle(s.key)}
              className={`p-3 rounded-lg text-left text-sm transition-all ${
                style === s.key
                  ? "bg-cyan-500/30 border-2 border-cyan-400"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <p className="text-white font-medium">{s.label}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Décris ton affiche : que voit-on ? Quelles couleurs ?"
        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 resize-none h-24"
      />

      <input
        type="text"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        placeholder="Tagline / accroche (optionnel)"
        maxLength={60}
        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30"
      />

      <button
        onClick={handleSubmit}
        disabled={!style || !description.trim() || submitting}
        className="w-full py-3 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Envoi..." : "Valider mon affiche"}
      </button>
    </div>
  );
}

// ── Position 5: Bande-annonce ───────────────────────────
function TrailerForm({ module13, sessionId, studentId }: PostprodStateProps) {
  const moments = module13.availableMoments || [];
  const [selected, setSelected] = useState<number[]>([]);
  const [voixOff, setVoixOff] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleMoment = (manche: number) => {
    setSelected((prev) => {
      if (prev.includes(manche)) return prev.filter((m) => m !== manche);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, manche];
    });
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
      await fetch(`/api/sessions/${sessionId}/postprod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, position: 5, data: { moments: selected, voixOff: voixOff.trim() || null } }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (moments.length === 0) {
    return (
      <div className="text-center text-white/50 py-8">
        <p>Aucun moment disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/50 text-center">Choisis jusqu&apos;à 3 moments pour la bande-annonce</p>
      <div className="space-y-2">
        {moments.map((m) => {
          const isSelected = selected.includes(m.manche);
          return (
            <button
              key={m.manche}
              onClick={() => toggleMoment(m.manche)}
              className={`w-full p-3 rounded-lg text-left text-sm transition-all ${
                isSelected
                  ? "bg-cyan-500/30 border-2 border-cyan-400"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <p className="text-white">{m.text}</p>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-white/40 text-center">{selected.length}/3 sélectionné{selected.length !== 1 ? "s" : ""}</p>

      <textarea
        value={voixOff}
        onChange={(e) => setVoixOff(e.target.value)}
        placeholder="Texte de la voix off (optionnel)"
        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 resize-none h-20"
      />

      <button
        onClick={handleSubmit}
        disabled={selected.length === 0 || submitting}
        className="w-full py-3 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-400 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Envoi..." : "Valider la bande-annonce"}
      </button>
    </div>
  );
}
