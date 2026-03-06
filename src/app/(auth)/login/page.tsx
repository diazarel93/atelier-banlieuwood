"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // Forgot password flow
    if (forgotMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      setResetSent(true);
      setLoading(false);
      return;
    }

    if (isSignUp) {
      // Sign up
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
    } else {
      // Sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error("Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }
    }

    // Always ensure facilitator profile exists (covers sign-up AND sign-in)
    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || email.split("@")[0] }),
    });
    if (!res.ok) {
      toast.error("Erreur lors de la creation du profil");
      setLoading(false);
      return;
    }

    if (isSignUp) toast.success("Compte cree !");
    router.push("/dashboard");
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error("Connexion Google indisponible");
    }
  }

  // Reset sent confirmation
  if (resetSent) {
    return (
      <div className="min-h-dvh bg-studio flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="film-grain absolute inset-0 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm glass-card p-8 space-y-6 text-center relative z-10"
        >
          <div className="w-16 h-16 rounded-full bg-bw-teal/20 mx-auto flex items-center justify-center shadow-bw-glow-teal">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-bw-heading">Email envoye</h2>
          <p className="text-sm text-bw-muted">
            Un lien de reinitialisation a ete envoye a <strong className="text-bw-ink">{email}</strong>.
            Verifie ta boite mail (et les spams).
          </p>
          <Button
            variant="ghost"
            onClick={() => { setForgotMode(false); setResetSent(false); }}
            className="text-bw-muted hover:text-bw-ink"
          >
            Retour a la connexion
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-studio flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Film grain overlay */}
      <div className="film-grain absolute inset-0 pointer-events-none" />

      {/* Ambient glow decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-bw-primary/[0.05] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full bg-bw-teal/[0.03] blur-[80px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[280px] h-[280px] rounded-full bg-bw-gold/[0.03] blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        {/* Logo + tagline */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            className="flex justify-center"
          >
            <BrandLogo size="lg" color="cinema" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="w-16 h-0.5 mx-auto bg-gradient-to-r from-bw-primary to-bw-gold rounded-full"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-bw-muted"
          >
            {forgotMode
              ? "Reinitialiser le mot de passe"
              : isSignUp
                ? "Creer un compte facilitateur"
                : "Connexion facilitateur"}
          </motion.p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 space-y-5"
        >
          {/* Google / social login */}
          {!forgotMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleLogin}
                className="w-full h-12 rounded-xl bg-bw-elevated/50 border border-white/[0.08] text-bw-text hover:bg-bw-elevated hover:border-white/[0.15] transition-all duration-200 flex items-center justify-center gap-3 text-sm font-medium cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </motion.button>
            </motion.div>
          )}

          {/* Divider */}
          {!forgotMode && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs uppercase tracking-wider text-bw-muted font-medium">ou</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
          )}

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && !forgotMode && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Input
                    type="text"
                    placeholder="Ton nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className=""
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className=""
            />

            <AnimatePresence mode="wait">
              {!forgotMode && (
                <motion.div
                  key="password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className=""
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading}
                size="xl"
                className="w-full rounded-xl bg-gradient-to-r from-bw-primary to-bw-primary-500 hover:from-bw-primary-500 hover:to-bw-primary text-white font-semibold shadow-bw-glow-primary btn-glow transition-all duration-300 cursor-pointer"
              >
                {loading
                  ? "Chargement..."
                  : forgotMode
                    ? "Envoyer le lien"
                    : isSignUp
                      ? "Creer mon compte"
                      : "Se connecter"}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* Actions below card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-1"
        >
          {/* Forgot password link (only on login mode) */}
          {!isSignUp && !forgotMode && (
            <Button
              variant="ghost"
              onClick={() => setForgotMode(true)}
              className="w-full text-bw-muted hover:text-bw-ink hover:bg-white/[0.03] rounded-xl transition-colors cursor-pointer"
            >
              Mot de passe oublie ?
            </Button>
          )}

          {/* Back from forgot mode */}
          {forgotMode && (
            <Button
              variant="ghost"
              onClick={() => setForgotMode(false)}
              className="w-full text-bw-muted hover:text-bw-ink hover:bg-white/[0.03] rounded-xl transition-colors cursor-pointer"
            >
              Retour a la connexion
            </Button>
          )}

          {/* Toggle sign-up / sign-in */}
          {!forgotMode && (
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-bw-muted hover:text-bw-ink hover:bg-white/[0.03] rounded-xl transition-colors cursor-pointer"
            >
              {isSignUp
                ? "Deja un compte ? Se connecter"
                : "Pas encore de compte ? S'inscrire"}
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
