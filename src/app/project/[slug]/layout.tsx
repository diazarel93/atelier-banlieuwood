"use client";

import { useParams, usePathname } from "next/navigation";
import { ProjectNav } from "@/components/layout/project-nav";
import { PageTransition } from "@/components/ui/page-transition";
import { useProject } from "@/hooks/use-projects";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const slug = params.slug as string;
  const pathname = usePathname();
  const { data: project } = useProject(slug);

  return (
    <div className="flex flex-col h-full relative z-10">
      <div className="px-6 pt-4 pb-2 pl-14 md:pl-6">
        <h1 className="text-h1">
          {project?.title || "Chargement..."}
        </h1>
        {project?.logline && (
          <p className="text-sm text-muted-foreground">{project.logline}</p>
        )}
      </div>
      <ProjectNav slug={slug} />
      <div className="flex-1 overflow-auto p-6">
        <PageTransition key={pathname}>
          {children}
        </PageTransition>
      </div>
    </div>
  );
}
