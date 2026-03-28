"use client";

import { Suspense, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { HeroStrip } from "@/components/v2/results/hero-strip";
import { TabBar, type ResultsTab } from "@/components/v2/results/tab-bar";
import { TabSynthese } from "@/components/v2/results/tab-synthese";
import { TabCompetences } from "@/components/v2/results/tab-competences";
import { TabOutilsIa } from "@/components/v2/results/tab-outils-ia";
import { TabLeFilm } from "@/components/v2/results/tab-le-film";
import { useResultsData } from "@/hooks/use-results-data";
import { useNotableResponses } from "@/hooks/use-notable-responses";

export default function ResultsPageV2() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-16 lg:pt-8 pb-8">
          <div className="h-64 rounded-2xl bg-card shimmer" />
        </div>
      }
    >
      <ResultsPageInner />
    </Suspense>
  );
}

function ResultsPageInner() {
  const params = useParams();
  const sessionId = params.id as string;
  const searchParams = useSearchParams();

  // Tab from URL or default
  const initialTab = (searchParams.get("tab") as ResultsTab) || "synthese";
  const [activeTab, setActiveTab] = useState<ResultsTab>(initialTab);

  const data = useResultsData(sessionId);
  const { data: notableResponses } = useNotableResponses(sessionId);

  // ── Loading ──
  if (data.isLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-16 lg:pt-8 pb-8">
        <BreadcrumbV2 items={[{ label: "Séances", href: "/v2/seances" }, { label: "..." }]} />
        <div className="mt-4 space-y-4">
          <div className="h-32 rounded-2xl bg-card shimmer" />
          <div className="h-10 rounded-xl bg-card shimmer w-80" />
          <div className="h-64 rounded-2xl bg-card shimmer" />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (data.isError || !data.exportData) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-16 lg:pt-8 pb-8">
        <BreadcrumbV2 items={[{ label: "Séances", href: "/v2/seances" }, { label: "Résultats" }]} />
        <GlassCardV2 className="p-8 text-center mt-4">
          <p className="text-bw-muted text-sm mb-4">Impossible de charger les résultats de cette séance.</p>
          <Link
            href="/v2/seances"
            className="rounded-lg border border-[var(--color-bw-border)] px-4 py-2 text-sm font-medium text-bw-heading hover:bg-[var(--color-bw-surface-dim)] transition-colors"
          >
            Retour aux séances
          </Link>
        </GlassCardV2>
      </div>
    );
  }

  // ── Tab change with URL sync ──
  function handleTabChange(tab: ResultsTab) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-16 lg:pt-8 pb-8">
      {/* Breadcrumb */}
      <BreadcrumbV2
        items={[
          { label: "Séances", href: "/v2/seances" },
          {
            label: data.exportData.session.title,
            href: `/v2/seances/${sessionId}`,
          },
          { label: "Résultats" },
        ]}
      />

      {/* Hero strip */}
      <div className="mt-4">
        <HeroStrip
          exportData={data.exportData}
          feedback={data.feedback}
          onCopy={data.handleCopyMarkdown}
          onCsv={data.handleExportCsv}
          onPdf={data.handlePrintPdf}
          onDownloadMd={data.handleDownloadMarkdown}
          onShare={data.handleShareSummary}
        />
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <TabBar active={activeTab} onChange={handleTabChange} />
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === "synthese" && (
          <TabSynthese
            sessionId={sessionId}
            exportData={data.exportData}
            budgetAverages={data.budgetData?.averages ?? null}
            pitchData={data.pitchData}
            posterData={data.posterData}
            template={data.sessionDetail?.template ?? null}
            showReplay={data.showReplay}
            setShowReplay={data.setShowReplay}
            replayData={data.replayData}
            bilan={data.bilan}
            onSwitchToIaTab={() => handleTabChange("outils-ia")}
            notableResponses={notableResponses ?? null}
            feedback={data.feedback}
          />
        )}

        {activeTab === "competences" && <TabCompetences feedback={data.feedback} />}

        {activeTab === "outils-ia" && (
          <TabOutilsIa
            bilan={data.bilan}
            bilanLoading={data.bilanLoading}
            bilanProvider={data.bilanProvider}
            generateBilan={data.generateBilan}
            fiche={data.fiche}
            ficheLoading={data.ficheLoading}
            ficheProvider={data.ficheProvider}
            generateFiche={data.generateFiche}
            bible={data.bible}
            bibleLoading={data.bibleLoading}
            bibleProvider={data.bibleProvider}
            generateBible={data.generateBible}
          />
        )}

        {activeTab === "le-film" && <TabLeFilm filmData={data.filmData} />}
      </div>
    </div>
  );
}
