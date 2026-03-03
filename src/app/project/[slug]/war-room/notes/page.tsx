"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "@/hooks/use-war-room";
import { toast } from "sonner";
import type { ProductionNote } from "@/lib/models/war-room";

const COLUMNS: { key: ProductionNote["category"]; label: string }[] = [
  { key: "todo", label: "A faire" },
  { key: "in-progress", label: "En cours" },
  { key: "done", label: "Termine" },
  { key: "note", label: "Notes" },
];

const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-red-500/20 text-red-700 border-red-300",
  medium: "bg-yellow-500/20 text-yellow-700 border-yellow-300",
  low: "bg-green-500/20 text-green-700 border-green-300",
};

export default function NotesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: notes, isLoading } = useNotes(slug);
  const createMutation = useCreateNote(slug);
  const updateMutation = useUpdateNote(slug);
  const deleteMutation = useDeleteNote(slug);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ProductionNote["category"]>("todo");
  const [priority, setPriority] = useState<ProductionNote["priority"]>("medium");

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        content: content.trim() || undefined,
        category,
        priority,
      });
      toast.success("Note creee");
      setTitle("");
      setContent("");
      setShowForm(false);
    } catch {
      toast.error("Erreur lors de la creation");
    }
  };

  const handleMove = (
    noteId: string,
    newCategory: ProductionNote["category"]
  ) => {
    updateMutation.mutate(
      { id: noteId, data: { category: newCategory } },
      { onSuccess: () => toast.success("Note deplacee") }
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Note supprimee"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  const notesByCategory = (cat: ProductionNote["category"]) =>
    notes?.filter((n) => n.category === cat) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notes de Production</h2>
          <p className="text-muted-foreground text-sm">
            Tableau kanban pour suivre vos taches d&apos;ecriture
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Annuler" : "Nouvelle note"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la note..."
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Details..."
            rows={2}
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground self-center">
                Categorie :
              </span>
              {COLUMNS.map((col) => (
                <Button
                  key={col.key}
                  size="sm"
                  variant={category === col.key ? "default" : "outline"}
                  onClick={() => setCategory(col.key)}
                >
                  {col.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground self-center">
                Priorite :
              </span>
              {(["high", "medium", "low"] as const).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={priority === p ? "default" : "outline"}
                  onClick={() => setPriority(p)}
                >
                  {p === "high" ? "Haute" : p === "medium" ? "Moyenne" : "Basse"}
                </Button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || createMutation.isPending}
          >
            Creer
          </Button>
        </Card>
      )}

      {isLoading ? (
        <PageSkeleton variant="kanban" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">{col.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {notesByCategory(col.key).length}
                </Badge>
              </div>

              <div className="space-y-2 min-h-[200px] bg-card/30 backdrop-blur-sm rounded-xl border border-border/20 p-2">
                {notesByCategory(col.key).map((note) => (
                  <Card key={note.id} className="p-3 space-y-2 group">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium leading-tight">
                        {note.title}
                      </h4>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          >
                            x
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette note ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irreversible.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(note.id)}>Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {note.content && (
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {note.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${PRIORITY_BADGE[note.priority] || ""}`}
                      >
                        {note.priority === "high"
                          ? "Haute"
                          : note.priority === "medium"
                            ? "Moy."
                            : "Basse"}
                      </Badge>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {COLUMNS.filter((c) => c.key !== col.key).map(
                          (target) => (
                            <Button
                              key={target.key}
                              variant="ghost"
                              size="sm"
                              className="h-5 text-[10px] px-1"
                              onClick={() =>
                                handleMove(note.id, target.key)
                              }
                            >
                              {target.label}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
