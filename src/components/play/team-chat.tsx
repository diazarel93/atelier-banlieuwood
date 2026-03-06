"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

// ═══════════════════════════════════════════════════════════════
// TEAM CHAT — Moderated in-game messaging
// ═══════════════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  content: string;
  message_type: string;
  created_at: string;
  student?: { id: string; display_name: string; avatar: string };
}

interface TeamChatProps {
  sessionId: string;
  teamId?: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
}

const STICKERS = ["👍", "❤️", "🔥", "😂", "🎬", "💡", "👏", "🎯"];

function TeamChatInner({ sessionId, teamId, studentId, studentName, studentAvatar }: TeamChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const fetchMessages = useCallback(async () => {
    const params = new URLSearchParams({ sessionId });
    if (teamId) params.set("teamId", teamId);
    try {
      const res = await fetch(`/api/team-chat?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > lastCountRef.current && !open) {
          setUnread((u) => u + (data.length - lastCountRef.current));
        }
        lastCountRef.current = data.length;
        setMessages(data);
      }
    } catch { /* ignore */ }
  }, [sessionId, teamId, open]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages.length]);

  const sendMessage = async (content: string, type = "text") => {
    if (!content.trim()) return;
    setInput("");
    setShowStickers(false);

    try {
      const res = await fetch("/api/team-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, teamId, studentId, content, messageType: type }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        lastCountRef.current += 1;
      }
    } catch { /* ignore */ }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center text-xl bg-bw-violet text-white shadow-lg cursor-pointer"
        style={{ boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        💬
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-bw-danger flex items-center justify-center text-xs font-bold text-white"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-36 right-4 z-40 w-72 bg-bw-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: "360px" }}
          >
            {/* Header */}
            <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">💬</span>
                <span className="text-sm font-bold text-bw-heading">
                  {teamId ? "Chat Equipe" : "Chat Session"}
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="text-bw-muted hover:text-bw-text cursor-pointer">
                ✕
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {messages.length === 0 && (
                <p className="text-xs text-bw-muted text-center py-8">
                  Pas encore de messages. Dis bonjour ! 👋
                </p>
              )}
              {messages.map((msg, i) => {
                const isOwn = msg.student?.id === studentId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i > messages.length - 5 ? 0 : 0 }}
                    className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    {!isOwn && (
                      <span className="text-sm flex-shrink-0 mt-1">{msg.student?.avatar}</span>
                    )}
                    <div
                      className={`max-w-[80%] px-3 py-1.5 rounded-xl text-sm ${
                        isOwn
                          ? "bg-bw-violet/20 text-bw-text"
                          : "bg-white/[0.06] text-bw-text"
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-semibold text-bw-muted mb-0.5">
                          {msg.student?.display_name}
                        </p>
                      )}
                      {msg.message_type === "sticker" ? (
                        <span className="text-2xl">{msg.content}</span>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Stickers */}
            <AnimatePresence>
              {showStickers && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-white/[0.06]"
                >
                  <div className="flex flex-wrap gap-1 p-2">
                    {STICKERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s, "sticker")}
                        className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-lg cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="px-3 py-2 border-t border-white/[0.06] flex items-center gap-2">
              <button
                onClick={() => setShowStickers(!showStickers)}
                className="text-sm cursor-pointer hover:scale-110 transition-transform"
              >
                😊
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 200))}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Message..."
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-bw-text placeholder:text-bw-placeholder focus:outline-none focus:border-bw-violet/40"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="text-sm font-bold text-bw-violet disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const TeamChat = memo(TeamChatInner);
