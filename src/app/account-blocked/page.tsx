"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function AccountBlockedPage() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-bw-bg">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white border border-bw-border p-8 text-center space-y-6 shadow-sm"
      >
        <div className="w-16 h-16 rounded-full bg-red-50 mx-auto flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-bw-heading">Compte desactive</h1>
          <p className="text-sm text-bw-muted leading-relaxed">
            Votre acces a la plateforme Banlieuwood a ete desactive ou refuse.
            Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez-nous.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <a
            href="mailto:contact@banlieuwood.fr"
            className="block text-sm text-bw-primary hover:underline font-medium"
          >
            Contacter Banlieuwood
          </a>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full rounded-xl"
          >
            Se deconnecter
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
