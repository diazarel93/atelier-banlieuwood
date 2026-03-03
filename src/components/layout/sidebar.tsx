"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Menu, Film, Sun, Moon } from "lucide-react";
import { toast } from "sonner";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      await createProject.mutateAsync({ title: newTitle.trim() });
      toast.success("Projet créé");
      setNewTitle("");
      setShowNew(false);
    } catch {
      toast.error("Erreur lors de la creation du projet");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15">
            <Film className="w-4 h-4 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Banlieu<span className="text-primary">wood</span>
          </span>
        </Link>
        <p className="text-caption mt-2 pl-[42px]">
          Copilote Scenario IA
        </p>
      </div>

      <Separator className="opacity-30" />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-caption">
            Projets
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowNew(!showNew)}
          >
            +
          </Button>
        </div>

        {showNew && (
          <div className="flex gap-1 mb-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Titre..."
              className="h-7 text-xs"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleCreate}
              disabled={createProject.isPending}
            >
              OK
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ) : !projects?.length ? (
          <div className="flex flex-col items-center text-center py-6 px-2">
            <Film className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Aucun projet</p>
            <p className="text-[10px] text-muted-foreground/70 mb-3">
              Creez votre premier projet pour commencer.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setShowNew(true)}
            >
              Creer un projet
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {projects.map((p) => {
              const isActive = pathname.startsWith(`/project/${p.slug}`);
              return (
                <Link
                  key={p.slug}
                  href={`/project/${p.slug}/bible/characters`}
                  onClick={onNavigate}
                  className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">{p.title}</span>
                  {p.genre && (
                    <span className="block text-xs opacity-70">{p.genre}</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <Separator className="opacity-30" />

      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sm gap-2"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )
          ) : (
            <Moon className="w-4 h-4" />
          )}
          {mounted ? (theme === "dark" ? "Mode clair" : "Mode sombre") : "Mode sombre"}
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 border-r border-border/30 bg-sidebar/80 backdrop-blur-xl h-screen shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}
