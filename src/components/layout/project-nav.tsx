"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Bible", href: "bible/characters", segment: "bible" },
  { label: "Structure", href: "structure", segment: "structure" },
  { label: "Strategie", href: "strategy", segment: "strategy" },
  { label: "Workshop", href: "workshop", segment: "workshop" },
  { label: "Analyse", href: "analysis", segment: "analysis" },
  { label: "War Room", href: "war-room", segment: "war-room" },
  { label: "Atelier", href: "atelier/histoire", segment: "atelier" },
];

const BIBLE_TABS = [
  { label: "Vue d'ensemble", href: "overview" },
  { label: "Personnages", href: "characters" },
  { label: "Univers", href: "universe" },
  { label: "Relations", href: "relationships" },
];

const WORKSHOP_TABS = [
  { label: "Table Read", href: "table-read" },
  { label: "Scenes", href: "scenes" },
  { label: "Script", href: "scripts" },
  { label: "Conflits", href: "conflicts" },
];

const WAR_ROOM_TABS = [
  { label: "Episodes", href: "episodes" },
  { label: "Notes", href: "notes" },
  { label: "Export", href: "export" },
];

const ATELIER_TABS = [
  { label: "L'Histoire", href: "histoire" },
];

function SubNav({
  slug,
  prefix,
  tabs,
  pathname,
}: {
  slug: string;
  prefix: string;
  tabs: { label: string; href: string }[];
  pathname: string;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-2 bg-transparent border-t border-border/30 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const href = `/project/${slug}/${prefix}/${tab.href}`;
        const isActive = pathname.includes(`/${prefix}/${tab.href}`);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`text-sm pb-1 border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export function ProjectNav({ slug }: { slug: string }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-border/50">
      {/* Main nav */}
      <div className="flex items-center gap-1 px-4 pt-2 overflow-x-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const href = `/project/${slug}/${item.href}`;
          const isActive = pathname.includes(`/${item.segment}`);
          return (
            <Link
              key={item.segment}
              href={href}
              className={`relative px-3 py-2 text-sm rounded-t-md transition-colors whitespace-nowrap ${
                isActive
                  ? "text-primary font-semibold border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Sub-navs */}
      {pathname.includes("/bible") && (
        <SubNav slug={slug} prefix="bible" tabs={BIBLE_TABS} pathname={pathname} />
      )}
      {pathname.includes("/workshop") && (
        <SubNav slug={slug} prefix="workshop" tabs={WORKSHOP_TABS} pathname={pathname} />
      )}
      {pathname.includes("/war-room") && (
        <SubNav slug={slug} prefix="war-room" tabs={WAR_ROOM_TABS} pathname={pathname} />
      )}
      {pathname.includes("/atelier") && (
        <SubNav slug={slug} prefix="atelier" tabs={ATELIER_TABS} pathname={pathname} />
      )}
    </div>
  );
}
