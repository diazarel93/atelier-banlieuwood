"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConflictTimeline } from "@/components/workshop/conflict-timeline";
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
  useConflict,
  useUpdateConflict,
  useDeleteConflict,
} from "@/hooks/use-workshop";
import { useCharacters } from "@/hooks/use-characters";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { ConflictPhase } from "@/lib/models/workshop";

export default function ConflictDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { data: conflict, isLoading } = useConflict(slug, id);
  const { data: characters } = useCharacters(slug);
  const updateMutation = useUpdateConflict(slug);
  const deleteMutation = useDeleteConflict(slug);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conflictChars =
    characters?.filter((c) => conflict?.characterIds.includes(c.id)) || [];

  const handleGenerate = useCallback(async () => {
    if (!conflict) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/projects/${slug}/workshop/conflicts/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            characterIds: conflict.characterIds,
            tensionPoint: conflict.tensionPoint,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await res.json();
      updateMutation.mutate({
        id,
        data: {
          phases: data.phases as ConflictPhase[],
          rawText: data.rawText,
        },
      });
      toast.success("Analyse generee");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      setError(message);
      toast.error("Erreur lors de l'analyse");
    } finally {
      setGenerating(false);
    }
  }, [conflict, slug, id, updateMutation]);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Conflit supprime");
      router.push(`/project/${slug}/workshop/conflicts`);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const charMap = new Map(characters?.map((c) => [c.id, c]) || []);

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!conflict) {
    return <p className="text-muted-foreground">Analyse introuvable</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/project/${slug}/workshop/conflicts`)
            }
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <h2 className="text-xl font-bold mt-1">{conflict.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {conflict.tensionPoint}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {conflict.characterIds.map((cid) => {
              const char = charMap.get(cid);
              return char ? (
                <Badge
                  key={cid}
                  variant="secondary"
                  style={{ borderColor: char.color, borderWidth: 1 }}
                >
                  {char.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      </div>

      <ConflictTimeline phases={conflict.phases || []} characters={conflictChars} />

      {error && (
        <p className="text-sm text-destructive">Erreur : {error}</p>
      )}

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {(!conflict.phases || conflict.phases.length === 0) &&
            !generating && (
              <Button onClick={handleGenerate}>Analyser le conflit</Button>
            )}

          {conflict.phases && conflict.phases.length > 0 && !generating && (
            <>
              <Button variant="outline" onClick={handleGenerate}>
                Regenerer
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Supprimer</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce conflit ?</AlertDialogTitle>
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

          {generating && (
            <Button disabled>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Analyse en cours...
              </span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
