"use client";

import { useParams, useRouter } from "next/navigation";
import { useCharacters, useCreateCharacter } from "@/hooks/use-characters";
import { useAi } from "@/hooks/use-ai";
import { CharacterCard } from "@/components/bible/character-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CharacterForm } from "@/components/bible/character-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useState, useMemo } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import type { CreateCharacter } from "@/lib/models/character";

export default function CharactersPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: characters, isLoading } = useCharacters(slug);
  const createCharacter = useCreateCharacter(slug);
  const ai = useAi();
  const [showNew, setShowNew] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [concept, setConcept] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredCharacters = useMemo(() => {
    if (!characters) return [];
    return characters.filter((char) => {
      const matchesSearch = char.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesRole =
        roleFilter === "all" ||
        char.role.toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [characters, search, roleFilter]);

  const handleCreate = async (data: CreateCharacter) => {
    try {
      const char = await createCharacter.mutateAsync(data);
      toast.success("Personnage cree");
      setShowNew(false);
      router.push(`/project/${slug}/bible/characters/${char.id}`);
    } catch {
      toast.error("Erreur lors de la creation du personnage");
    }
  };

  const handleAiCreate = async () => {
    if (!concept.trim()) return;
    const loadingId = toast.loading("Generation en cours...");
    try {
      const result = await ai.mutateAsync({
        slug,
        action: "develop-concept",
        prompt: concept,
      });
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]) as CreateCharacter;
        const char = await createCharacter.mutateAsync(data);
        toast.dismiss(loadingId);
        toast.success("Personnage genere avec l'IA");
        setShowAi(false);
        setConcept("");
        router.push(`/project/${slug}/bible/characters/${char.id}`);
      } else {
        toast.dismiss(loadingId);
        toast.error("Reponse IA invalide");
      }
    } catch {
      toast.dismiss(loadingId);
      toast.error("Erreur lors de la generation IA");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Personnages</h2>
        <div className="flex gap-2">
          <Dialog open={showAi} onOpenChange={setShowAi}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Creer avec IA
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Creer un personnage avec l&apos;IA</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Decrivez un concept de personnage... Ex: Un ancien boxeur devenu imam dans une cite de banlieue"
                  rows={4}
                />
                <Button
                  onClick={handleAiCreate}
                  disabled={!concept.trim() || ai.isPending}
                  className="w-full"
                >
                  {ai.isPending
                    ? "Generation en cours..."
                    : "Developper ce concept"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showNew} onOpenChange={setShowNew}>
            <DialogTrigger asChild>
              <Button size="sm">+ Nouveau personnage</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouveau personnage</DialogTitle>
              </DialogHeader>
              <CharacterForm
                onSubmit={handleCreate}
                isPending={createCharacter.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un personnage..."
          className="sm:max-w-xs"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filtrer par role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="protagoniste">Protagoniste</SelectItem>
            <SelectItem value="antagoniste">Antagoniste</SelectItem>
            <SelectItem value="secondaire">Secondaire</SelectItem>
            <SelectItem value="figurant">Figurant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <PageSkeleton variant="grid" />
      ) : !characters?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-2">Aucun personnage</p>
          <p className="text-sm mb-4">
            Creez votre premier personnage manuellement ou avec l&apos;IA.
          </p>
          <Button size="sm" onClick={() => setShowNew(true)}>
            + Nouveau personnage
          </Button>
        </div>
      ) : !filteredCharacters.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Aucun personnage ne correspond aux filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharacters.map((char) => (
            <CharacterCard key={char.id} character={char} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
