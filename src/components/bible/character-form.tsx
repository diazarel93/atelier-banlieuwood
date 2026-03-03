"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import type { Character, CreateCharacter } from "@/lib/models/character";

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

interface CharacterFormProps {
  initial?: Character;
  onSubmit: (data: CreateCharacter) => void;
  isPending?: boolean;
}

export function CharacterForm({
  initial,
  onSubmit,
  isPending,
}: CharacterFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [age, setAge] = useState(initial?.age || "");
  const [occupation, setOccupation] = useState(initial?.occupation || "");
  const [role, setRole] = useState(initial?.role || "");
  const [color, setColor] = useState(initial?.color || COLORS[0]);
  const [backstory, setBackstory] = useState(initial?.backstory || "");
  const [goal, setGoal] = useState(initial?.psychology?.goal || "");
  const [need, setNeed] = useState(initial?.psychology?.need || "");
  const [flaw, setFlaw] = useState(initial?.psychology?.flaw || "");
  const [fear, setFear] = useState(initial?.psychology?.fear || "");
  const [secret, setSecret] = useState(initial?.psychology?.secret || "");
  const [vocabulary, setVocabulary] = useState(initial?.voice?.vocabulary || "");
  const [register, setRegister] = useState(initial?.voice?.register || "");
  const [verbalTics, setVerbalTics] = useState(
    initial?.voice?.verbalTics?.join(", ") || ""
  );
  const [examplePhrases, setExamplePhrases] = useState(
    initial?.voice?.examplePhrases?.join("\n") || ""
  );
  const [traitName, setTraitName] = useState("");
  const [traitIntensity, setTraitIntensity] = useState(5);
  const [traits, setTraits] = useState(initial?.traits || []);
  const [notes, setNotes] = useState(initial?.notes || "");

  const addTrait = () => {
    if (!traitName.trim()) return;
    setTraits([...traits, { name: traitName.trim(), intensity: traitIntensity }]);
    setTraitName("");
    setTraitIntensity(5);
  };

  const removeTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      age,
      occupation,
      role,
      color,
      backstory,
      psychology: { goal, need, flaw, fear, secret },
      traits,
      voice: {
        vocabulary,
        register,
        verbalTics: verbalTics
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        examplePhrases: examplePhrases.split("\n").filter(Boolean),
      },
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="identity">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="identity">Identite</TabsTrigger>
          <TabsTrigger value="psychology">Psychologie</TabsTrigger>
          <TabsTrigger value="voice">Voix</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Prénom Nom"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="28 ans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Métier / rôle social"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role narratif</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="protagoniste">Protagoniste</SelectItem>
                  <SelectItem value="antagoniste">Antagoniste</SelectItem>
                  <SelectItem value="secondaire">Secondaire</SelectItem>
                  <SelectItem value="figurant">Figurant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backstory">Backstory</Label>
            <Textarea
              id="backstory"
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              placeholder="L'histoire passée du personnage..."
              rows={5}
            />
          </div>

          {/* Traits */}
          <GlassCard hover={false}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Traits de personnalite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={traitName}
                  onChange={(e) => setTraitName(e.target.value)}
                  placeholder="Trait..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTrait();
                    }
                  }}
                />
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={traitIntensity}
                  onChange={(e) => setTraitIntensity(Number(e.target.value))}
                  className="w-16"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTrait}>
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {traits.map((t, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTrait(i)}
                  >
                    {t.name} ({t.intensity}/10) x
                  </Badge>
                ))}
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>

        <TabsContent value="psychology" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="goal">Objectif (conscient)</Label>
            <Input
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ce que le personnage veut..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="need">Besoin profond (inconscient)</Label>
            <Input
              id="need"
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              placeholder="Ce dont il a vraiment besoin..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flaw">Faille</Label>
            <Input
              id="flaw"
              value={flaw}
              onChange={(e) => setFlaw(e.target.value)}
              placeholder="Sa faiblesse principale..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fear">Peur fondamentale</Label>
            <Input
              id="fear"
              value={fear}
              onChange={(e) => setFear(e.target.value)}
              placeholder="Ce qui le terrorise..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secret">Secret</Label>
            <Textarea
              id="secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Ce qu'il cache aux autres..."
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vocabulary">Vocabulaire</Label>
              <Input
                id="vocabulary"
                value={vocabulary}
                onChange={(e) => setVocabulary(e.target.value)}
                placeholder="Argot, soutenu, technique..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register">Registre</Label>
              <Input
                id="register"
                value={register}
                onChange={(e) => setRegister(e.target.value)}
                placeholder="Familier, courant, soutenu..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="verbalTics">Tics verbaux (separes par virgule)</Label>
            <Input
              id="verbalTics"
              value={verbalTics}
              onChange={(e) => setVerbalTics(e.target.value)}
              placeholder="genre, tu vois, en fait..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="examplePhrases">
              Phrases exemples (une par ligne)
            </Label>
            <Textarea
              id="examplePhrases"
              value={examplePhrases}
              onChange={(e) => setExamplePhrases(e.target.value)}
              placeholder="Des phrases typiques du personnage..."
              rows={4}
              className="font-mono"
            />
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes libres</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Idées, inspirations, références..."
              rows={10}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" disabled={!name.trim() || isPending}>
        {isPending
          ? "Sauvegarde..."
          : initial
            ? "Mettre a jour"
            : "Creer le personnage"}
      </Button>
    </form>
  );
}
