"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { SuccessCheck } from "@/components/play/success-check";
import { DiceBearAvatar } from "@/components/avatar-dicebear";
import { haptic } from "@/components/play/utils";
import {
  AVATAR_SKIN_COLOR,
  AVATAR_TOP,
  AVATAR_HAIR_COLOR,
  AVATAR_EYES,
  AVATAR_EYEBROWS,
  AVATAR_MOUTH,
  AVATAR_CLOTHING,
  AVATAR_CLOTHES_COLOR,
  AVATAR_ACCESSORIES,
  AVATAR_FACIAL_HAIR,
  AVATAR_HEADWEAR,
  AVATAR_GRAPHIC,
  AVATAR_BACKGROUND,
} from "@/lib/module10-data";
import type { AvatarOptions } from "@/components/avatar-dicebear";
import type { Module10Data } from "@/hooks/use-session-polling";

export interface AvatarBuilderStateProps {
  module10: Module10Data;
  sessionId: string;
  studentId: string;
  onDone: (data: { prenom: string; trait: string; avatar: AvatarOptions }) => void;
}

export function AvatarBuilderState({ module10, sessionId, studentId, onDone }: AvatarBuilderStateProps) {
  const [prenom, setPrenom] = useState(module10.personnage?.prenom || "");
  const [trait, setTrait] = useState(module10.personnage?.trait || "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [force, setForce] = useState(((module10.personnage as any)?.force as string) || "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [faiblesse, setFaiblesse] = useState(((module10.personnage as any)?.faiblesse as string) || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [tab, setTab] = useState<"peau" | "coiffure" | "visage" | "style">("peau");

  // DiceBear Avataaars state
  const [avatarOpts, setAvatarOpts] = useState<AvatarOptions>(() => {
    const existing = module10.personnage?.avatar;
    if (existing && Array.isArray(existing.top)) return existing as AvatarOptions;
    return {
      top: ["shortFlat"],
      hairColor: ["2c1b18"],
      eyes: ["default"],
      eyebrows: ["default"],
      mouth: ["smile"],
      clothing: ["hoodie"],
      clothesColor: ["65c9ff"],
      skinColor: ["d08b5b"],
      accessoriesProbability: 0,
      facialHairProbability: 0,
      backgroundColor: ["06b6d4"],
    };
  });

  function setOpt(key: keyof AvatarOptions, value: string) {
    // Special: "__bald__" = chauve (topProbability: 0)
    if (key === "top" && value === "__bald__") {
      setAvatarOpts((prev) => ({ ...prev, topProbability: 0 }));
      return;
    }
    if (key === "top") {
      setAvatarOpts((prev) => ({ ...prev, top: [value], topProbability: 100 }));
      return;
    }
    setAvatarOpts((prev) => ({ ...prev, [key]: [value] }));
  }

  function setHeadwear(key: string) {
    if (key === "none") {
      // Remove headwear, keep current hair
      setAvatarOpts((prev) => ({
        ...prev,
        top: prev.topProbability === 0 ? ["shortFlat"] : prev.top,
        topProbability: 100,
      }));
    } else {
      setAvatarOpts((prev) => ({ ...prev, top: [key], topProbability: 100 }));
    }
  }

  function setAccessory(key: string) {
    if (key === "none") {
      setAvatarOpts((prev) => ({ ...prev, accessories: undefined, accessoriesProbability: 0 }));
    } else {
      setAvatarOpts((prev) => ({ ...prev, accessories: [key], accessoriesProbability: 100 }));
    }
  }

  function setFacialHairOpt(key: string) {
    if (key === "none") {
      setAvatarOpts((prev) => ({ ...prev, facialHair: undefined, facialHairProbability: 0 }));
    } else {
      setAvatarOpts((prev) => ({ ...prev, facialHair: [key], facialHairProbability: 100 }));
    }
  }

  function randomize() {
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const hasFacialHair = Math.random() > 0.7;
    const hasAccessories = Math.random() > 0.5;
    const isBald = Math.random() > 0.9;
    const hasHat = !isBald && Math.random() > 0.75;
    const clothingKey = pick(AVATAR_CLOTHING).key;
    const hairOptions = AVATAR_TOP.filter((t) => t.key !== "__bald__");
    const hatOptions = AVATAR_HEADWEAR.filter((h) => h.key !== "none");
    const topChoice = isBald ? undefined : hasHat ? [pick(hatOptions).key] : [pick(hairOptions).key];
    const opts: AvatarOptions = {
      top: topChoice,
      topProbability: isBald ? 0 : 100,
      hairColor: [pick(AVATAR_HAIR_COLOR).key],
      eyes: [pick(AVATAR_EYES).key],
      eyebrows: [pick(AVATAR_EYEBROWS).key],
      mouth: [pick(AVATAR_MOUTH).key],
      clothing: [clothingKey],
      clothesColor: [pick(AVATAR_CLOTHES_COLOR).key],
      clothingGraphic: clothingKey === "graphicShirt" ? [pick(AVATAR_GRAPHIC).key] : undefined,
      skinColor: [pick(AVATAR_SKIN_COLOR).key],
      accessories: hasAccessories ? [pick(AVATAR_ACCESSORIES.slice(1)).key] : undefined,
      accessoriesProbability: hasAccessories ? 100 : 0,
      facialHair: hasFacialHair ? [pick(AVATAR_FACIAL_HAIR.slice(1)).key] : undefined,
      facialHairProbability: hasFacialHair ? 100 : 0,
      backgroundColor: [pick(AVATAR_BACKGROUND).key],
    };
    setAvatarOpts(opts);
    haptic();
  }

  const TRAITS_LOCAL = [
    { key: "courageux", label: "Courageux" },
    { key: "timide", label: "Timide" },
    { key: "drole", label: "Drôle" },
    { key: "rebelle", label: "Rebelle" },
    { key: "reveur", label: "Rêveur" },
    { key: "loyal", label: "Loyal" },
    { key: "malin", label: "Malin" },
    { key: "sensible", label: "Sensible" },
  ];

  const canSubmit = prenom.trim().length >= 1 && force.trim().length >= 2 && faiblesse.trim().length >= 2;

  async function handleSubmit() {
    setAttempted(true);
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const finalAvatar: AvatarOptions = { ...avatarOpts };
      await fetch(`/api/sessions/${sessionId}/personnage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          prenom: prenom.trim(),
          traitDominant: trait,
          force: force.trim(),
          faiblesse: faiblesse.trim(),
          avatarData: finalAvatar,
        }),
      });
      setSuccess(true);
      setTimeout(() => onDone({ prenom: prenom.trim(), trait, avatar: finalAvatar }), 600);
    } catch {
      toast.error("Erreur");
      setSubmitting(false);
    }
  }

  if (success) return <SuccessCheck />;

  const TABS = [
    { key: "peau" as const, label: "Peau" },
    { key: "coiffure" as const, label: "Coiffure" },
    { key: "visage" as const, label: "Visage" },
    { key: "style" as const, label: "Style" },
  ];

  const currentKey = (field: keyof AvatarOptions) => {
    // Show "__bald__" as selected when topProbability is 0
    if (field === "top" && avatarOpts.topProbability === 0) return "__bald__";
    const v = avatarOpts[field];
    return Array.isArray(v) ? v[0] : undefined;
  };
  const HEADWEAR_KEYS = new Set(AVATAR_HEADWEAR.filter((h) => h.key !== "none").map((h) => h.key));
  const currentHeadwear = avatarOpts.top?.[0] && HEADWEAR_KEYS.has(avatarOpts.top[0]) ? avatarOpts.top[0] : "none";
  const currentAccessory = avatarOpts.accessoriesProbability === 0 ? "none" : avatarOpts.accessories?.[0] || "none";
  const currentFacialHair = avatarOpts.facialHairProbability === 0 ? "none" : avatarOpts.facialHair?.[0] || "none";

  // Render a color swatch grid
  function SwatchGrid({
    options,
    field,
  }: {
    options: { key: string; label: string; color?: string }[];
    field: keyof AvatarOptions;
  }) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <motion.button
            key={opt.key}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setOpt(field, opt.key);
              haptic();
            }}
            title={opt.label}
            className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
              currentKey(field) === opt.key
                ? "border-bw-teal ring-2 ring-bw-teal/30 scale-110"
                : "border-white/10 hover:border-bw-teal/30"
            }`}
            style={{ backgroundColor: opt.color }}
          />
        ))}
      </div>
    );
  }

  // Render a labeled button grid
  function LabelGrid({
    options,
    field,
    onSelect,
    selectedKey,
  }: {
    options: { key: string; label: string }[];
    field?: keyof AvatarOptions;
    onSelect?: (key: string) => void;
    selectedKey?: string;
  }) {
    const selected = selectedKey ?? (field ? currentKey(field) : undefined);
    return (
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = selected === opt.key;
          return (
            <motion.button
              key={opt.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (onSelect) {
                  onSelect(opt.key);
                  haptic();
                } else if (field) {
                  setOpt(field, opt.key);
                  haptic();
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                isActive
                  ? "bg-bw-teal/20 border-bw-teal/40 text-bw-teal"
                  : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-bw-teal/20"
              }`}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4 w-full max-w-md mx-auto px-4"
    >
      <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-bw-teal/20 text-bw-teal">
        Mon personnage
      </span>

      {/* Avatar preview + randomize */}
      <div className="relative">
        <DiceBearAvatar options={avatarOpts} size={140} />
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={randomize}
          className="absolute -right-2 -bottom-1 w-9 h-9 rounded-full bg-bw-elevated border border-white/10 flex items-center justify-center text-lg cursor-pointer hover:border-bw-teal/30 transition-colors"
          title="Aléatoire"
        >
          <span role="img" aria-label="dé">
            🎲
          </span>
        </motion.button>
      </div>

      {/* Large randomize button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={randomize}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500/15 to-bw-teal/15 border border-purple-500/20 text-sm font-medium text-purple-300 flex items-center justify-center gap-2 cursor-pointer hover:from-purple-500/20 hover:to-bw-teal/20 hover:border-purple-500/30 transition-all"
      >
        <span className="text-base">🎲</span>
        Personnage aléatoire
      </motion.button>

      {/* Name */}
      <input
        value={prenom}
        onChange={(e) => setPrenom(e.target.value)}
        placeholder="Prénom du personnage"
        maxLength={30}
        className="w-full rounded-xl bg-bw-elevated border border-white/[0.06] px-3 py-2 text-sm text-bw-text placeholder-bw-muted focus:border-bw-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-teal/40 transition-colors"
      />

      {/* Tab bar */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                tab === t.key
                  ? "bg-bw-teal/20 text-bw-teal border border-bw-teal/40"
                  : "text-bw-muted hover:text-bw-text border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="w-full min-h-[120px]">
        <AnimatePresence mode="wait">
          {tab === "peau" && (
            <motion.div
              key="peau"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2"
            >
              <p className="text-xs text-bw-muted uppercase tracking-wider">Teinte de peau</p>
              <SwatchGrid options={AVATAR_SKIN_COLOR} field="skinColor" />
            </motion.div>
          )}

          {tab === "coiffure" && (
            <motion.div
              key="coiffure"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div>
                <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Coiffure</p>
                <LabelGrid options={AVATAR_TOP} field="top" />
              </div>
              <div>
                <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Couleur cheveux</p>
                <SwatchGrid options={AVATAR_HAIR_COLOR} field="hairColor" />
              </div>
              <div>
                <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Couvre-chef</p>
                <LabelGrid options={AVATAR_HEADWEAR} onSelect={setHeadwear} selectedKey={currentHeadwear} />
              </div>
            </motion.div>
          )}

          {tab === "visage" && (
            <motion.div
              key="visage"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div>
                <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Yeux</p>
                <LabelGrid options={AVATAR_EYES} field="eyes" />
              </div>
              <div>
                <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Sourcils</p>
                <LabelGrid options={AVATAR_EYEBROWS} field="eyebrows" />
              </div>
              <div>
                <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Bouche</p>
                <LabelGrid options={AVATAR_MOUTH} field="mouth" />
              </div>
            </motion.div>
          )}

          {tab === "style" && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div>
                <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Vêtement</p>
                <LabelGrid options={AVATAR_CLOTHING} field="clothing" />
              </div>
              <div>
                <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Couleur vêtement</p>
                <SwatchGrid options={AVATAR_CLOTHES_COLOR} field="clothesColor" />
              </div>
              {currentKey("clothing") === "graphicShirt" && (
                <div>
                  <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Motif t-shirt</p>
                  <LabelGrid options={AVATAR_GRAPHIC} field="clothingGraphic" />
                </div>
              )}
              <div>
                <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Accessoires</p>
                <LabelGrid options={AVATAR_ACCESSORIES} onSelect={setAccessory} selectedKey={currentAccessory} />
              </div>
              <div>
                <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Barbe / Moustache</p>
                <LabelGrid options={AVATAR_FACIAL_HAIR} onSelect={setFacialHairOpt} selectedKey={currentFacialHair} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trait dominant */}
      <div className="w-full">
        <p className="text-xs text-bw-muted uppercase tracking-wider mb-1.5">Trait dominant</p>
        <div className="flex flex-wrap gap-1.5">
          {TRAITS_LOCAL.map((t) => (
            <motion.button
              key={t.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTrait(t.key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                trait === t.key
                  ? "bg-bw-teal/20 border-bw-teal/40 text-bw-teal"
                  : "bg-bw-elevated border-white/[0.06] text-bw-muted hover:border-bw-teal/20"
              }`}
            >
              {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Force + Faiblesse (obligatoires) */}
      <div className="w-full space-y-2">
        <div>
          <p
            className={`text-xs uppercase tracking-wider mb-1 ${attempted && force.trim().length < 2 ? "text-red-400" : "text-bw-muted"}`}
          >
            Sa force <span className="text-red-400">*</span>
          </p>
          <input
            value={force}
            onChange={(e) => setForce(e.target.value)}
            placeholder="Ce qu'il/elle fait le mieux..."
            maxLength={100}
            className={`w-full rounded-xl bg-bw-elevated border px-3 py-2 text-sm text-bw-text placeholder-bw-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-teal/40 transition-colors ${attempted && force.trim().length < 2 ? "border-red-400/50 focus:border-red-400" : "border-white/[0.06] focus:border-bw-teal"}`}
          />
        </div>
        <div>
          <p
            className={`text-xs uppercase tracking-wider mb-1 ${attempted && faiblesse.trim().length < 2 ? "text-red-400" : "text-bw-muted"}`}
          >
            Sa faiblesse <span className="text-red-400">*</span>
          </p>
          <input
            value={faiblesse}
            onChange={(e) => setFaiblesse(e.target.value)}
            placeholder="Ce qui le/la freine..."
            maxLength={100}
            className={`w-full rounded-xl bg-bw-elevated border px-3 py-2 text-sm text-bw-text placeholder-bw-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-bw-teal/40 transition-colors ${attempted && faiblesse.trim().length < 2 ? "border-red-400/50 focus:border-red-400" : "border-white/[0.06] focus:border-bw-teal"}`}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-bw-teal to-bw-teal text-white font-medium text-sm disabled:opacity-40 transition-opacity cursor-pointer"
      >
        {submitting ? "Envoi..." : "Valider mon personnage"}
      </button>
    </motion.div>
  );
}
