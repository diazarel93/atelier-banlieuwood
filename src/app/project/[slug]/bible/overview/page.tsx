"use client";

import { useParams } from "next/navigation";
import { useOverview } from "@/hooks/use-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OverviewSection } from "@/lib/models/overview";
import React from "react";

/**
 * Renders markdown-like content into React elements.
 * Handles: **bold**, --- (horizontal rules), and line breaks.
 */
function renderMarkdown(content: string): React.ReactNode[] {
  const blocks = content.split("\n\n");

  return blocks.map((block, blockIndex) => {
    const trimmed = block.trim();

    // Horizontal rule
    if (trimmed === "---") {
      return <Separator key={blockIndex} className="my-4" />;
    }

    // Process inline formatting within each line of the block
    const lines = trimmed.split("\n");
    const lineElements = lines.map((line, lineIndex) => {
      const parts = parseInline(line);
      return (
        <React.Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {parts}
        </React.Fragment>
      );
    });

    return (
      <p key={blockIndex} className="mb-3 last:mb-0">
        {lineElements}
      </p>
    );
  });
}

/**
 * Parses inline markdown: **bold**
 */
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Bold text
    parts.push(
      <strong key={match.index} className="font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function SectionCard({ section }: { section: OverviewSection }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <span className="text-2xl">{section.icon}</span>
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground leading-relaxed">
          {renderMarkdown(section.content)}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: overview, isLoading } = useOverview(slug);

  if (isLoading) {
    return <p className="text-muted-foreground">Chargement...</p>;
  }

  if (!overview || overview.sections.length === 0) {
    return (
      <p className="text-muted-foreground">
        Aucune donnee de vue d&apos;ensemble disponible.
      </p>
    );
  }

  // First section (concept) gets full width, then the rest are in a grid
  const [hero, ...rest] = overview.sections;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Vue d&apos;ensemble</h2>

      {/* Hero section: Concept Central */}
      {hero && <SectionCard section={hero} />}

      {/* Remaining sections in a responsive grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rest.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
