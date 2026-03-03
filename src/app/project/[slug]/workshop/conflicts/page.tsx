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
  useConflicts,
  useCreateConflict,
  useDeleteConflict,
} from "@/hooks/use-workshop";
import { useCharacters } from "@/hooks/use-characters";
import { Swords } from "lucide-react";
import { toast } from "sonner";

export default function ConflictsListPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: conflicts, isLoading } = useConflicts(slug);
  const { data: characters } = useCharacters(slug);
  const createMutation = useCreateConflict(slug);
  const deleteMutation = useDeleteConflict(slug);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tensionPoint, setTensionPoint] = useState("");

  const charMap = new Map(characters?.map((c) => [c.id, c]) || []);

  const handleCreate = async () => {
    if (!title.trim() || selectedIds.length < 2 || !tensionPoint.trim())
      return;
    try {
      const conflict = await createMutation.mutateAsync({
        title: title.trim(),
        characterIds: selectedIds,
        tensionPoint: tensionPoint.trim(),
      });
      toast.success("Conflit cree");
      router.push(`/project/${slug}/workshop/conflicts/${conflict.id}`);
    } catch {
      toast.error("Erreur lors de la creation");
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Conflit supprime"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testeur de Conflits</h2>
          <p className="text-muted-foreground text-sm">
            Analysez les conflits entre personnages en 4 phases psychologiques
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Nouveau conflit"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Lucia vs Tony - Le secret revele..."
            />
          </div>

          <div className="space-y-2">
            <Label>Personnages (2-3)</Label>
            <CharacterPicker
              slug={slug}
              selected={selectedIds}
              onChange={setSelectedIds}
              min={2}
              max={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Point de tension</Label>
            <Textarea
              value={tensionPoint}
              onChange={(e) => setTensionPoint(e.target.value)}
              placeholder="Decrivez le point de tension qui declenche le conflit..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={
              !title.trim() ||
              selectedIds.length < 2 ||
              !tensionPoint.trim() ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? "Creation..." : "Analyser le conflit"}
          </Button>
        </Card>
      )}

      {isLoading ? (
        <PageSkeleton variant="grid" count={4} />
      ) : !conflicts?.length ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Swords className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-2">Aucune analyse de conflit</p>
          <p className="text-sm mb-4">
            Testez les dynamiques entre vos personnages avec l&apos;analyse en 4
            phases.
          </p>
          <Button size="sm" onClick={() => setShowForm(true)}>
            Nouveau conflit
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {conflicts.map((conflict) => (
            <Card
              key={conflict.id}
              className="p-4 hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() =>
                router.push(
                  `/project/${slug}/workshop/conflicts/${conflict.id}`
                )
              }
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {conflict.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {conflict.tensionPoint}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conflict.characterIds.map((cid) => {
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
                    {conflict.phases?.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {conflict.phases.length} phases
                      </Badge>
                    )}
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
                      <AlertDialogTitle>Supprimer ce conflit ?</AlertDialogTitle>
                      <AlertDialogDescription>Cette action est irreversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(conflict.id)}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(conflict.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
