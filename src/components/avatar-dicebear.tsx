"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

/** Avatar options — DiceBear Avataaars (buste, diversité peau/cheveux/vêtements) */
export interface AvatarOptions {
  // Avataaars properties
  top?: string[];
  topProbability?: number;
  hairColor?: string[];
  accessories?: string[];
  accessoriesProbability?: number;
  accessoriesColor?: string[];
  facialHair?: string[];
  facialHairProbability?: number;
  facialHairColor?: string[];
  clothing?: string[];
  clothesColor?: string[];
  clothingGraphic?: string[];
  eyes?: string[];
  eyebrows?: string[];
  mouth?: string[];
  skinColor?: string[];
  backgroundColor?: string[];
  // Custom field stored in avatar_data JSONB
  scene?: string;
}

/** Detect legacy formats (Adventurer, Notionists, Personas) */
function isLegacyAvatar(data: Record<string, unknown>): boolean {
  return (
    typeof data.skin === "string" || // Adventurer
    typeof data.brows !== "undefined" || // Notionists
    typeof data.lips !== "undefined" || // Notionists
    typeof data.gesture !== "undefined" || // Notionists
    typeof data.body !== "undefined" || // Personas
    (typeof data.hair === "string" && !Array.isArray(data.hair)) // Adventurer
  );
}

/** Convert any legacy avatar data to Avataaars defaults */
function legacyToOptions(): AvatarOptions {
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
}

/** Strip custom fields before passing to DiceBear */
function toDiceBearOpts(opts: AvatarOptions) {
  const { scene, ...dicebearOpts } = opts;
  void scene;
  return dicebearOpts;
}

interface DiceBearAvatarProps {
  options: AvatarOptions | Record<string, unknown>;
  size?: number;
  className?: string;
}

export function DiceBearAvatar({ options, size = 120, className }: DiceBearAvatarProps) {
  const svg = useMemo(() => {
    const opts: AvatarOptions = isLegacyAvatar(options as Record<string, unknown>)
      ? legacyToOptions()
      : (options as AvatarOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createAvatar(avataaars, { size, ...toDiceBearOpts(opts) } as any).toString();
  }, [options, size]);

  return (
    <div
      className={className}
      style={{ width: size, height: size, overflow: "hidden", flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function DiceBearAvatarMini({ options, size = 40, className }: DiceBearAvatarProps) {
  return <DiceBearAvatar options={options} size={size} className={className} />;
}

/** Card-style avatar with gradient fade at bottom */
export function DiceBearAvatarCard({
  options,
  size = 120,
  fadeColor = "rgb(15,23,42)",
  className,
}: DiceBearAvatarProps & { fadeColor?: string }) {
  const svg = useMemo(() => {
    const opts: AvatarOptions = isLegacyAvatar(options as Record<string, unknown>)
      ? legacyToOptions()
      : (options as AvatarOptions);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createAvatar(avataaars, { size, ...toDiceBearOpts(opts) } as any).toString();
  }, [options, size]);

  return (
    <div className={className} style={{ position: "relative", width: size, flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "12px 12px 0 0",
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: size * 0.25,
          background: `linear-gradient(to bottom, transparent, ${fadeColor})`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
