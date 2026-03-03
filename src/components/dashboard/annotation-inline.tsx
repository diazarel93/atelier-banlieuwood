"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ANNOTATION_STYLES,
  type AnnotationType,
  type Annotation,
} from "@/lib/models/dashboard";
import { X, Send, Loader2 } from "lucide-react";

export function AnnotationInline({
  onSubmit,
  onCancel,
  isPending,
}: {
  onSubmit: (content: string, type: AnnotationType) => void;
  onCancel: () => void;
  isPending?: boolean;
}) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<AnnotationType>("encouragement");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim(), type);
  };

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <Select value={type} onValueChange={(v) => setType(v as AnnotationType)}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(
              Object.entries(ANNOTATION_STYLES) as [
                AnnotationType,
                (typeof ANNOTATION_STYLES)[AnnotationType],
              ][]
            ).map(([key, style]) => (
              <SelectItem key={key} value={key}>
                {style.icon} {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Votre annotation..."
        className="min-h-[60px] text-sm resize-none"
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isPending}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5 mr-1" />
          )}
          Annoter
        </Button>
      </div>
    </div>
  );
}

export function AnnotationBadge({ annotation }: { annotation: Annotation }) {
  const style = ANNOTATION_STYLES[annotation.type];
  return (
    <div className={`border rounded-lg p-2.5 text-sm ${style.bg}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span>{style.icon}</span>
        <Badge variant="outline" className="text-xs h-5">
          {style.label}
        </Badge>
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(annotation.createdAt).toLocaleString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="text-sm">{annotation.content}</p>
    </div>
  );
}
