"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVATAR_OPTIONS } from "@/lib/models/dashboard";
import { LEVEL_LABELS, type AtelierLevel } from "@/lib/models/atelier";
import { Loader2 } from "lucide-react";

export function JoinForm({
  onJoin,
  isPending,
  error,
}: {
  onJoin: (data: {
    joinCode: string;
    displayName: string;
    avatar: string;
    level: string;
  }) => void;
  isPending?: boolean;
  error?: string | null;
}) {
  const [joinCode, setJoinCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("🎬");
  const [level, setLevel] = useState<AtelierLevel>("college");

  const canSubmit =
    joinCode.trim().length >= 4 && displayName.trim().length >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onJoin({
      joinCode: joinCode.trim().toUpperCase(),
      displayName: displayName.trim(),
      avatar,
      level,
    });
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center space-y-2">
          <div className="text-4xl">🎬</div>
          <h2 className="text-xl font-bold">Rejoindre une classe</h2>
          <p className="text-sm text-muted-foreground">
            Entre le code donne par ta prof pour rejoindre l&apos;atelier
          </p>
        </div>

        {/* Join code */}
        <div className="space-y-2">
          <Label>Code de la classe</Label>
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="text-center text-2xl font-mono tracking-[0.5em] uppercase"
          />
        </div>

        {/* Display name */}
        <div className="space-y-2">
          <Label>Ton prenom ou pseudo</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Aya K."
            maxLength={30}
          />
        </div>

        {/* Avatar */}
        <div className="space-y-2">
          <Label>Choisis ton avatar</Label>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatar(emoji)}
                className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center border-2 transition-all ${
                  avatar === emoji
                    ? "border-primary bg-primary/10 scale-110"
                    : "border-transparent bg-muted hover:bg-muted/80"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="space-y-2">
          <Label>Ton niveau</Label>
          <Select value={level} onValueChange={(v) => setLevel(v as AtelierLevel)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(LEVEL_LABELS) as [AtelierLevel, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button
          type="submit"
          variant="cinema"
          className="w-full"
          disabled={!canSubmit || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connexion...
            </>
          ) : (
            "Rejoindre"
          )}
        </Button>
      </form>
    </Card>
  );
}
