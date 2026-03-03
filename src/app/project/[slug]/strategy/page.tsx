"use client";

import { useParams } from "next/navigation";
import { useUniverse } from "@/hooks/use-universe";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { TimelineEvent, WorldRule } from "@/lib/models/universe";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const STRATEGY_TIMELINE_IDS = [
  "strategie-autoproduction",
  "construction-communaute",
  "financement-hybride",
  "passerelle-sociale-educative",
  "ouverture-partenariat-structurant",
];

const STRATEGY_RULE_IDS = [
  "format-serie-court",
  "economie-production-maitrisee",
  "potentiel-plateforme",
  "securisation-editoriale",
  "projection-multi-saisons",
];

interface Phase {
  label: string;
  badge: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  timelineIds: string[];
}

const PHASES: Phase[] = [
  {
    label: "Autoproduction",
    badge: "Phase de lancement",
    variant: "outline",
    timelineIds: ["strategie-autoproduction"],
  },
  {
    label: "Communaute",
    badge: "Phase de croissance",
    variant: "secondary",
    timelineIds: ["construction-communaute"],
  },
  {
    label: "Financement",
    badge: "Phase de financement",
    variant: "secondary",
    timelineIds: ["financement-hybride"],
  },
  {
    label: "Social / Educatif",
    badge: "Phase de developpement",
    variant: "secondary",
    timelineIds: ["passerelle-sociale-educative"],
  },
  {
    label: "Industrialisation",
    badge: "Phase d'industrialisation",
    variant: "default",
    timelineIds: ["ouverture-partenariat-structurant"],
  },
];

/* ------------------------------------------------------------------ */
/*  Reusable components                                               */
/* ------------------------------------------------------------------ */

function StrategyCard({ entry }: { entry: TimelineEvent }) {
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
      {entry.description && (
        <CardContent>
          <CardDescription className="whitespace-pre-line">
            {entry.description}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  );
}

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
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default function StrategyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: universe, isLoading } = useUniverse(slug);

  if (isLoading) {
    return <p className="text-muted-foreground">Chargement...</p>;
  }

  if (!universe) {
    return <p className="text-muted-foreground">Aucune donnee disponible.</p>;
  }

  /* Build a lookup by id for fast access */
  const timelineById = new Map(universe.timeline.map((e) => [e.id, e]));
  const rulesById = new Map(universe.rules.map((r) => [r.id, r]));

  const strategyRules = STRATEGY_RULE_IDS
    .map((id) => rulesById.get(id))
    .filter(Boolean) as WorldRule[];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Strategie de production</h2>
        <p className="text-sm text-muted-foreground">
          Roadmap de developpement du projet, de l&apos;autoproduction a
          l&apos;industrialisation.
        </p>
      </div>

      {/* ---- Visual roadmap / pipeline ---- */}
      <div className="relative space-y-6">
        {/* Vertical connector line */}
        <div className="absolute left-5 top-4 bottom-4 w-px bg-muted-foreground/20 hidden sm:block" />

        {PHASES.map((phase, idx) => {
          const entries = phase.timelineIds
            .map((id) => timelineById.get(id))
            .filter(Boolean) as TimelineEvent[];

          if (entries.length === 0) return null;

          return (
            <div key={phase.label} className="relative sm:pl-14">
              {/* Step indicator */}
              <div className="hidden sm:flex absolute left-2.5 top-3 w-5 h-5 rounded-full bg-primary text-primary-foreground items-center justify-center text-[10px] font-bold">
                {idx + 1}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-base">{phase.label}</h3>
                  <Badge variant={phase.variant} className="text-[10px]">
                    {phase.badge}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {entries.map((entry) => (
                    <StrategyCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* ---- Strategy rules / levers ---- */}
      {strategyRules.length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className="font-medium text-base">Leviers strategiques</h3>
            <p className="text-sm text-muted-foreground">
              Format, economie de production, potentiel plateforme et
              securisation editoriale.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {strategyRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
