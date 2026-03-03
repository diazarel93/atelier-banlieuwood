"use client";

import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [logline, setLogline] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    const project = await createProject.mutateAsync({
      title: title.trim(),
      genre,
      logline,
    });
    setTitle("");
    setGenre("");
    setLogline("");
    router.push(`/project/${project.slug}/bible/characters`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 relative z-10">
      <div className="relative">
        {/* Ambient glow behind title */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <h1 className="text-display relative z-10">
          Banlieu<span className="text-primary">wood</span>
        </h1>
        <p className="text-muted-foreground mt-1 relative z-10">
          Copilote d&apos;ecriture de scenario avec IA
        </p>
      </div>

      {/* Create project */}
      <GlassCard glow="orange" hover={false}>
        <CardHeader>
          <CardTitle>Nouveau projet</CardTitle>
          <CardDescription>
            Commencez un nouveau scenario en definissant les bases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Le titre de votre projet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Drame, Comedie, Thriller..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logline">Logline</Label>
            <Textarea
              id="logline"
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="Resumez votre histoire en 1-2 phrases..."
              rows={2}
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || createProject.isPending}
          >
            Creer le projet
          </Button>
        </CardContent>
      </GlassCard>

      {/* Recent projects */}
      {isLoading ? (
        <p className="text-muted-foreground">Chargement des projets...</p>
      ) : projects && projects.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Projets recents</h2>
          <div className="grid grid-cols-2 gap-4">
            {projects.map((p) => (
              <Card
                key={p.slug}
                className="cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                onClick={() =>
                  router.push(`/project/${p.slug}/bible/characters`)
                }
              >
                <CardHeader>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  {p.genre && <CardDescription>{p.genre}</CardDescription>}
                </CardHeader>
                {p.logline && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {p.logline}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
