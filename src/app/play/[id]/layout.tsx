import type { Metadata } from "next";
import { DarkLayout } from "@/components/dark-layout";
import { createAdminClient } from "@/lib/supabase/admin";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const { data: session } = await admin.from("sessions").select("title").eq("id", id).single();

    return {
      title: session?.title ? `${session.title} — Jouer` : "Partie en cours",
      description: "Rejoins la partie et participe à la création collective.",
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: "Partie en cours",
      description: "Rejoins la partie et participe à la création collective.",
      robots: { index: false, follow: false },
    };
  }
}

export default function PlayLayout({ children }: Props) {
  return <DarkLayout>{children}</DarkLayout>;
}
