/**
 * Consistent loading skeletons for V2 pages.
 * Three variants: dashboard, list, detail.
 * Pure JSX — no client hooks needed.
 *
 * Accessibility: aria-busy, role="status", screen reader announcements.
 * Motion: respects prefers-reduced-motion via motion-safe utility.
 */

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`motion-safe:animate-pulse rounded-xl bg-bw-surface-dim/60 ${className || ""}`}
      aria-hidden="true"
    />
  );
}

function KpiCardSkeleton() {
  return (
    <div className="rounded-2xl border border-bw-border bg-card p-5 space-y-3">
      <Shimmer className="h-3 w-20" />
      <Shimmer className="h-8 w-16" />
      <Shimmer className="h-2 w-32" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-bw-border/50">
      <Shimmer className="h-8 w-8 rounded-full flex-shrink-0" />
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-4 w-20 ml-auto" />
      <Shimmer className="h-4 w-16" />
      <Shimmer className="h-6 w-20 rounded-full" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-bw-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Shimmer className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-40" />
          <Shimmer className="h-3 w-24" />
        </div>
        <Shimmer className="h-6 w-20 rounded-full" />
      </div>
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-3/4" />
    </div>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Shimmer className="h-9 w-48 rounded-xl" />
      <Shimmer className="h-9 w-24 rounded-xl" />
      <Shimmer className="h-9 w-24 rounded-xl" />
      <div className="flex-1" />
      <Shimmer className="h-9 w-32 rounded-xl" />
    </div>
  );
}

function TabsSkeleton() {
  return (
    <div className="flex items-center gap-1 border-b border-bw-border pb-0">
      <Shimmer className="h-9 w-24 rounded-t-lg" />
      <Shimmer className="h-9 w-24 rounded-t-lg" />
      <Shimmer className="h-9 w-24 rounded-t-lg" />
    </div>
  );
}

/**
 * Wrapper that adds screen reader announcements to skeleton containers.
 */
function SkeletonWrapper({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

// ── Skeleton Variants ──

/** Dashboard skeleton: 3 KPI cards + 1 table */
export function DashboardSkeleton() {
  return (
    <SkeletonWrapper label="Chargement du tableau de bord...">
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
        <div className="rounded-2xl border border-bw-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-bw-border">
            <Shimmer className="h-5 w-40" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={`row-${i}`} />
          ))}
        </div>
      </div>
    </SkeletonWrapper>
  );
}

/** List skeleton: filter bar + 5 card placeholders */
export function ListSkeleton() {
  return (
    <SkeletonWrapper label="Chargement de la liste...">
      <div className="space-y-4 p-6">
        <FilterBarSkeleton />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={`card-${i}`} />
          ))}
        </div>
      </div>
    </SkeletonWrapper>
  );
}

/** Detail skeleton: header + tabs + content */
export function DetailSkeleton() {
  return (
    <SkeletonWrapper label="Chargement du detail...">
      <div className="space-y-6 p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Shimmer className="h-5 w-48" />
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
          <Shimmer className="h-4 w-64" />
        </div>
        <TabsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
        <div className="rounded-2xl border border-bw-border bg-card overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <TableRowSkeleton key={`detail-row-${i}`} />
          ))}
        </div>
      </div>
    </SkeletonWrapper>
  );
}

/** Generic page skeleton with configurable type */
export function PageSkeleton({ type = "dashboard" }: { type?: "dashboard" | "list" | "detail" }) {
  switch (type) {
    case "list":
      return <ListSkeleton />;
    case "detail":
      return <DetailSkeleton />;
    default:
      return <DashboardSkeleton />;
  }
}
