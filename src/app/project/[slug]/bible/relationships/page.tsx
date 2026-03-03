"use client";

import { useParams } from "next/navigation";
import { useCharacters } from "@/hooks/use-characters";
import {
  useRelationships,
  useCreateRelationship,
  useDeleteRelationship,
} from "@/hooks/use-relationships";
import { RelationshipGraph } from "@/components/bible/relationship-graph";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { useState } from "react";
import { toast } from "sonner";

const REL_TYPES = [
  { value: "allié", label: "Allie", color: "bg-green-500" },
  { value: "rival", label: "Rival", color: "bg-red-500" },
  { value: "amour", label: "Amour", color: "bg-pink-500" },
  { value: "famille", label: "Famille", color: "bg-yellow-500" },
  { value: "mentor", label: "Mentor", color: "bg-purple-500" },
  { value: "neutre", label: "Neutre", color: "bg-gray-500" },
];

export default function RelationshipsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: characters } = useCharacters(slug);
  const { data: relationships } = useRelationships(slug);
  const createRelationship = useCreateRelationship(slug);
  const deleteRelationship = useDeleteRelationship(slug);

  const [charA, setCharA] = useState("");
  const [charB, setCharB] = useState("");
  const [type, setType] = useState("neutre");
  const [label, setLabel] = useState("");

  const handleAdd = async () => {
    if (!charA || !charB || charA === charB) return;
    try {
      await createRelationship.mutateAsync({
        characterA: charA,
        characterB: charB,
        type,
        label,
      });
      toast.success("Relation ajoutee");
      setCharA("");
      setCharB("");
      setType("neutre");
      setLabel("");
    } catch {
      toast.error("Erreur lors de l'ajout de la relation");
    }
  };

  const handleDelete = (id: string) => {
    deleteRelationship.mutate(id, {
      onSuccess: () => toast.success("Relation supprimee"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  };

  const getCharName = (id: string) =>
    characters?.find((c) => c.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Relations</h2>

      {/* Graph */}
      <RelationshipGraph
        characters={characters || []}
        relationships={relationships || []}
      />

      <Separator />

      {/* Add relationship */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Personnage A</Label>
              <Select value={charA} onValueChange={setCharA}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {characters?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Personnage B</Label>
              <Select value={charB} onValueChange={setCharB}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {characters?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Description..."
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={
              !charA || !charB || charA === charB || createRelationship.isPending
            }
          >
            Ajouter la relation
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-2">
        {relationships?.map((rel) => {
          const typeInfo = REL_TYPES.find((t) => t.value === rel.type);
          return (
            <Card key={rel.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline">
                    {getCharName(rel.characterA)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    --{" "}
                    <span className={typeInfo ? "font-medium" : ""}>
                      {rel.label || rel.type}
                    </span>{" "}
                    --
                  </span>
                  <Badge variant="outline">
                    {getCharName(rel.characterB)}
                  </Badge>
                  {rel.tension > 5 && (
                    <Badge variant="destructive" className="text-[10px]">
                      Tension {rel.tension}/10
                    </Badge>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive"
                    >
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer cette relation ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irreversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(rel.id)}>
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
