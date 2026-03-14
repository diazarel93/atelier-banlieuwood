"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

type ConnectionState = "online" | "offline" | "reconnected";

export function ConnectionBanner() {
  const [state, setState] = useState<ConnectionState>("online");
  const [show, setShow] = useState(false);

  useEffect(() => {
    function handleOffline() {
      setState("offline");
      setShow(true);
    }
    function handleOnline() {
      setState("reconnected");
      setShow(true);
      // Auto-hide after 2.5s
      const t = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(t);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Check initial state
    if (!navigator.onLine) {
      setState("offline");
      setShow(true);
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const config = {
    offline: {
      bg: "rgba(239, 68, 68, 0.12)",
      border: "1px solid rgba(239, 68, 68, 0.25)",
      color: "#EF4444",
      icon: "📡",
      text: "Hors ligne — tes réponses seront envoyées au retour",
    },
    reconnected: {
      bg: "rgba(16, 185, 129, 0.12)",
      border: "1px solid rgba(16, 185, 129, 0.25)",
      color: "#10B981",
      icon: "✅",
      text: "Reconnecté !",
    },
    online: {
      bg: "transparent",
      border: "none",
      color: "transparent",
      icon: "",
      text: "",
    },
  };

  const c = config[state];

  return (
    <AnimatePresence>
      {show && state !== "online" && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-0 left-0 right-0 z-[45] flex justify-center px-4 pt-2 pointer-events-none"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md text-xs font-medium pointer-events-auto"
            style={{ background: c.bg, border: c.border, color: c.color }}
          >
            <span>{c.icon}</span>
            <span>{c.text}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
