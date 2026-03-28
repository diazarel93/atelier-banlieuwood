"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { motion } from "motion/react";

export default function PendingPage() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(ROUTES.login);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-bw-bg">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white border border-bw-border p-8 text-center space-y-6 shadow-sm"
      >
        <div className="w-16 h-16 rounded-full bg-amber-50 mx-auto flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-bw-heading">Compte en attente de validation</h1>
          <p className="text-sm text-bw-muted leading-relaxed">
            Votre compte a bien ete cree. Un administrateur Banlieuwood doit valider votre acces avant que vous puissiez
            utiliser la plateforme.
          </p>
          <p className="text-sm text-bw-muted">Vous recevrez un email des que votre compte sera active.</p>
        </div>

        <div className="pt-2 space-y-3">
          <a href="mailto:contact@banlieuwood.fr" className="block text-sm text-bw-primary hover:underline font-medium">
            Contacter Banlieuwood
          </a>
          <Button variant="outline" onClick={handleLogout} className="w-full rounded-xl">
            Se deconnecter
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
