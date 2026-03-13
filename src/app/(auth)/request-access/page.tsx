"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function RequestAccessPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/v2/admin/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        role: "client",
        type: "request",
        institution,
        message: `${name} — ${message}`,
      }),
    });

    if (!res.ok) {
      toast.error("Erreur lors de l'envoi de la demande");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-dvh bg-bw-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl bg-white border border-bw-border p-8 text-center space-y-6 shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-green-50 mx-auto flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-bw-heading">Demande envoyee</h2>
          <p className="text-sm text-bw-muted">
            Nous avons bien recu votre demande d&apos;acces. Un administrateur l&apos;examinera dans les plus brefs delais.
          </p>
          <Link href={ROUTES.login} className="text-sm text-bw-primary hover:underline font-medium">
            Retour a la connexion
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bw-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <BrandLogo size="lg" color="cinema" />
          </div>
          <p className="text-sm text-bw-muted">
            Demander un acces etablissement
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-bw-border p-6 space-y-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="req-name" className="block text-sm font-medium text-bw-heading mb-1">
                Nom complet
              </label>
              <Input
                id="req-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label htmlFor="req-email" className="block text-sm font-medium text-bw-heading mb-1">
                Email professionnel
              </label>
              <Input
                id="req-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="contact@etablissement.fr"
              />
            </div>

            <div>
              <label htmlFor="req-institution" className="block text-sm font-medium text-bw-heading mb-1">
                Etablissement
              </label>
              <Input
                id="req-institution"
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
                placeholder="College Victor Hugo"
              />
            </div>

            <div>
              <label htmlFor="req-message" className="block text-sm font-medium text-bw-heading mb-1">
                Message (optionnel)
              </label>
              <textarea
                id="req-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-bw-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bw-primary/20 resize-none"
                placeholder="Pourquoi souhaitez-vous utiliser Banlieuwood ?"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="xl"
              className="w-full rounded-xl bg-bw-primary hover:bg-bw-primary-500 text-white font-semibold cursor-pointer"
            >
              {loading ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link href={ROUTES.login} className="text-sm text-bw-muted hover:text-bw-heading">
            Deja un compte ? Se connecter
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
