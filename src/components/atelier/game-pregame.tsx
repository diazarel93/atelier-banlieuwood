"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GENRE_OPTIONS,
  AUDIENCE_OPTIONS,
  OBJECTIVE_OPTIONS,
  CHAPTER_IDS,
  TOTAL_QUESTIONS,
  type GameConfig,
  type AtelierLevel,
} from "@/lib/models/atelier";
import { motion, AnimatePresence } from "motion/react";
import {
  Star,
  Flame,
  Trophy,
  Award,
  Play,
  ArrowRight,
  MapPin,
  Users,
  User,
  Clapperboard,
  Palette,
  AlertTriangle,
  Check,
} from "lucide-react";

type PreGameScreen = "splash" | "objective" | "briefing" | "setup";

export function GamePreGame({
  level,
  onStart,
}: {
  level: AtelierLevel;
  onStart: (config: GameConfig) => void;
}) {
  const [screen, setScreen] = useState<PreGameScreen>("splash");
  const [config, setConfig] = useState<GameConfig>({
    objective: "tournage",
    genre: "",
    audience: "",
    protagonist: "",
    theme: "",
    location: "",
    teamSize: 1,
    constraints: "",
  });

  return (
    <div className="fixed inset-0 z-50 bg-background text-white overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <SplashScreen key="splash" level={level} onNext={() => setScreen("objective")} />
        )}
        {screen === "objective" && (
          <ObjectiveScreen
            key="objective"
            selected={config.objective}
            onSelect={(obj) => setConfig({ ...config, objective: obj })}
            onNext={() => setScreen("briefing")}
          />
        )}
        {screen === "briefing" && (
          <BriefingScreen
            key="briefing"
            isTournage={config.objective === "tournage"}
            onNext={() => setScreen("setup")}
          />
        )}
        {screen === "setup" && (
          <SetupScreen
            key="setup"
            config={config}
            onChange={setConfig}
            onStart={() => onStart(config)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Splash ──────────────────────────────────────────────────────

function SplashScreen({
  level,
  onNext,
}: {
  level: AtelierLevel;
  onNext: () => void;
}) {
  const levelLabel = { primaire: "Primaire", college: "College", lycee: "Lycee", fac: "Fac+" }[level];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="relative h-full flex flex-col items-center justify-center gap-8"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-accent/10 border border-white/5 flex items-center justify-center shadow-2xl">
          <Clapperboard className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold">
            Module 1
          </p>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            L&apos;Histoire
          </h1>
          <p className="text-base text-white/40">
            {CHAPTER_IDS.length} chapitres &middot; {TOTAL_QUESTIONS} questions
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/60"
      >
        Niveau : <span className="text-white font-bold">{levelLabel}</span>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Button
          onClick={onNext}
          size="lg"
          className="rounded-2xl px-10 h-14 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-100 border-0"
        >
          <Play className="h-5 w-5 mr-2 fill-current" />
          Jouer
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ── Objective ───────────────────────────────────────────────────

function ObjectiveScreen({
  selected,
  onSelect,
  onNext,
}: {
  selected: string;
  onSelect: (obj: string) => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="relative h-full flex flex-col items-center justify-center gap-8 px-6"
    >
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold">
          Avant de commencer
        </p>
        <h2 className="text-3xl font-black tracking-tight">C&apos;est quoi ton objectif ?</h2>
        <p className="text-sm text-white/40 max-w-sm mx-auto">
          Ca change la facon dont le mentor t&apos;accompagne
        </p>
      </div>

      <div className="flex flex-col gap-3 max-w-md w-full">
        {OBJECTIVE_OPTIONS.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            onClick={() => onSelect(opt.id)}
            className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
              selected === opt.id
                ? "border-primary/40 bg-primary/10 shadow-lg shadow-primary/10"
                : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-2xl shrink-0">{opt.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{opt.label}</p>
              <p className="text-xs text-white/40">{opt.desc}</p>
            </div>
            {selected === opt.id && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <Button
        onClick={onNext}
        size="lg"
        className="rounded-2xl px-8 h-12 bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/20"
      >
        Suivant
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>
  );
}

// ── Briefing ────────────────────────────────────────────────────

function BriefingScreen({
  isTournage,
  onNext,
}: {
  isTournage: boolean;
  onNext: () => void;
}) {
  const rules = [
    { icon: Star, label: "1 a 3 etoiles", desc: "par question" },
    { icon: Flame, label: "Series", desc: "enchaine les 3 etoiles" },
    { icon: Trophy, label: "Badges", desc: "Or, Argent, Bronze par chapitre" },
    { icon: Award, label: "11 succes", desc: "caches a debloquer" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="relative h-full flex flex-col items-center justify-center gap-6 px-6"
    >
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold">
          Comment ca marche
        </p>
        <h2 className="text-3xl font-black tracking-tight">Les regles du jeu</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
        {rules.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center space-y-2"
          >
            <r.icon className="h-6 w-6 mx-auto text-primary" />
            <div>
              <p className="text-sm font-bold text-white">{r.label}</p>
              <p className="text-xs text-white/40">{r.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-2 text-sm text-white/50 max-w-md"
      >
        <p className="flex items-start gap-2">
          <span className="text-primary mt-0.5">&#9679;</span>
          Un mentor IA evalue chaque reponse et t&apos;aide a approfondir
        </p>
        {isTournage ? (
          <>
            <p className="flex items-start gap-2">
              <span className="text-primary mt-0.5">&#9679;</span>
              Tu prepares un film que ton equipe va <span className="text-white font-semibold">vraiment tourner</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5"><AlertTriangle className="h-3.5 w-3.5 inline" /></span>
              <span>
                Reste <span className="text-amber-300 font-semibold">realiste</span> : vrais lieux, vrais acteurs,
                pas d&apos;effets speciaux impossibles. Si t&apos;imagines Avatar, ca va etre dur a tourner !
              </span>
            </p>
          </>
        ) : (
          <p className="flex items-start gap-2">
            <span className="text-primary mt-0.5">&#9679;</span>
            Tu construis les fondations d&apos;une histoire solide
          </p>
        )}
      </motion.div>

      <Button
        onClick={onNext}
        size="lg"
        className="rounded-2xl px-8 h-12 bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/20"
      >
        Configurer mon projet
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>
  );
}

// ── Setup ───────────────────────────────────────────────────────

function SetupScreen({
  config,
  onChange,
  onStart,
}: {
  config: GameConfig;
  onChange: (c: GameConfig) => void;
  onStart: () => void;
}) {
  const set = (key: keyof GameConfig, val: string | number) =>
    onChange({ ...config, [key]: val });

  const isTournage = config.objective === "tournage";

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4 }}
      className="relative h-full flex flex-col items-center justify-center gap-5 px-6"
    >
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold">
          {isTournage ? "Ton futur film" : "Ton projet"}
        </p>
        <h2 className="text-2xl font-black tracking-tight">
          {isTournage ? "Cadre le tournage" : "Cadre ton histoire"}
        </h2>
        <p className="text-sm text-white/40 max-w-sm">
          Le mentor adaptera ses questions en fonction. Tout est modifiable.
        </p>
      </div>

      <div className="w-full max-w-md space-y-3">
        {/* Genre + Audience */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-white/30 font-bold flex items-center gap-1.5">
              <Palette className="h-3 w-3" /> Genre
            </label>
            <Select value={config.genre} onValueChange={(v) => set("genre", v)}>
              <SelectTrigger className="rounded-xl bg-white/5 border-white/10 text-white h-10 text-sm">
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                {GENRE_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-white/30 font-bold flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Public cible
            </label>
            <Select value={config.audience} onValueChange={(v) => set("audience", v)}>
              <SelectTrigger className="rounded-xl bg-white/5 border-white/10 text-white h-10 text-sm">
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Protagonist */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-white/30 font-bold flex items-center gap-1.5">
            <User className="h-3 w-3" /> {isTournage ? "Acteur/personnage principal" : "Protagoniste principal"}
          </label>
          <Input
            value={config.protagonist}
            onChange={(e) => set("protagonist", e.target.value)}
            placeholder={isTournage ? 'Ex: "Aya, 16 ans, jouee par Fatoumata"' : 'Ex: "Aya, 16 ans, lyceenne timide"'}
            className="rounded-xl bg-white/5 border-white/10 text-white h-10 text-sm placeholder:text-white/20"
          />
        </div>

        {/* Theme + Location */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-white/30 font-bold flex items-center gap-1.5">
              <Clapperboard className="h-3 w-3" /> Theme
            </label>
            <Input
              value={config.theme}
              onChange={(e) => set("theme", e.target.value)}
              placeholder="Ex: identite, amitie..."
              className="rounded-xl bg-white/5 border-white/10 text-white h-10 text-sm placeholder:text-white/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-white/30 font-bold flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> {isTournage ? "Lieux de tournage" : "Lieu(x)"}
            </label>
            <Input
              value={config.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder={isTournage ? "Ex: cour du lycee, CDI, parc..." : "Ex: une ville, un quartier..."}
              className="rounded-xl bg-white/5 border-white/10 text-white h-10 text-sm placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Team size (only for tournage) */}
        {isTournage && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-white/30 font-bold flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Taille de l&apos;equipe (acteurs + techniciens)
            </label>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 5, 6, 8, 10, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => set("teamSize", n)}
                  className={`h-9 w-9 rounded-xl text-sm font-bold transition-all ${
                    config.teamSize === n
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-xs text-white/30 ml-1">pers.</span>
            </div>
          </div>
        )}

        {/* Tournage warning */}
        {isTournage && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80 leading-relaxed">
              <span className="font-bold text-amber-300">Pense faisable</span> : des vrais lieux ou tu peux aller,
              des personnages que ton equipe peut jouer, pas de scenes impossibles.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onStart}
          size="lg"
          className="rounded-2xl px-8 h-12 bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/20"
        >
          <Play className="h-4 w-4 mr-2 fill-current" />
          C&apos;est parti !
        </Button>
      </div>
    </motion.div>
  );
}
