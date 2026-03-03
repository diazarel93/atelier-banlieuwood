"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAi } from "@/hooks/use-ai";

interface AiPanelProps {
  slug: string;
  characterId: string;
}

export function AiPanel({ slug, characterId }: AiPanelProps) {
  const ai = useAi();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const handleAction = async (action: string, userPrompt?: string) => {
    try {
      const res = await ai.mutateAsync({
        slug,
        action,
        characterId,
        prompt: userPrompt,
      });
      setResult(res);
    } catch {
      setResult("Erreur lors de la generation. Verifiez votre cle API.");
    }
  };

  return (
    <Card className="border-l-2 border-accent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Assistant IA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => handleAction("suggest-flaw")}
            disabled={ai.isPending}
          >
            Suggerer une faille
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => handleAction("generate-backstory")}
            disabled={ai.isPending}
          >
            Generer un passe
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => handleAction("speak", "Présente-toi en une phrase.")}
            disabled={ai.isPending}
          >
            Tester la voix
          </Button>
        </div>

        {/* Free prompt */}
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Parle a ce personnage..."
            rows={2}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              if (prompt.trim()) {
                handleAction("speak", prompt);
                setPrompt("");
              }
            }}
            disabled={ai.isPending || !prompt.trim()}
          >
            Envoyer
          </Button>
        </div>

        {/* Result */}
        {ai.isPending && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="led-working" />
            Generation en cours...
          </p>
        )}
        {result && (
          <ScrollArea className="h-48">
            <div className="bg-card/50 backdrop-blur-sm rounded-md p-3 text-sm whitespace-pre-wrap">
              {result}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
