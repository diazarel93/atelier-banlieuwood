"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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
  useEpisodes,
  useCreateEpisode,
  useDeleteEpisode,
} from "@/hooks/use-war-room";
import { Clapperboard } from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  outline: "Outline",
  writing: "Ecriture",
  revision: "Revision",
  final: "Final",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  outline: "bg-accent/20 text-accent",
  writing: "bg-primary/20 text-primary",
  revision: "bg-yellow-500/20 text-yellow-600",
  final: "bg-green-500/20 text-green-500",
};

export default function EpisodesPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: episodes, isLoading } = useEpisodes(slug);
  const createMutation = useCreateEpisode(slug);
  const deleteMutation = useDeleteEpisode(slug);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        synopsis: synopsis.trim() || undefined,
      });
      toast.success("Episode cree");
      setTitle("");
      setSynopsis("");
      setShowForm(false);
    } catch {
      toast.error("Erreur lors de la creation");
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Episode supprime"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Planificateur d&apos;Episodes</h2>
          <p className="text-muted-foreground text-sm">
            Organisez la structure narrative de votre serie
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Nouvel episode"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Titre de l&apos;episode</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pilote — La Chute"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="space-y-2">
            <Label>Synopsis</Label>
            <Textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Resume de l'episode..."
              rows={3}
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Creation..." : "Creer l'episode"}
          </Button>
        </Card>
      )}

      {isLoading ? (
        <PageSkeleton variant="list" count={4} />
      ) : !episodes?.length ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Clapperboard className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-2">Aucun episode</p>
          <p className="text-sm mb-4">
            Creez votre premier episode pour structurer votre serie.
          </p>
          <Button size="sm" onClick={() => setShowForm(true)}>
            Nouvel episode
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {episodes.map((ep) => (
            <Card
              key={ep.id}
              className="p-4 hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() =>
                router.push(`/project/${slug}/war-room/episodes/${ep.id}`)
              }
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-card/50 border border-border/30 text-sm font-bold shrink-0">
                  {ep.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {ep.title}
                    </h3>
                    <Badge className={`text-xs ${STATUS_COLORS[ep.status] || ""}`}>
                      {STATUS_LABELS[ep.status] || ep.status}
                    </Badge>
                    {ep.sceneIds.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {ep.sceneIds.length} scenes
                      </Badge>
                    )}
                  </div>
                  {ep.synopsis && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {ep.synopsis}
                    </p>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Suppr.
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer cet episode ?</AlertDialogTitle>
                      <AlertDialogDescription>Cette action est irreversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(ep.id)}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
