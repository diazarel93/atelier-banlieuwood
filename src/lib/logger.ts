/**
 * Structured JSON logger for server-side use.
 * Outputs to stdout in JSON format.
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  route?: string;
  durationMs?: number;
  error?: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    process.stderr.write(output + "\n");
  } else {
    process.stdout.write(output + "\n");
  }
}

export const log = {
  info: (message: string, meta?: Record<string, unknown>) => emit("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => emit("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => emit("error", message, meta),
};
