"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import {
  useCharacterAudit,
  useRelationshipAnalysis,
  useWorkshopStats,
  useCoherenceCheck,
} from "@/hooks/use-analysis";
import { toast } from "sonner";

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const colorClass =
    value >= 70
      ? "[&>div]:bg-green-500"
      : value >= 40
        ? "[&>div]:bg-yellow-500"
        : "[&>div]:bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} className={`h-2 ${colorClass}`} />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="p-4 text-center bg-card/60 backdrop-blur-sm border-t-2 border-primary/30">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}

export default function AnalysisPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: charData, isLoading: charLoading } = useCharacterAudit(slug);
  const { data: relData, isLoading: relLoading } =
    useRelationshipAnalysis(slug);
  const { data: wsData, isLoading: wsLoading } = useWorkshopStats(slug);
  const coherenceMutation = useCoherenceCheck(slug);
  const [coherence, setCoherence] = useState<{
    issues?: { type: string; severity: string; title: string; description: string; characters?: string[]; suggestion: string }[];
    strengths?: string[];
    summary?: string;
  } | null>(null);

  const handleCoherence = async () => {
    try {
      const result = await coherenceMutation.mutateAsync();
      setCoherence(result);
      toast.success("Analyse terminee");
    } catch {
      toast.error("Erreur lors de l'analyse IA");
    }
  };

  const allLoading = charLoading && relLoading && wsLoading;

  if (allLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Analyse du Projet</h2>
        <p className="text-muted-foreground text-sm">
          Vue d&apos;ensemble de la sante de votre scenario
        </p>
      </div>

      {/* ── Character Audit ──────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Audit des Personnages</h3>

        {charLoading ? (
          <PageSkeleton variant="grid" count={4} />
        ) : charData ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Personnages"
                value={charData.summary.totalCharacters}
              />
              <StatCard
                label="Score moyen"
                value={`${charData.summary.averageScore}%`}
              />
              <StatCard
                label="Complets (80%+)"
                value={charData.summary.fullyDefined}
              />
              <StatCard
                label="A travailler"
                value={charData.summary.needsWork}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {charData.audits.map(
                (audit: {
                  id: string;
                  name: string;
                  color: string;
                  role: string;
                  scores: {
                    identity: number;
                    psychology: number;
                    voice: number;
                    arc: number;
                    total: number;
                  };
                  missing: string[];
                }) => (
                  <Card key={audit.id} className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: audit.color }}
                      />
                      <span className="font-medium">{audit.name}</span>
                      {audit.role && (
                        <Badge variant="secondary" className="text-xs">
                          {audit.role}
                        </Badge>
                      )}
                      <span className="ml-auto text-sm font-bold">
                        {audit.scores.total}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <ScoreBar
                        label="Identite"
                        value={audit.scores.identity}
                      />
                      <ScoreBar
                        label="Psychologie"
                        value={audit.scores.psychology}
                      />
                      <ScoreBar label="Voix" value={audit.scores.voice} />
                      <ScoreBar
                        label="Arc narratif"
                        value={audit.scores.arc}
                      />
                    </div>
                    {audit.missing.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {audit.missing.slice(0, 4).map((m: string) => (
                          <Badge
                            key={m}
                            variant="outline"
                            className="text-[10px] text-destructive border-destructive/30"
                          >
                            {m}
                          </Badge>
                        ))}
                        {audit.missing.length > 4 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{audit.missing.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                )
              )}
            </div>
          </>
        ) : null}
      </section>

      {/* ── Relationship Health ───────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Sante du Reseau Relationnel</h3>

        {relLoading ? (
          <PageSkeleton variant="grid" count={4} />
        ) : relData ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Relations"
                value={relData.totalRelationships}
                sub={`sur ${relData.maxPossible} possibles`}
              />
              <StatCard label="Densite" value={`${relData.density}%`} />
              <StatCard
                label="Tension moyenne"
                value={`${relData.tension.average}/10`}
              />
              <StatCard
                label="Personnages isoles"
                value={relData.isolated.length}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Type distribution */}
              <Card className="p-4 space-y-3">
                <h4 className="text-sm font-medium">Types de relations</h4>
                <div className="space-y-2">
                  {Object.entries(
                    relData.typeDistribution as Record<string, number>
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{type}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                  {Object.keys(relData.typeDistribution).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucune relation
                    </p>
                  )}
                </div>
              </Card>

              {/* High tension pairs */}
              <Card className="p-4 space-y-3">
                <h4 className="text-sm font-medium">Points chauds</h4>
                {relData.tension.highTensionPairs.length > 0 ? (
                  <div className="space-y-2">
                    {relData.tension.highTensionPairs.map(
                      (
                        p: {
                          a: string;
                          b: string;
                          tension: number;
                          type: string;
                        },
                        i: number
                      ) => (
                        <div key={i} className="flex items-center gap-2 text-sm flex-wrap">
                          <span className="font-medium">
                            {p.a} vs {p.b}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            tension {p.tension}/10
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {p.type}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pas de tension extreme detectee
                  </p>
                )}
              </Card>

              {/* Most connected */}
              <Card className="p-4 space-y-3">
                <h4 className="text-sm font-medium">Plus connectes</h4>
                <div className="space-y-2">
                  {relData.mostConnected.map(
                    (c: {
                      id: string;
                      name: string;
                      color: string;
                      connections: number;
                    }) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <span>{c.name}</span>
                        <span className="ml-auto text-muted-foreground">
                          {c.connections} liens
                        </span>
                      </div>
                    )
                  )}
                </div>
              </Card>

              {/* Power imbalances */}
              <Card className="p-4 space-y-3">
                <h4 className="text-sm font-medium">
                  Desequilibres de pouvoir
                </h4>
                {relData.powerImbalances.length > 0 ? (
                  <div className="space-y-2">
                    {relData.powerImbalances.map(
                      (
                        p: {
                          dominant: string;
                          dominated: string;
                          power: number;
                          type: string;
                        },
                        i: number
                      ) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{p.dominant}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            domine{" "}
                          </span>
                          <span className="font-medium">{p.dominated}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            force {p.power}/10
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Relations equilibrees
                  </p>
                )}
              </Card>
            </div>

            {/* Isolated characters */}
            {relData.isolated.length > 0 && (
              <Card className="p-4 border-destructive/30">
                <h4 className="text-sm font-medium text-destructive mb-2">
                  Personnages isoles (aucune relation)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {relData.isolated.map(
                    (c: { id: string; name: string; color: string }) => (
                      <Badge key={c.id} variant="outline">
                        <span
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </Badge>
                    )
                  )}
                </div>
              </Card>
            )}
          </>
        ) : null}
      </section>

      {/* ── Workshop Stats ────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Activite du Workshop</h3>

        {wsLoading ? (
          <PageSkeleton variant="grid" count={5} />
        ) : wsData ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard
                label="Table Reads"
                value={wsData.counts.tableReads}
                sub={`${wsData.generatedContent.tableReadsWithText} generees`}
              />
              <StatCard
                label="Scenes"
                value={wsData.counts.scenes}
                sub={`${wsData.generatedContent.scenesWithText} generees`}
              />
              <StatCard
                label="Conflits"
                value={wsData.counts.conflicts}
                sub={`${wsData.generatedContent.conflictsWithPhases} analyses`}
              />
              <StatCard
                label="Scripts"
                value={wsData.counts.scripts}
              />
              <StatCard
                label="Blocs script"
                value={wsData.counts.totalBlocks}
              />
            </div>

            {/* Character activity */}
            <Card className="p-4 space-y-3">
              <h4 className="text-sm font-medium">
                Utilisation des personnages
              </h4>
              <div className="space-y-2">
                {wsData.characterActivity.map(
                  (c: {
                    id: string;
                    name: string;
                    color: string;
                    total: number;
                    tableReads: number;
                    scenes: number;
                    conflicts: number;
                  }) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="w-28 truncate">{c.name}</span>
                      <div className="flex-1 flex gap-2 flex-wrap">
                        {c.tableReads > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {c.tableReads} TR
                          </Badge>
                        )}
                        {c.scenes > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {c.scenes} scenes
                          </Badge>
                        )}
                        {c.conflicts > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {c.conflicts} conflits
                          </Badge>
                        )}
                        {c.total === 0 && (
                          <span className="text-xs text-muted-foreground">
                            Jamais utilise
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground">{c.total}</span>
                    </div>
                  )
                )}
              </div>
            </Card>
          </>
        ) : null}
      </section>

      {/* ── Story Coherence ───────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Coherence Narrative (IA)</h3>
          <Button
            onClick={handleCoherence}
            disabled={coherenceMutation.isPending}
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/25"
          >
            {coherenceMutation.isPending
              ? "Analyse en cours..."
              : coherence
                ? "Relancer l'analyse"
                : "Lancer l'analyse IA"}
          </Button>
        </div>

        {coherenceMutation.isError && (
          <p className="text-sm text-destructive">
            Erreur lors de l&apos;analyse
          </p>
        )}

        {coherence && (
          <div className="space-y-4">
            {coherence.summary && (
              <Card className="p-4">
                <p className="text-sm">{coherence.summary}</p>
              </Card>
            )}

            {coherence.strengths && coherence.strengths.length > 0 && (
              <Card className="p-4 border-green-500/30 border-l-2 border-l-green-500">
                <h4 className="text-sm font-medium text-green-600 mb-2">
                  Points forts
                </h4>
                <ul className="space-y-1">
                  {coherence.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-green-500 shrink-0">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {coherence.issues && coherence.issues.length > 0 && (
              <div className="space-y-3">
                {coherence.issues.map(
                  (
                    issue: {
                      type: string;
                      severity: string;
                      title: string;
                      description: string;
                      characters?: string[];
                      suggestion: string;
                    },
                    i: number
                  ) => (
                    <Card
                      key={i}
                      className={`p-4 ${
                        issue.severity === "high"
                          ? "border-destructive/30 border-l-2 border-l-destructive"
                          : issue.severity === "medium"
                            ? "border-yellow-500/30 border-l-2 border-l-yellow-500"
                            : "border-border border-l-2 border-l-accent"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge
                          variant={
                            issue.severity === "high"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {issue.type}
                        </Badge>
                        <span className="font-medium text-sm">
                          {issue.title}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {issue.description}
                      </p>
                      {issue.characters && issue.characters.length > 0 && (
                        <div className="flex gap-1 mb-2 flex-wrap">
                          {issue.characters.map((name: string) => (
                            <Badge
                              key={name}
                              variant="secondary"
                              className="text-xs"
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-primary">
                        Suggestion : {issue.suggestion}
                      </p>
                    </Card>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {!coherence && !coherenceMutation.isPending && (
          <Card className="p-8 text-center text-muted-foreground">
            <p className="text-sm">
              L&apos;IA analysera la coherence de votre projet : contradictions,
              lacunes, faiblesses et opportunites narratives.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
