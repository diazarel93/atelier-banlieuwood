"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { motion } from "motion/react";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export default function AccountBlockedPage() {
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

        <div className="w-16 h-16 rounded-full bg-red-500/10 mx-auto flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Compte désactivé</h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Votre accès à la plateforme Banlieuwood a été désactivé. Cela peut être dû à une inactivité prolongée ou une
            demande manuelle.
          </p>
          <p className="text-sm text-white/40">
            Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez-nous.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <a
            href="mailto:contact@banlieuwood.fr"
            className="block text-sm font-medium transition-colors hover:underline"
            style={{ color: "#FF6B35" }}
          >
            Contacter Banlieuwood
          </a>
          <Link href="/request-access" className="block text-sm text-white/40 hover:text-white/70 transition-colors">
            Refaire une demande d&apos;accès →
          </Link>
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
