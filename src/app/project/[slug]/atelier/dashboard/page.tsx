"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useClasses, useCreateClass, useDeleteClass } from "@/hooks/use-dashboard";
import { Plus, Users, ArrowRight, Copy, Check, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function ClassCard({
  cls,
  onClick,
  onDelete,
  isDeleting,
}: {
  cls: { id: string; name: string; joinCode: string; teacherName: string };
  onClick: () => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(cls.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      className="p-5 cursor-pointer hover:border-primary/50 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold group-hover:text-primary transition-colors">
            {cls.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {cls.teacherName}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"
                onClick={(e) => e.stopPropagation()}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette classe ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tous les \u00e9l\u00e8ves, sessions, messages et annotations seront supprim\u00e9s. Cette action est irr\u00e9versible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(cls.id);
                  }}
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground"
          >
            Ouvrir <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 text-xs font-mono bg-muted px-2 py-1 rounded-md hover:bg-muted/80 transition-colors"
        >
          <span className="font-bold tracking-widest">{cls.joinCode}</span>
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: classes, isLoading } = useClasses(slug);
  const createMutation = useCreateClass(slug);
  const deleteMutation = useDeleteClass(slug);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !teacherName.trim()) return;
    try {
      const cls = await createMutation.mutateAsync({
        name: name.trim(),
        teacherName: teacherName.trim(),
      });
      toast.success(`Classe "${cls.name}" cr\u00e9\u00e9e — Code : ${cls.joinCode}`);
      setShowForm(false);
      setName("");
      setTeacherName("");
      router.push(`/project/${slug}/atelier/dashboard/${cls.id}`);
    } catch {
      toast.error("Erreur lors de la cr\u00e9ation");
    }
  };

  const handleDeleteClass = (classId: string) => {
    deleteMutation.mutate(classId, {
      onSuccess: () => toast.success("Classe supprim\u00e9e"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/project/${slug}/atelier/histoire`)}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Prof</h2>
          <p className="text-muted-foreground text-sm">
            Pilotez l&apos;atelier de votre classe en temps r\u00e9el
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Annuler" : "Cr\u00e9er une classe"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4 border-primary/30">
          <h3 className="font-semibold">Nouvelle classe</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Nom de la classe</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="3eme B - Cinema"
              />
            </div>
            <div className="space-y-2">
              <Label>Votre nom</Label>
              <Input
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Mme Dupont"
              />
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={
              !name.trim() || !teacherName.trim() || createMutation.isPending
            }
          >
            {createMutation.isPending ? "Cr\u00e9ation..." : "Cr\u00e9er la classe"}
          </Button>
        </Card>
      )}

      {isLoading ? (
        <PageSkeleton variant="list" count={3} />
      ) : !classes?.length ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold mb-2">Aucune classe</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Cr\u00e9ez votre premi\u00e8re classe pour commencer \u00e0 suivre vos \u00e9l\u00e8ves dans
            l&apos;atelier.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Cr\u00e9er une classe
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              onClick={() =>
                router.push(`/project/${slug}/atelier/dashboard/${cls.id}`)
              }
              onDelete={handleDeleteClass}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
