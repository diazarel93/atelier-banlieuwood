"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  useEpisode,
  useUpdateEpisode,
  useDeleteEpisode,
} from "@/hooks/use-war-room";
import { useScenes } from "@/hooks/use-workshop";
import { useCharacters } from "@/hooks/use-characters";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Episode } from "@/lib/models/war-room";

const STATUSES: Episode["status"][] = [
  "draft",
  "outline",
  "writing",
  "revision",
  "final",
];

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  outline: "Outline",
  writing: "Ecriture",
  revision: "Revision",
  final: "Final",
};

export default function EpisodeDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { data: episode, isLoading } = useEpisode(slug, id);
  const { data: allScenes } = useScenes(slug);
  const { data: characters } = useCharacters(slug);
  const updateMutation = useUpdateEpisode(slug);
  const deleteMutation = useDeleteEpisode(slug);

  const [synopsis, setSynopsis] = useState("");
  const [notes, setNotes] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (episode && !initialized) {
      setSynopsis(episode.synopsis || "");
      setNotes(episode.notes || "");
      setInitialized(true);
    }
  }, [episode, initialized]);

  const charMap = new Map(characters?.map((c) => [c.id, c]) || []);

  const assignedScenes =
    allScenes?.filter((s) => episode?.sceneIds.includes(s.id)) || [];
  const availableScenes =
    allScenes?.filter((s) => !episode?.sceneIds.includes(s.id)) || [];

  const handleSave = () => {
    updateMutation.mutate(
      { id, data: { synopsis, notes } },
      {
        onSuccess: () => toast.success("Episode sauvegarde"),
        onError: () => toast.error("Erreur lors de la sauvegarde"),
      }
    );
  };

  const handleStatusChange = (status: Episode["status"]) => {
    updateMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => toast.success(`Statut: ${STATUS_LABELS[status]}`),
      }
    );
  };

  const handleAddScene = (sceneId: string) => {
    if (!episode) return;
    updateMutation.mutate(
      { id, data: { sceneIds: [...episode.sceneIds, sceneId] } },
      {
        onSuccess: () => toast.success("Scene ajoutee"),
      }
    );
  };

  const handleRemoveScene = (sceneId: string) => {
    if (!episode) return;
    updateMutation.mutate(
      { id, data: { sceneIds: episode.sceneIds.filter((s) => s !== sceneId) } },
      {
        onSuccess: () => toast.success("Scene retiree"),
      }
    );
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Episode supprime");
      router.push(`/project/${slug}/war-room/episodes`);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!episode) {
    return <p className="text-muted-foreground">Episode introuvable</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/project/${slug}/war-room/episodes`)
            }
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <h2 className="text-xl font-bold mt-1">
            Episode {episode.number}: {episode.title}
          </h2>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cet episode ?</AlertDialogTitle>
              <AlertDialogDescription>Cette action est irreversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Status */}
      <Card className="p-4">
        <Label className="mb-2 block">Statut</Label>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={episode.status === s ? "default" : "outline"}
              onClick={() => handleStatusChange(s)}
            >
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      </Card>

      {/* Synopsis & Notes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-2">
          <Label>Synopsis</Label>
          <Textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={6}
            placeholder="Resume detaille de l'episode..."
          />
        </Card>
        <Card className="p-4 space-y-2">
          <Label>Notes de production</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Notes, idees, points d'attention..."
          />
        </Card>
      </div>
      <Button onClick={handleSave} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
      </Button>

      {/* Assigned Scenes */}
      <Card className="p-4 space-y-3">
        <h3 className="font-medium">
          Scenes de l&apos;episode ({assignedScenes.length})
        </h3>
        {assignedScenes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune scene assignee. Ajoutez des scenes du Workshop ci-dessous.
          </p>
        ) : (
          <div className="space-y-2">
            {assignedScenes.map((scene) => (
              <div
                key={scene.id}
                className="flex items-center gap-3 p-2 bg-muted/30 rounded"
              >
                <span className="text-sm font-medium flex-1">
                  {scene.title}
                </span>
                <div className="flex gap-1">
                  {scene.characterIds.map((cid) => {
                    const char = charMap.get(cid);
                    return char ? (
                      <span
                        key={cid}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: char.color }}
                        title={char.name}
                      />
                    ) : null;
                  })}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveScene(scene.id)}
                >
                  Retirer
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Available Scenes */}
      {availableScenes.length > 0 && (
        <Card className="p-4 space-y-3">
          <h3 className="font-medium text-muted-foreground">
            Scenes disponibles ({availableScenes.length})
          </h3>
          <div className="space-y-2">
            {availableScenes.map((scene) => (
              <div
                key={scene.id}
                className="flex items-center gap-3 p-2 rounded border border-dashed hover:border-primary/50 transition-colors"
              >
                <span className="text-sm flex-1">{scene.title}</span>
                {scene.tone && (
                  <Badge variant="outline" className="text-xs">
                    {scene.tone}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddScene(scene.id)}
                >
                  Ajouter
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
