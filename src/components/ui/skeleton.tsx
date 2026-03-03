"use client"

import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

/* ═══════════════════════════════════════════════════════════════
   SKELETON — shimmer animation base
   ═══════════════════════════════════════════════════════════════ */

interface SkeletonProps {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export function Skeleton({ className, style, children }: SkeletonProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shimmerKeyframes }} />
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-bw-elevated/50",
          className
        )}
        style={style}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)",
            backgroundSize: "200% 100%",
            animation: "bw-shimmer 1.8s ease-in-out infinite",
          }}
        />
        {children}
      </div>
    </>
  )
}

const shimmerKeyframes = `
@keyframes bw-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`

/* ═══════════════════════════════════════════════════════════════
   SKELETON CARD — card placeholder
   ═══════════════════════════════════════════════════════════════ */

interface SkeletonCardProps {
  className?: string
  /** Show action area at bottom */
  showActions?: boolean
}

export function SkeletonCard({ className, showActions = true }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "glass-card p-5 space-y-4",
        className
      )}
    >
      {/* Gradient header bar */}
      <Skeleton className="h-3 w-2/3 rounded-lg" />

      {/* Text lines */}
      <div className="space-y-2.5 pt-1">
        <Skeleton className="h-2.5 w-full rounded-md" />
        <Skeleton className="h-2.5 w-5/6 rounded-md" />
        <Skeleton className="h-2.5 w-4/6 rounded-md" />
      </div>

      {/* Action area */}
      {showActions && (
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON AVATAR — circular avatar placeholder
   ═══════════════════════════════════════════════════════════════ */

interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const avatarSizes: Record<string, string> = {
  sm: "size-8",   // 32px
  md: "size-10",  // 40px
  lg: "size-14",  // 56px
}

export function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
  return (
    <Skeleton
      className={cn("rounded-full shrink-0", avatarSizes[size], className)}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON TEXT — multiple text line placeholders
   ═══════════════════════════════════════════════════════════════ */

interface SkeletonTextProps {
  lines?: number
  /** Width of the last line as percentage */
  lastLineWidth?: number
  className?: string
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = 60,
  className,
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => {
        const isLast = i === lines - 1
        return (
          <Skeleton
            key={i}
            className="h-2.5 rounded-md"
            style={isLast ? { width: `${lastLineWidth}%` } : { width: "100%" }}
          />
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON DASHBOARD — full dashboard layout placeholder
   ═══════════════════════════════════════════════════════════════ */

interface SkeletonDashboardProps {
  className?: string
}

export function SkeletonDashboard({ className }: SkeletonDashboardProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-3 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <SkeletonAvatar size="md" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-3">
            <Skeleton className="h-2.5 w-16 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Card grid */}
      <SkeletonGrid count={6} columns={3} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON GRID — grid of skeleton cards
   ═══════════════════════════════════════════════════════════════ */

interface SkeletonGridProps {
  count?: number
  columns?: number
  className?: string
}

const columnClasses: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}

export function SkeletonGrid({
  count = 6,
  columns = 3,
  className,
}: SkeletonGridProps) {
  const colClass = columnClasses[columns] ?? columnClasses[3]

  return (
    <div className={cn("grid gap-4", colClass, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
