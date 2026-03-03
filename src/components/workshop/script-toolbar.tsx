"use client";

import { Button } from "@/components/ui/button";

interface ScriptToolbarProps {
  slug: string;
  scriptId: string;
  selectedText: string;
  onResult: (text: string) => void;
  onClose: () => void;
}

export function ScriptToolbar({
  slug,
  scriptId,
  selectedText,
  onResult,
  onClose,
}: ScriptToolbarProps) {
  const handleAction = async (
    action: string,
    characterName?: string
  ) => {
    try {
      const res = await fetch(
        `/api/projects/${slug}/workshop/scripts/${scriptId}/ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            text: selectedText,
            characterName,
          }),
        }
      );

      if (!res.ok) return;

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) break;
            if (data.text) accumulated += data.text;
          } catch {
            // skip
          }
        }
      }

      if (accumulated) {
        onResult(accumulated);
      }
    } catch {
      // fail silently
    }
  };

  if (!selectedText) return null;

  return (
    <div className="flex items-center gap-1 p-2 bg-background border rounded-lg shadow-lg">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleAction("reformulate")}
      >
        Reformuler
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleAction("suggest-next")}
      >
        Suggerer suite
      </Button>
      <Button size="sm" variant="ghost" onClick={onClose}>
        Fermer
      </Button>
    </div>
  );
}
