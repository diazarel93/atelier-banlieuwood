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
  useTableReads,
  useCreateTableRead,
  useDeleteTableRead,
} from "@/hooks/use-workshop";
import { useCharacters } from "@/hooks/use-characters";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function TableReadListPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: sessions, isLoading } = useTableReads(slug);
  const { data: characters } = useCharacters(slug);
  const createMutation = useCreateTableRead(slug);
  const deleteMutation = useDeleteTableRead(slug);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [situation, setSituation] = useState("");

  const charMap = new Map(characters?.map((c) => [c.id, c]) || []);

  const handleCreate = async () => {
    if (!title.trim() || selectedIds.length < 2 || !situation.trim()) return;
    try {
      const session = await createMutation.mutateAsync({
        title: title.trim(),
        characterIds: selectedIds,
        situation: situation.trim(),
      });
      toast.success("Session creee");
      router.push(`/project/${slug}/workshop/table-read/${session.id}`);
    } catch {
      toast.error("Erreur lors de la creation");
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Session supprimee"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Table Read IA</h2>
          <p className="text-muted-foreground text-sm">
            Simulez des dialogues multi-personnages en temps reel
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Nouvelle session"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Titre de la session</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Confrontation au bar..."
            />
          </div>

          <div className="space-y-2">
            <Label>Personnages (2-5)</Label>
            <CharacterPicker
              slug={slug}
              selected={selectedIds}
              onChange={setSelectedIds}
              min={2}
              max={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Situation</Label>
            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Decrivez la situation initiale du dialogue..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={
              !title.trim() ||
              selectedIds.length < 2 ||
              !situation.trim() ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? "Creation..." : "Lancer la Table Read"}
          </Button>
        </Card>
      )}

      {isLoading ? (
        <PageSkeleton variant="grid" count={4} />
      ) : !sessions?.length ? (
        <Card className="p-12 text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-2">Aucune session de Table Read</p>
          <p className="text-sm mb-4">
            Creez votre premiere session pour simuler un dialogue
            multi-personnages.
          </p>
          <Button size="sm" onClick={() => setShowForm(true)}>
            Nouvelle session
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="p-4 hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() =>
                router.push(
                  `/project/${slug}/workshop/table-read/${session.id}`
                )
              }
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {session.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {session.situation}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {session.characterIds.map((cid) => {
                      const char = charMap.get(cid);
                      return char ? (
                        <Badge
                          key={cid}
                          variant="secondary"
                          className="text-xs"
                          style={{
                            borderColor: char.color,
                            borderWidth: 1,
                          }}
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
                      <AlertDialogTitle>Supprimer cette session ?</AlertDialogTitle>
                      <AlertDialogDescription>Cette action est irreversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(session.id)}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(session.createdAt).toLocaleDateString("fr-FR")}
                {session.rawText ? " — Dialogue genere" : ""}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
