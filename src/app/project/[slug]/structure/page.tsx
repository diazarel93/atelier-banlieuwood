"use client";

import { useParams } from "next/navigation";
import { useUniverse } from "@/hooks/use-universe";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { TimelineEvent, WorldRule } from "@/lib/models/universe";

/* ------------------------------------------------------------------ */
/*  Helpers : group timeline entries by structural role                */
/* ------------------------------------------------------------------ */

const DIRECTION_PATTERNS = ["direction", "arc-", "basculement", "point-bascule"];
const MECANIQUE_PATTERNS = ["mecanique", "mise-en-concurrence", "manipulation"];
const PHASE_PATTERNS = ["phase-"];

function matches(id: string, patterns: string[]) {
  return patterns.some((p) => id.includes(p));
}

function groupTimeline(entries: TimelineEvent[]) {
  const direction: TimelineEvent[] = [];
  const mecanique: TimelineEvent[] = [];
  const phases: TimelineEvent[] = [];
  const evolution: TimelineEvent[] = [];

  for (const e of entries) {
    if (matches(e.id, DIRECTION_PATTERNS)) {
      direction.push(e);
    } else if (matches(e.id, MECANIQUE_PATTERNS)) {
      mecanique.push(e);
    } else if (matches(e.id, PHASE_PATTERNS)) {
      phases.push(e);
    } else {
      evolution.push(e);
    }
  }

  return { direction, mecanique, phases, evolution };
}

/* ------------------------------------------------------------------ */
/*  Reusable card for a timeline entry                                */
/* ------------------------------------------------------------------ */

function TimelineCard({ entry }: { entry: TimelineEvent }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{entry.title}</CardTitle>
        {entry.date && (
          <Badge variant="outline" className="w-fit text-[10px]">
            {entry.date}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {entry.description && (
          <CardDescription className="whitespace-pre-line">
            {entry.description}
          </CardDescription>
        )}
        {entry.characters.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {entry.characters.map((c) => (
              <Badge key={c} variant="secondary" className="text-[10px]">
                {c}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable card for a rule                                          */
/* ------------------------------------------------------------------ */

function RuleCard({ rule }: { rule: WorldRule }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{rule.title}</CardTitle>
        {rule.category && (
          <Badge variant="outline" className="w-fit text-[10px]">
            {rule.category}
          </Badge>
        )}
      </CardHeader>
      {rule.description && (
        <CardContent>
          <CardDescription className="whitespace-pre-line">
            {rule.description}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                   */
/* ------------------------------------------------------------------ */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-medium text-base">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default function StructurePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: universe, isLoading } = useUniverse(slug);

  if (isLoading) {
    return <p className="text-muted-foreground">Chargement...</p>;
  }

  if (!universe) {
    return <p className="text-muted-foreground">Aucune donnee disponible.</p>;
  }

  // Filter strategy entries out -- they belong on the Strategy page
  const structureTimeline = universe.timeline.filter(
    (e) =>
      !["strategie-autoproduction", "construction-communaute", "financement-hybride", "passerelle-sociale-educative", "ouverture-partenariat-structurant"].includes(e.id)
  );

  const { direction, mecanique, phases, evolution } = groupTimeline(structureTimeline);

  const mechaniqueRules = universe.rules.filter(
    (r) => r.category === "mecanique"
  );

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">Structure de la saison</h2>

      {/* Direction de saison */}
      {direction.length > 0 && (
        <Section
          title="Direction de saison"
          subtitle="Arcs narratifs, basculements et trajectoires des personnages"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {direction.map((e) => (
              <TimelineCard key={e.id} entry={e} />
            ))}
          </div>
        </Section>
      )}

      <Separator />

      {/* Mecanique des episodes */}
      {mecanique.length > 0 && (
        <Section
          title="Mecanique des episodes"
          subtitle="Tests, mise en concurrence et manipulation du cadre"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mecanique.map((e) => (
              <TimelineCard key={e.id} entry={e} />
            ))}
          </div>
        </Section>
      )}

      <Separator />

      {/* Phases de la saison */}
      {phases.length > 0 && (
        <Section
          title="Phases de la saison"
          subtitle="Progression narrative du debut a la fin de saison"
        >
          <div className="grid grid-cols-1 gap-3">
            {phases.map((e) => (
              <TimelineCard key={e.id} entry={e} />
            ))}
          </div>
        </Section>
      )}

      <Separator />

      {/* Evolution & Projection */}
      {evolution.length > 0 && (
        <Section
          title="Evolution & Projection"
          subtitle="Format, evolution du ton et projection multi-saisons"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evolution.map((e) => (
              <TimelineCard key={e.id} entry={e} />
            ))}
          </div>
        </Section>
      )}

      <Separator />

      {/* Mecaniques narratives (rules) */}
      {mechaniqueRules.length > 0 && (
        <Section
          title="Mecaniques narratives"
          subtitle="Regles structurelles de la mecanique de saison"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mechaniqueRules.map((r) => (
              <RuleCard key={r.id} rule={r} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
