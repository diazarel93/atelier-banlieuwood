"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("🎬");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const AVATARS = ["🎬", "🎭", "🎤", "🎧", "🎪", "🎨", "🎸", "🎹", "🎺", "🎻", "🎵", "🎶", "🎙️", "📽️", "🎞️", "📸"];

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName, avatar }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Erreur lors de l'envoi");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAF8" }}>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add('light');document.documentElement.classList.remove('dark');`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl inline-block"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            🎬
          </motion.div>
          <h1 className="text-3xl font-black mt-4" style={{ color: "#1A1A2E" }}>
            Connexion Eleve
          </h1>
          <p className="text-sm mt-2" style={{ color: "#6B7280" }}>
            Connecte-toi pour sauvegarder ta progression, tes badges et ton portfolio.
          </p>
        </div>

        {sent ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 text-center border border-black/[0.06]"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
          >
            <span className="text-5xl">📧</span>
            <h2 className="text-xl font-bold mt-4" style={{ color: "#1A1A2E" }}>
              Lien magique envoye !
            </h2>
            <p className="text-sm mt-2" style={{ color: "#6B7280" }}>
              Verifie ta boite mail <strong>{email}</strong> et clique sur le lien pour te connecter.
            </p>
            <p className="text-xs mt-4" style={{ color: "#9CA3AF" }}>
              Pas recu ? Verifie les spams ou{" "}
              <button onClick={() => setSent(false)} className="underline cursor-pointer" style={{ color: "#FF6B35" }}>
                reessaie
              </button>
            </p>
          </motion.div>
        ) : (
          <div
            className="bg-white rounded-2xl p-6 border border-black/[0.06]"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
          >
            <form onSubmit={handleMagicLink} className="space-y-5">
              {/* Display Name */}
              <div>
                <label htmlFor="studio-displayName" className="text-sm font-semibold mb-1.5 block" style={{ color: "#1A1A2E" }}>
                  Ton prenom ou pseudo
                </label>
                <input
                  id="studio-displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Kylian, Amina, Le Boss..."
                  className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  style={{ color: "#1A1A2E", background: "#FAFAF8" }}
                />
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="text-sm font-semibold mb-1.5 block" style={{ color: "#1A1A2E" }}>
                  Choisis ton avatar
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVATARS.map((a) => (
                    <motion.button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      whileTap={{ scale: 0.85 }}
                      aria-label={`Choisir l'avatar ${a}`}
                      aria-pressed={avatar === a}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg cursor-pointer transition-all ${
                        avatar === a
                          ? "bg-orange-100 border-2 border-orange-400 scale-110"
                          : "bg-gray-50 border border-black/[0.06] hover:border-black/[0.15]"
                      }`}
                    >
                      {a}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="studio-email" className="text-sm font-semibold mb-1.5 block" style={{ color: "#1A1A2E" }}>
                  Ton email
                </label>
                <input
                  id="studio-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton.email@ecole.fr"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  style={{ color: "#1A1A2E", background: "#FAFAF8" }}
                />
                <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                  On t&apos;envoie un lien magique — pas de mot de passe a retenir !
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500 font-medium" role="alert" aria-live="assertive">{error}</p>
              )}

              <button
                type="submit"
                disabled={sending || !email}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ background: "#FF6B35", boxShadow: "0 4px 12px rgba(255,107,53,0.25)" }}
              >
                {sending ? "Envoi en cours..." : "Recevoir mon lien magique ✨"}
              </button>
            </form>
          </div>
        )}

        <div className="text-center mt-6 space-y-2">
          <Link href="/join" className="text-sm font-semibold block" style={{ color: "#FF6B35" }}>
            Rejoindre une session sans compte →
          </Link>
          <Link href="/" className="text-xs block" style={{ color: "#9CA3AF" }}>
            Retour a l&apos;accueil
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
