"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbV2Props {
  items: BreadcrumbItem[];
}

/**
 * Shared breadcrumb for all V2 pages.
 *
 * Usage:
 *   <BreadcrumbV2 items={[
 *     { label: "Séances", href: "/v2/seances" },
 *     { label: session.title, href: `/v2/seances/${id}` },
 *     { label: "Préparation" },
 *   ]} />
 *
 * The last item (no href) is rendered as current page.
 */
export function BreadcrumbV2({ items }: BreadcrumbV2Props) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-bw-muted">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span>/</span>}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-bw-heading transition-colors truncate max-w-[180px]">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-bw-heading font-medium truncate max-w-[200px]" : ""}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
