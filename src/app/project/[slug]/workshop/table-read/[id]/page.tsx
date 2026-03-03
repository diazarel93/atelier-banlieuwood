"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { TableReadDisplay } from "@/components/workshop/table-read-display";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useTableRead, useUpdateTableRead } from "@/hooks/use-workshop";
import { useCharacters } from "@/hooks/use-characters";
import { useAiStream } from "@/hooks/use-ai-stream";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function TableReadDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { data: session, isLoading } = useTableRead(slug, id);
  const { data: characters } = useCharacters(slug);
  const updateMutation = useUpdateTableRead(slug);
  const { text, isStreaming, error, stream, abort } = useAiStream();

  const [redirection, setRedirection] = useState("");
  const [showRedirect, setShowRedirect] = useState(false);

  const sessionChars =
    characters?.filter((c) => session?.characterIds.includes(c.id)) || [];

  const displayText = text || session?.rawText || "";

  const handleGenerate = useCallback(async () => {
    if (!session) return;
    const result = await stream(
      `/api/projects/${slug}/workshop/table-reads/generate`,
      {
        characterIds: session.characterIds,
        situation: session.situation,
      }
    );
    if (result) {
      updateMutation.mutate({ id, data: { rawText: result } });
      toast.success("Dialogue genere");
    }
  }, [session, slug, id, stream, updateMutation]);

  const handleContinue = useCallback(async () => {
    if (!session) return;
    const previous = displayText;
    const result = await stream(
      `/api/projects/${slug}/workshop/table-reads/continue`,
      {
        characterIds: session.characterIds,
        situation: session.situation,
        previousText: previous,
        redirection: redirection.trim() || undefined,
      }
    );
    if (result) {
      const fullText = previous + "\n\n" + result;
      updateMutation.mutate({ id, data: { rawText: fullText } });
      if (redirection.trim()) {
        updateMutation.mutate({
          id,
          data: {
            redirections: [
              ...(session.redirections || []),
              redirection.trim(),
            ],
          },
        });
      }
      toast.success("Suite generee");
    }
    setRedirection("");
    setShowRedirect(false);
  }, [session, slug, id, displayText, redirection, stream, updateMutation]);

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!session) {
    return <p className="text-muted-foreground">Session introuvable</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/project/${slug}/workshop/table-read`)
            }
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <h2 className="text-xl font-bold mt-1">{session.title}</h2>
          <p className="text-sm text-muted-foreground">{session.situation}</p>
        </div>
      </div>

      <TableReadDisplay
        text={displayText}
        characters={sessionChars}
        isStreaming={isStreaming}
      />

      {error && (
        <p className="text-sm text-destructive">Erreur : {error}</p>
      )}

      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {!displayText && !isStreaming && (
            <Button onClick={handleGenerate}>Generer le dialogue</Button>
          )}

          {displayText && !isStreaming && (
            <>
              <Button onClick={handleContinue} variant="default">
                Continuer
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRedirect(!showRedirect)}
              >
                Rediriger
              </Button>
              <Button variant="outline" onClick={handleGenerate}>
                Regenerer
              </Button>
            </>
          )}

          {isStreaming && (
            <Button variant="destructive" onClick={abort}>
              Arreter
            </Button>
          )}
        </div>

        {showRedirect && (
          <div className="space-y-2">
            <Textarea
              value={redirection}
              onChange={(e) => setRedirection(e.target.value)}
              placeholder="Nouvelle direction pour le dialogue... (ex: Tony entre soudainement dans la piece)"
              rows={2}
            />
            <Button
              size="sm"
              onClick={handleContinue}
              disabled={!redirection.trim()}
            >
              Appliquer la redirection
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
