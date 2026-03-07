"use client";

import { useState, type FormEvent } from "react";

const REQUEST_TYPES = [
  { value: "general", label: "Question generale" },
  { value: "institution", label: "Institution / Ecole" },
  { value: "partenariat", label: "Partenariat" },
  { value: "presse", label: "Presse / Media" },
];

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrors([]);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: (data.get("name") as string) ?? "",
      email: (data.get("email") as string) ?? "",
      type: (data.get("type") as string) ?? "",
      message: (data.get("message") as string) ?? "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrors(json.errors ?? ["Une erreur est survenue."]);
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setErrors(["Impossible de contacter le serveur. Reessayez plus tard."]);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-bw-surface border border-bw-border rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-bw-green/10 flex items-center justify-center mx-auto mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-bw-green)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-bw-heading mb-2">
          Message envoye
        </h3>
        <p className="text-sm text-bw-muted">
          Nous vous repondons sous 48h. Merci pour votre interet.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-bw-primary hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bw-surface border border-bw-border rounded-2xl p-6 sm:p-8 space-y-5"
    >
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-bw-danger-100 border border-bw-danger/20 rounded-xl p-4">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-bw-danger">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-bw-heading mb-1.5"
        >
          Nom complet
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          placeholder="Votre nom"
          className="w-full h-11 px-4 rounded-xl border border-bw-border bg-bw-bg text-bw-text text-sm placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-bw-heading mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="vous@exemple.fr"
          className="w-full h-11 px-4 rounded-xl border border-bw-border bg-bw-bg text-bw-text text-sm placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors"
        />
      </div>

      {/* Type */}
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-bw-heading mb-1.5"
        >
          Type de demande
        </label>
        <select
          id="type"
          name="type"
          required
          defaultValue=""
          className="w-full h-11 px-4 rounded-xl border border-bw-border bg-bw-bg text-bw-text text-sm focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors appearance-none"
        >
          <option value="" disabled>
            Choisir...
          </option>
          {REQUEST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-bw-heading mb-1.5"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={5}
          placeholder="Votre message..."
          className="w-full px-4 py-3 rounded-xl border border-bw-border bg-bw-bg text-bw-text text-sm placeholder:text-bw-placeholder focus:outline-none focus:ring-2 focus:ring-bw-primary/30 focus:border-bw-primary transition-colors resize-y"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="h-11 px-8 rounded-xl bg-bw-primary text-white text-sm font-semibold hover:bg-bw-primary-500 transition-colors duration-200 shadow-bw-glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Envoi en cours..." : "Envoyer"}
      </button>
    </form>
  );
}
