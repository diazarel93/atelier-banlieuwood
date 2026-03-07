import type { Metadata } from "next";
import { CockpitLayoutV2 } from "@/components/v2/cockpit-layout";
import { createAdminClient } from "@/lib/supabase/admin";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const { data: session } = await admin
      .from("sessions")
      .select("title")
      .eq("id", id)
      .single();

    return {
      title: session?.title ? `Pilotage — ${session.title}` : "Pilotage",
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: "Pilotage", robots: { index: false, follow: false } };
  }
}

export default function PilotLayout({ children }: Props) {
  return <CockpitLayoutV2>{children}</CockpitLayoutV2>;
}
