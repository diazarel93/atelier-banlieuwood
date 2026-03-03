"use client";

import { useState, useCallback, useRef } from "react";

interface UseAiStreamReturn {
  text: string;
  isStreaming: boolean;
  error: string | null;
  stream: (url: string, body: Record<string, unknown>) => Promise<string>;
  abort: () => void;
  reset: () => void;
}

export function useAiStream(): UseAiStreamReturn {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setText("");
    setError(null);
    setIsStreaming(false);
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const stream = useCallback(
    async (url: string, body: Record<string, unknown>): Promise<string> => {
      abort();
      reset();
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      let accumulated = "";

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Stream failed" }));
          throw new Error(err.error || "Stream failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              if (data.done) break;
              if (data.text) {
                accumulated += data.text;
                setText(accumulated);
              }
            } catch {
              // skip invalid JSON lines
            }
          }
        }

        return accumulated;
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return accumulated;
        }
        const msg = err instanceof Error ? err.message : "Stream error";
        setError(msg);
        throw err;
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [abort, reset]
  );

  return { text, isStreaming, error, stream, abort, reset };
}
