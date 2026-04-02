"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { motion } from "motion/react";
import { BrandLogo } from "@/components/brand-logo";

export default function PendingPage() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(ROUTES.login);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-[#0d0b09]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-[#141210] border border-[#2a2420] p-8 text-center space-y-6"
      >
        <div className="flex justify-center mb-2">
          <BrandLogo size="md" color="cinema" />
        </div>

        <div className="w-16 h-16 rounded-full bg-bw-gold/10 mx-auto flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-bw-gold)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Compte en attente de validation</h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Votre compte a bien été créé. Un administrateur Banlieuwood validera votre accès{" "}
            <strong className="text-white/70">sous 24h ouvrées</strong>.
          </p>
          <p className="text-sm text-white/40">Vous recevrez un email dès que votre compte sera activé.</p>
        </div>

        <div className="pt-2 space-y-3">
          <a
            href="mailto:contact@banlieuwood.fr"
            className="block text-sm font-medium transition-colors hover:underline"
            style={{ color: "var(--color-bw-primary)" }}
          >
            Contacter Banlieuwood
          </a>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full rounded-xl border-[#2a2420] text-white/60 hover:text-white hover:border-white/20"
          >
            Se déconnecter
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
