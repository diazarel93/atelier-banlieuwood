"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ExportPage() {
  const { slug } = useParams<{ slug: string }>();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${slug}/war-room/export`);
      if (!res.ok) throw new Error("Export failed");
      const text = await res.text();

      // Download as file
      const blob = new Blob([text], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-export.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export telecharge");
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${slug}/war-room/export`);
      if (!res.ok) throw new Error("Export failed");
      const text = await res.text();
      setPreview(text);
      toast.success("Previsualisation generee");
    } catch {
      toast.error("Erreur lors de la generation de l'export");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (preview) {
      navigator.clipboard.writeText(preview);
      toast.success("Copie dans le presse-papier");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Export du Projet</h2>
        <p className="text-muted-foreground text-sm">
          Exportez l&apos;integralite de votre projet en Markdown
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-medium">Contenu de l&apos;export</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>- Bible complete (personnages, psychologie, voix)</li>
          <li>- Relations entre personnages</li>
          <li>- Structure des episodes</li>
          <li>- Scenes generees (format scenario)</li>
          <li>- Scripts (format bloc)</li>
          <li>- Table Reads (dialogues generes)</li>
        </ul>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={handleExport} disabled={loading}>
            {loading ? "Generation..." : "Telecharger .md"}
          </Button>
          <Button variant="outline" onClick={handlePreview} disabled={loading}>
            Previsualiser
          </Button>
          {preview && (
            <Button variant="outline" onClick={handleCopy}>
              Copier
            </Button>
          )}
        </div>
      </Card>

      {preview && (
        <Card className="p-6">
          <pre className="text-sm font-mono whitespace-pre-wrap max-h-[600px] overflow-y-auto">
            {preview}
          </pre>
        </Card>
      )}
    </div>
  );
}
