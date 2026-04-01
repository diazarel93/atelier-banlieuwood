"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { BrandLogo } from "@/components/brand-logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setReady(true);
    });
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Mot de passe mis à jour !");
    router.push(ROUTES.dashboard);
  }

  if (!ready) {
    return (
      <div className="min-h-dvh bg-studio flex flex-col items-center justify-center px-4">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bw-primary/[0.05] blur-[100px]" />
        </div>
        <div className="relative z-10 w-full max-w-sm space-y-6 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-bw-primary border-t-transparent rounded-full mx-auto"
          />
          <p className="text-sm text-bw-muted">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-studio flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-bw-primary/[0.06] blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-bw-teal/[0.04] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="glass-card p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-gradient-to-br from-bw-primary to-bw-primary-500"
              style={{ boxShadow: "0 8px 24px rgba(255,107,53,0.25)" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </motion.div>
            <h1 className="bw-display text-2xl tracking-wider uppercase">
              <BrandLogo variant="cinema" />
            </h1>
            <div className="w-12 h-0.5 mx-auto bg-gradient-to-r from-bw-primary to-bw-gold rounded-full" />
            <p className="text-bw-muted text-sm">Nouveau mot de passe</p>
          </div>

          {/* Form */}
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-bw-muted font-medium">Nouveau mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 bg-bw-elevated/50 border-white/[0.08] focus:ring-2 focus:ring-bw-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-bw-muted font-medium">Confirmer le mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="h-12 bg-bw-elevated/50 border-white/[0.08] focus:ring-2 focus:ring-bw-primary/30"
              />
            </div>

            {/* Password match indicator */}
            {password && confirm && (
              <div className="flex items-center gap-2 text-xs">
                <div className={`led ${password === confirm ? "led-done" : "led-idle"}`} />
                <span className={password === confirm ? "text-bw-green" : "text-bw-muted"}>
                  {password === confirm ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
                </span>
              </div>
            )}

            <Button type="submit" disabled={loading || !password || password !== confirm} size="xl" className="w-full">
              {loading ? "Mise à jour..." : "Valider"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
