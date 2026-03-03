"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useScripts,
  useCreateScript,
  useDeleteScript,
} from "@/hooks/use-workshop";
import { FileText } from "lucide-react";
import { toast } from "sonner";

export default function ScriptsListPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: scripts, isLoading } = useScripts(slug);
  const createMutation = useCreateScript(slug);
  const deleteMutation = useDeleteScript(slug);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const script = await createMutation.mutateAsync({
        title: title.trim(),
      });
      toast.success("Script cree");
      router.push(`/project/${slug}/workshop/scripts/${script.id}`);
    } catch {
      toast.error("Erreur lors de la creation");
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Script supprime"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editeur de Script</h2>
          <p className="text-muted-foreground text-sm">
            Ecrivez votre scenario bloc par bloc avec assistance IA
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Nouveau script"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Titre du script</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pilote - Episode 1..."
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Creation..." : "Creer le script"}
          </Button>
        </Card>
      )}

      {isLoading ? (
        <PageSkeleton variant="grid" count={4} />
      ) : !scripts?.length ? (
        <Card className="p-12 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-2">Aucun script</p>
          <p className="text-sm mb-4">
            Creez votre premier script pour commencer a ecrire.
          </p>
          <Button size="sm" onClick={() => setShowForm(true)}>
            Nouveau script
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {scripts.map((script) => (
            <Card
              key={script.id}
              className="p-4 hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() =>
                router.push(
                  `/project/${slug}/workshop/scripts/${script.id}`
                )
              }
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {script.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {script.blocks.length} blocs
                  </p>
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
                      <AlertDialogTitle>Supprimer ce script ?</AlertDialogTitle>
                      <AlertDialogDescription>Cette action est irreversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(script.id)}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(script.updatedAt).toLocaleDateString("fr-FR")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
