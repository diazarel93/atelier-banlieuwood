"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useRef, useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { ScriptEditor } from "@/components/workshop/script-editor";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useScript, useUpdateScript } from "@/hooks/use-workshop";
import { ArrowLeft } from "lucide-react";
import type { ScriptBlock } from "@/lib/models/workshop";

export default function ScriptEditorPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const { data: script, isLoading } = useScript(slug, id);
  const updateMutation = useUpdateScript(slug);

  const [localBlocks, setLocalBlocks] = useState<ScriptBlock[]>([]);
  const [initialized, setInitialized] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize local blocks from server data
  useEffect(() => {
    if (script && !initialized) {
      const blocks =
        script.blocks.length > 0
          ? script.blocks
          : [{ type: "scene-header" as const, id: nanoid(10), text: "" }];
      setLocalBlocks(blocks);
      setInitialized(true);
    }
  }, [script, initialized]);

  // Auto-save with debounce
  const handleChange = useCallback(
    (blocks: ScriptBlock[]) => {
      setLocalBlocks(blocks);

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        updateMutation.mutate({ id, data: { blocks } });
      }, 500);
    },
    [id, updateMutation]
  );

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!script) {
    return <p className="text-muted-foreground">Script introuvable</p>;
  }

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/project/${slug}/workshop/scripts`)
            }
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <h2 className="font-bold">{script.title}</h2>
          {updateMutation.isPending && (
            <span className="text-xs text-muted-foreground">
              Sauvegarde...
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {localBlocks.length} blocs
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <ScriptEditor
          slug={slug}
          scriptId={id}
          blocks={localBlocks}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
