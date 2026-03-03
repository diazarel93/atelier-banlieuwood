"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send } from "lucide-react";
import type { CreateMessage } from "@/lib/models/dashboard";

export function MessageComposer({
  open,
  onOpenChange,
  onSend,
  isPending,
  defaultStudentId,
  studentName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (data: CreateMessage) => void;
  isPending?: boolean;
  defaultStudentId?: string | null;
  studentName?: string;
}) {
  const [content, setContent] = useState("");
  const [toAll, setToAll] = useState(!defaultStudentId);

  const handleSend = () => {
    if (!content.trim()) return;
    onSend({
      content: content.trim(),
      targetStudentId: toAll ? null : defaultStudentId || null,
      chapterId: null,
      stepId: null,
    });
    setContent("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Envoyer un message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {defaultStudentId && (
            <div className="flex items-center justify-between">
              <Label className="text-sm">\u00c0 toute la classe</Label>
              <button
                type="button"
                role="switch"
                aria-checked={toAll}
                onClick={() => setToAll(!toAll)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${toAll ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toAll ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          )}
          {!toAll && studentName && (
            <p className="text-sm text-muted-foreground">
              Destinataire : <strong>{studentName}</strong>
            </p>
          )}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              toAll
                ? "Message \u00e0 toute la classe..."
                : `Message \u00e0 ${studentName || "l'\u00e9l\u00e8ve"}...`
            }
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={!content.trim() || isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Send className="h-4 w-4 mr-2" />
              {isPending ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
