"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthUser } from "@/hooks/use-auth-user";
import { ROUTES } from "@/lib/routes";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";
import { GlassCardV2 } from "@/components/v2/glass-card";
import { IconSettings, IconLogout } from "@/components/v2/icons";

const LEVEL_OPTIONS = [
  { value: "primaire", label: "Primaire" },
  { value: "college", label: "College" },
  { value: "lycee", label: "Lycee" },
] as const;

const LS_KEY_LEVEL = "bw-default-level";
const LS_KEY_CLASS = "bw-default-class";

export default function SettingsPage() {
  const router = useRouter();
  const { data: authUser, isLoading: authLoading } = useAuthUser();

  // ── Preferences (localStorage) ──
  const [defaultLevel, setDefaultLevel] = useState("college");
  const [defaultClass, setDefaultClass] = useState("");

  // ── Password change ──
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const storedLevel = localStorage.getItem(LS_KEY_LEVEL);
      if (storedLevel) setDefaultLevel(storedLevel);
      const storedClass = localStorage.getItem(LS_KEY_CLASS);
      if (storedClass) setDefaultClass(storedClass);
    } catch {
      // localStorage unavailable
    }
  }, []);

  function handleLevelChange(value: string) {
    setDefaultLevel(value);
    try {
      localStorage.setItem(LS_KEY_LEVEL, value);
    } catch {
      // silent
    }
    toast.success("Niveau par defaut mis a jour");
  }

  function handleClassChange(value: string) {
    setDefaultClass(value);
    try {
      localStorage.setItem(LS_KEY_CLASS, value);
    } catch {
      // silent
    }
  }

  function handleClassBlur() {
    if (defaultClass.trim()) {
      toast.success("Classe par defaut enregistree");
    }
  }

  async function handlePasswordChange() {
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setPasswordLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Mot de passe mis a jour");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Erreur lors de la mise a jour du mot de passe");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push(ROUTES.login);
    } catch {
      toast.error("Erreur lors de la deconnexion");
      setLogoutLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6">
        <BreadcrumbV2 items={[{ label: "Reglages" }]} />
        <div className="space-y-5 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-card shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6">
      <BreadcrumbV2 items={[{ label: "Reglages" }]} />

      <div className="flex items-center gap-3 mt-4 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bw-primary/10 text-bw-primary">
          <IconSettings size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-bw-heading">Reglages</h1>
          <p className="text-sm text-bw-muted">
            Gerez votre profil et vos preferences
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* ── Section 1: Profil ── */}
        <GlassCardV2 className="p-5">
          <h2 className="text-heading-xs text-bw-heading mb-4">Profil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-body-xs font-medium text-bw-muted mb-1">
                Nom
              </label>
              <div className="h-9 flex items-center rounded-lg border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)]/50 px-3 text-sm text-bw-heading">
                {authUser?.name || "Non renseigne"}
              </div>
            </div>
            <div>
              <label className="block text-body-xs font-medium text-bw-muted mb-1">
                Email
              </label>
              <div className="h-9 flex items-center rounded-lg border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)]/50 px-3 text-sm text-bw-muted">
                {authUser?.email || ""}
              </div>
            </div>
            <div>
              <label className="block text-body-xs font-medium text-bw-muted mb-1">
                Role
              </label>
              <div className="h-9 flex items-center rounded-lg border border-[var(--color-bw-border)] bg-[var(--color-bw-surface-dim)]/50 px-3 text-sm text-bw-muted capitalize">
                {authUser?.role || ""}
              </div>
            </div>
          </div>
        </GlassCardV2>

        {/* ── Section 2: Preferences ── */}
        <GlassCardV2 className="p-5">
          <h2 className="text-heading-xs text-bw-heading mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="default-level"
                className="block text-body-xs font-medium text-bw-muted mb-1"
              >
                Niveau par defaut
              </label>
              <select
                id="default-level"
                value={defaultLevel}
                onChange={(e) => handleLevelChange(e.target.value)}
                className="h-9 w-full max-w-xs rounded-lg border border-[var(--color-bw-border)] bg-card px-3 text-sm text-bw-heading focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
              >
                {LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="default-class"
                className="block text-body-xs font-medium text-bw-muted mb-1"
              >
                Classe par defaut
              </label>
              <input
                id="default-class"
                type="text"
                value={defaultClass}
                onChange={(e) => handleClassChange(e.target.value)}
                onBlur={handleClassBlur}
                placeholder="Ex: 4eB, CM2..."
                className="h-9 w-full max-w-xs rounded-lg border border-[var(--color-bw-border)] bg-card px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
              />
            </div>
          </div>
        </GlassCardV2>

        {/* ── Section 3: Securite ── */}
        <GlassCardV2 className="p-5">
          <h2 className="text-heading-xs text-bw-heading mb-4">Securite</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-body-xs font-medium text-bw-muted mb-1"
              >
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Au moins 6 caracteres"
                autoComplete="new-password"
                className="h-9 w-full max-w-xs rounded-lg border border-[var(--color-bw-border)] bg-card px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-body-xs font-medium text-bw-muted mb-1"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetez le mot de passe"
                autoComplete="new-password"
                className="h-9 w-full max-w-xs rounded-lg border border-[var(--color-bw-border)] bg-card px-3 text-sm text-bw-heading placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={passwordLoading || !newPassword || !confirmPassword}
              className="inline-flex items-center gap-1.5 rounded-xl bg-bw-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-bw-primary-500 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : null}
              Changer le mot de passe
            </button>
          </div>
        </GlassCardV2>

        {/* ── Section 4: Compte ── */}
        <GlassCardV2 className="p-5">
          <h2 className="text-heading-xs text-bw-heading mb-4">Compte</h2>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-bw-danger)]/30 bg-[var(--color-bw-danger)]/5 px-4 py-2 text-sm font-semibold text-[var(--color-bw-danger)] hover:bg-[var(--color-bw-danger)]/10 active:scale-[0.97] transition-all duration-150 disabled:opacity-50"
          >
            {logoutLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-[var(--color-bw-danger)]/30 border-t-[var(--color-bw-danger)] animate-spin" />
            ) : (
              <IconLogout size={16} />
            )}
            Se deconnecter
          </button>
        </GlassCardV2>
      </div>
    </div>
  );
}
