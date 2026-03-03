"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useCharacter,
  useUpdateCharacter,
  useDeleteCharacter,
} from "@/hooks/use-characters";
import { CharacterForm } from "@/components/bible/character-form";
import { AiPanel } from "@/components/bible/ai-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { PageSkeleton } from "@/components/ui/page-skeleton";
import {
  Pencil,
  Trash2,
  Sparkles,
  Target,
  Heart,
  ShieldAlert,
  Skull,
  Lock,
  MessageCircle,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import type { CreateCharacter, Character } from "@/lib/models/character";

// ── Role labels ──────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  protagoniste: "Protagoniste",
  antagoniste: "Antagoniste",
  secondaire: "Secondaire",
  figurant: "Figurant",
};

const ROLE_COLORS: Record<string, string> = {
  protagoniste:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  antagoniste:
    "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  secondaire:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  figurant:
    "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400",
};

// ── Psychology card config ───────────────────────────────────
const PSYCHOLOGY_ITEMS = [
  {
    key: "goal" as const,
    label: "Objectif",
    sublabel: "conscient",
    icon: Target,
    color: "text-blue-500",
  },
  {
    key: "need" as const,
    label: "Besoin",
    sublabel: "inconscient",
    icon: Heart,
    color: "text-rose-500",
  },
  {
    key: "flaw" as const,
    label: "Faille",
    sublabel: "",
    icon: ShieldAlert,
    color: "text-amber-500",
  },
  {
    key: "fear" as const,
    label: "Peur",
    sublabel: "fondamentale",
    icon: Skull,
    color: "text-purple-500",
  },
  {
    key: "secret" as const,
    label: "Secret",
    sublabel: "",
    icon: Lock,
    color: "text-emerald-500",
  },
];

// ── Notes parser ─────────────────────────────────────────────
interface NotesSection {
  title: string;
  content: string;
}

function parseNotes(notes: string): NotesSection[] {
  if (!notes) return [];

  const sections: NotesSection[] = [];
  // Split on lines that look like section headers (ALL CAPS followed by optional colon/newline)
  const lines = notes.split("\n");
  let currentTitle = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Detect section headers: lines that are mostly uppercase letters, spaces, accented chars, and optional trailing colon
    // Must be at least 3 chars and mostly uppercase
    const stripped = trimmed.replace(/[\s:()\/\-']/g, "");
    const isHeader =
      stripped.length >= 3 &&
      stripped === stripped.toUpperCase() &&
      /[A-ZÀ-Ü]/.test(stripped) &&
      !/^\d+\./.test(trimmed);

    if (isHeader && trimmed.length <= 100) {
      // Save previous section
      if (currentTitle || currentLines.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentLines.join("\n").trim(),
        });
      }
      currentTitle = trimmed.replace(/:$/, "").trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Push last section
  if (currentTitle || currentLines.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentLines.join("\n").trim(),
    });
  }

  return sections.filter((s) => s.content.length > 0 || s.title.length > 0);
}

// ── Render rich text with bold markers ───────────────────────
function renderNoteLine(line: string): React.ReactNode {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Process **bold** and inline emphasis
  const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
  const rendered = parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });

  // Handle list items starting with -
  if (/^-\s/.test(trimmed)) {
    const listParts = trimmed.replace(/^-\s/, "").split(/(\*\*[^*]+\*\*)/g);
    const listRendered = listParts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
    return (
      <li className="ml-4 text-sm text-muted-foreground leading-relaxed">
        {listRendered}
      </li>
    );
  }

  if (/^\d+\.\s/.test(trimmed)) {
    return (
      <li className="ml-4 text-sm text-muted-foreground leading-relaxed list-decimal">
        {rendered}
      </li>
    );
  }

  return (
    <p className="text-sm text-muted-foreground leading-relaxed">{rendered}</p>
  );
}

// ── Collapsible section for notes ────────────────────────────
function NoteSectionBlock({ section }: { section: NotesSection }) {
  const [open, setOpen] = useState(false);
  const lines = section.content.split("\n").filter((l) => l.trim());
  const preview = lines.slice(0, 3);
  const hasMore = lines.length > 3;

  return (
    <div className="space-y-2">
      {section.title && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors w-full text-left"
        >
          {hasMore ? (
            open ? (
              <ChevronDown className="size-4 shrink-0" />
            ) : (
              <ChevronRight className="size-4 shrink-0" />
            )
          ) : (
            <ChevronRight className="size-4 shrink-0 opacity-0" />
          )}
          {section.title}
        </button>
      )}

      <div className="ml-6 space-y-1">
        {(open || !hasMore ? lines : preview).map((line, i) => (
          <div key={i}>{renderNoteLine(line)}</div>
        ))}
        {!open && hasMore && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
          >
            ... {lines.length - 3} lignes de plus
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main page component ──────────────────────────────────────
export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const id = params.id as string;
  const { data: character, isLoading } = useCharacter(slug, id);
  const updateCharacter = useUpdateCharacter(slug);
  const deleteCharacter = useDeleteCharacter(slug);

  const [editOpen, setEditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const notesSections = useMemo(
    () => parseNotes(character?.notes || ""),
    [character?.notes]
  );

  const handleUpdate = async (data: CreateCharacter) => {
    try {
      await updateCharacter.mutateAsync({ id, data });
      toast.success("Personnage sauvegarde");
      setEditOpen(false);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCharacter.mutateAsync(id);
      toast.success("Personnage supprime");
      router.push(`/project/${slug}/bible/characters`);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Personnage introuvable.</p>
      </div>
    );
  }

  const psychology = character.psychology;
  const voice = character.voice;
  const traits = character.traits || [];
  const arc = character.arc || [];
  const hasVoice =
    voice?.vocabulary ||
    voice?.register ||
    (voice?.verbalTics && voice.verbalTics.length > 0) ||
    (voice?.examplePhrases && voice.examplePhrases.length > 0);
  const hasPsychology =
    psychology?.goal ||
    psychology?.need ||
    psychology?.flaw ||
    psychology?.fear ||
    psychology?.secret;

  return (
    <>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* ── Back button ──────────────────────────────────── */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/project/${slug}/bible/characters`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>

        {/* ── Header ──────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <div
                className="w-5 h-5 rounded-full mt-1.5 shrink-0"
                style={{
                  backgroundColor: character.color,
                  boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${character.color}`,
                }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {character.name}
                  </h1>
                  {character.role && (
                    <Badge
                      className={`text-xs font-medium ${
                        ROLE_COLORS[character.role] || ""
                      }`}
                      variant="secondary"
                    >
                      {ROLE_LABELS[character.role] || character.role}
                    </Badge>
                  )}
                  {character.age && (
                    <span className="text-sm text-muted-foreground">
                      {character.age}
                    </span>
                  )}
                </div>
                {character.occupation && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {character.occupation}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAiOpen(true)}
                className="gap-1.5"
              >
                <Sparkles className="size-4" />
                <span className="hidden sm:inline">IA</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="gap-1.5"
              >
                <Pencil className="size-4" />
                <span className="hidden sm:inline">Modifier</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive gap-1.5"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce personnage ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irreversible. Le personnage sera definitivement supprime.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Backstory */}
          {character.backstory && (
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {character.backstory}
              </p>
            </div>
          )}

          {/* Meta dates */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>
              Cree le{" "}
              {new Date(character.createdAt).toLocaleDateString("fr-FR")}
            </span>
            <span>
              Modifie le{" "}
              {new Date(character.updatedAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>

        <Separator />

        {/* ── Psychology ──────────────────────────────────── */}
        {hasPsychology && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="size-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Psychologie</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PSYCHOLOGY_ITEMS.map((item) => {
                const value = psychology?.[item.key];
                if (!value) return null;
                const Icon = item.icon;
                return (
                  <Card key={item.key} className="relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 w-1 h-full"
                      style={{ backgroundColor: character.color || "#6366f1" }}
                    />
                    <CardHeader className="pb-2 flex flex-row items-center gap-2 space-y-0">
                      <Icon className={`size-4 shrink-0 ${item.color}`} />
                      <CardTitle className="text-sm font-medium">
                        {item.label}
                        {item.sublabel && (
                          <span className="text-muted-foreground font-normal ml-1">
                            ({item.sublabel})
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Traits ──────────────────────────────────────── */}
        {traits.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Traits de personnalite</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {traits.map((trait, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{trait.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {trait.intensity}/10
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${trait.intensity * 10}%`,
                        backgroundColor: character.color || "#6366f1",
                        opacity: 0.6 + trait.intensity * 0.04,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Voice ───────────────────────────────────────── */}
        {hasVoice && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Voix</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vocabulary & register */}
              <div className="space-y-3">
                {voice?.vocabulary && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      Vocabulaire
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {voice.vocabulary}
                    </p>
                  </div>
                )}
                {voice?.register && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      Registre
                    </h3>
                    <p className="text-sm leading-relaxed">{voice.register}</p>
                  </div>
                )}
              </div>

              {/* Tics & phrases */}
              <div className="space-y-3">
                {voice?.verbalTics && voice.verbalTics.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      Tics verbaux
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {voice.verbalTics.map((tic, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="font-normal"
                        >
                          {tic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {voice?.examplePhrases && voice.examplePhrases.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      Phrases exemples
                    </h3>
                    <div className="space-y-2">
                      {voice.examplePhrases.map((phrase, i) => (
                        <blockquote
                          key={i}
                          className="border-l-2 pl-3 text-sm italic text-muted-foreground"
                          style={{
                            borderColor: character.color || "#6366f1",
                          }}
                        >
                          &laquo; {phrase} &raquo;
                        </blockquote>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Arc narratif ────────────────────────────────── */}
        {arc.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Arc narratif</h2>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-[15px] top-2 bottom-2 w-0.5 rounded-full"
                style={{
                  backgroundColor: character.color || "#6366f1",
                  opacity: 0.3,
                }}
              />

              <div className="space-y-6">
                {arc
                  .sort((a, b) => a.act - b.act)
                  .map((entry, i) => (
                    <div key={i} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div
                        className="w-[31px] shrink-0 flex justify-center pt-1"
                      >
                        <div
                          className="w-3 h-3 rounded-full ring-4 ring-background"
                          style={{
                            backgroundColor: character.color || "#6366f1",
                          }}
                        />
                      </div>

                      {/* Content */}
                      <Card className="flex-1">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-sm">
                              Acte {entry.act}
                            </CardTitle>
                            {entry.state && (
                              <Badge
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {entry.state}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {entry.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Notes ───────────────────────────────────────── */}
        {notesSections.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Notes</h2>

            <Card>
              <CardContent className="pt-6 space-y-6">
                {notesSections.map((section, i) => (
                  <div key={i}>
                    {i > 0 && <Separator className="mb-6" />}
                    <NoteSectionBlock section={section} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* If notes exist but couldn't be parsed into sections, show raw */}
        {character.notes && notesSections.length === 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Notes</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {character.notes}
                </p>
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {/* ── Edit Sheet ────────────────────────────────────── */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>Modifier {character.name}</SheetTitle>
            <SheetDescription>
              Modifiez les informations du personnage ci-dessous.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6">
            <CharacterForm
              initial={character}
              onSubmit={handleUpdate}
              isPending={updateCharacter.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* ── AI Sheet ──────────────────────────────────────── */}
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>Assistant IA</SheetTitle>
            <SheetDescription>
              Interrogez l&apos;IA a propos de {character.name}.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6">
            <AiPanel slug={slug} characterId={id} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
