"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { JoinForm } from "@/components/dashboard/join-form";
import { useJoinClass } from "@/hooks/use-dashboard";
import { ArrowLeft } from "lucide-react";

export default function JoinClassPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const joinMutation = useJoinClass(slug);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (data: {
    joinCode: string;
    displayName: string;
    avatar: string;
    level: string;
  }) => {
    setError(null);
    try {
      const result = await joinMutation.mutateAsync(data);
      router.push(`/project/${slug}/atelier/histoire/${result.sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de rejoindre la classe"
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/project/${slug}/atelier/histoire`)}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour
      </Button>
      <JoinForm
        onJoin={handleJoin}
        isPending={joinMutation.isPending}
        error={error}
      />
    </div>
  );
}
