"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CharacterPicker } from "@/components/workshop/character-picker";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useScenes,
  useCreateScene,
  useDeleteScene,
} from "@/hooks/use-workshop";
import { useCharacters } from "@/hooks/use-characters";
import { Film } from "lucide-react";
import { toast } from "sonner";

export default function ScenesListPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: scenes, isLoading } = useScenes(slug);
  const { data: characters } = useCharacters(slug);
  const createMutation = useCreateScene(slug);
  const deleteMutation = useDeleteScene(slug);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("");
  const [location, setLocation] = useState("");
  const [stakes, setStakes] = useState("");

  const charMap = new Map(characters?.map((c) => [c.id, c]) || []);

  const handleCreate = async () => {
    if (!title.trim() || !selectedIds.length || !context.trim()) return;
    try {
      const scene = await createMutation.mutateAsync({
        title: title.trim(),
        characterIds: selectedIds,
        context: context.trim(),
        tone: tone.trim() || undefined,
        location: location.trim() || undefined,
        stakes: stakes.trim() || undefined,
      });
      toast.success("Scene creee");
      router.push(`/project/${slug}/workshop/scenes/${scene.id}`);
    } catch {
      toast.error("Erreur lors de la creation");
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Scene supprimee"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generateur de Scenes</h2>
          <p className="text-muted-foreground text-sm">
            Ecrivez des scenes completes au format scenario
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Nouvelle scene"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: La revelation au diner..."
            />
          </div>

          <div className="space-y-2">
            <Label>Personnages</Label>
            <CharacterPicker
              slug={slug}
              selected={selectedIds}
              onChange={setSelectedIds}
              min={1}
              max={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Contexte de la scene</Label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Decrivez ce qui se passe dans cette scene..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tonalite</Label>
              <Input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Ex: Tendu, dramatique"
              />
            </div>
            <div className="space-y-2">
              <Label>Lieu</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Appartement de Lucia"
              />
            </div>
            <div className="space-y-2">
              <Label>Enjeux</Label>
              <Input
                value={stakes}
                onChange={(e) => setStakes(e.target.value)}
                placeholder="Ex: Revelation du secret"
              />
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={
              !title.trim() ||
              !selectedIds.length ||
              !context.trim() ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? "Creation..." : "Generer la scene"}
          </Button>
        </Card>
      )}

      {isLoading ? (
        <PageSkeleton variant="grid" count={4} />
      ) : !scenes?.length ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Film className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-2">Aucune scene generee</p>
          <p className="text-sm mb-4">
            Creez votre premiere scene au format scenario.
          </p>
          <Button size="sm" onClick={() => setShowForm(true)}>
            Nouvelle scene
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {scenes.map((scene) => (
            <Card
              key={scene.id}
              className="p-4 hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() =>
                router.push(`/project/${slug}/workshop/scenes/${scene.id}`)
              }
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {scene.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {scene.context}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {scene.tone && (
                      <Badge variant="outline" className="text-xs">
                        {scene.tone}
                      </Badge>
                    )}
                    {scene.location && (
                      <Badge variant="outline" className="text-xs">
                        {scene.location}
                      </Badge>
                    )}
                    {scene.characterIds.map((cid) => {
                      const char = charMap.get(cid);
                      return char ? (
                        <Badge
                          key={cid}
                          variant="secondary"
                          className="text-xs"
                          style={{ borderColor: char.color, borderWidth: 1 }}
                        >
                          {char.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Suppr.
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer cette scene ?</AlertDialogTitle>
                      <AlertDialogDescription>Cette action est irreversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(scene.id)}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(scene.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
