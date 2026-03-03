"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScreenplayDisplay } from "@/components/workshop/screenplay-display";
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
import { useScene, useUpdateScene, useDeleteScene } from "@/hooks/use-workshop";
import { useCharacters } from "@/hooks/use-characters";
import { useAiStream } from "@/hooks/use-ai-stream";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function SceneDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { data: scene, isLoading } = useScene(slug, id);
  const { data: characters } = useCharacters(slug);
  const updateMutation = useUpdateScene(slug);
  const deleteMutation = useDeleteScene(slug);
  const { text, isStreaming, error, stream, abort } = useAiStream();

  const displayText = text || scene?.rawText || "";

  const handleGenerate = useCallback(async () => {
    if (!scene) return;
    const result = await stream(
      `/api/projects/${slug}/workshop/scenes/generate`,
      {
        characterIds: scene.characterIds,
        context: scene.context,
        tone: scene.tone,
        location: scene.location,
        stakes: scene.stakes,
      }
    );
    if (result) {
      updateMutation.mutate({ id, data: { rawText: result } });
      toast.success("Scene generee");
    }
  }, [scene, slug, id, stream, updateMutation]);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    toast.success("Copie dans le presse-papier");
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Scene supprimee");
      router.push(`/project/${slug}/workshop/scenes`);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const charMap = new Map(characters?.map((c) => [c.id, c]) || []);

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!scene) {
    return <p className="text-muted-foreground">Scene introuvable</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/project/${slug}/workshop/scenes`)
            }
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <h2 className="text-xl font-bold mt-1">{scene.title}</h2>
          <div className="flex flex-wrap gap-2 mt-1">
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
      </div>

      <ScreenplayDisplay text={displayText} isStreaming={isStreaming} />

      {error && (
        <p className="text-sm text-destructive">Erreur : {error}</p>
      )}

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {!displayText && !isStreaming && (
            <Button onClick={handleGenerate}>Generer la scene</Button>
          )}

          {displayText && !isStreaming && (
            <>
              <Button variant="outline" onClick={handleGenerate}>
                Regenerer
              </Button>
              <Button variant="outline" onClick={handleCopy}>
                Copier
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Supprimer</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cette scene ?</AlertDialogTitle>
                    <AlertDialogDescription>Cette action est irreversible.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {isStreaming && (
            <Button variant="destructive" onClick={abort}>
              Arreter
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
