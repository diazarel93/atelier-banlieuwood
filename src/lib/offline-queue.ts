const STORAGE_KEY = "bw-offline-queue";
const MAX_QUEUE_SIZE = 50;
const MAX_STALE_AGE_MS = 30 * 60 * 1000; // 30 minutes

export interface QueuedAction {
  id: string;
  type: "respond" | "vote";
  url: string;
  body: string; // JSON-stringified body
  timestamp: number;
}

export interface EnqueueResult {
  /** Whether an older action was dropped to make room */
  dropped: boolean;
  /** The dropped action, if any */
  droppedAction?: QueuedAction;
}

function readQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedAction[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedAction[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {}
}

export function enqueue(action: QueuedAction): EnqueueResult {
  const queue = readQueue();
  let dropped = false;
  let droppedAction: QueuedAction | undefined;

  if (queue.length >= MAX_QUEUE_SIZE) {
    droppedAction = queue.shift();
    dropped = true;
  }
  queue.push(action);
  writeQueue(queue);

  return { dropped, droppedAction };
}

export function dequeue(): QueuedAction | undefined {
  const queue = readQueue();
  const action = queue.shift();
  writeQueue(queue);
  return action;
}

export function peek(): QueuedAction[] {
  return readQueue();
}

export function count(): number {
  return readQueue().length;
}

/**
 * Returns the age (in ms) of the oldest action in the queue.
 * Returns 0 if the queue is empty.
 */
export function getQueueAge(): number {
  const queue = readQueue();
  if (queue.length === 0) return 0;
  return Date.now() - queue[0].timestamp;
}

/**
 * Purge actions older than maxAgeMs (default: 30 minutes).
 * Returns the number of purged actions.
 */
export function clearStale(maxAgeMs: number = MAX_STALE_AGE_MS): number {
  const queue = readQueue();
  const now = Date.now();
  const fresh = queue.filter((a) => now - a.timestamp < maxAgeMs);
  const purged = queue.length - fresh.length;
  if (purged > 0) {
    writeQueue(fresh);
  }
  return purged;
}

export async function flush(
  executor: (action: QueuedAction) => Promise<boolean>,
): Promise<{ sent: number; failed: number }> {
  const queue = readQueue();
  if (queue.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;
  const remaining: QueuedAction[] = [];

  for (const action of queue) {
    try {
      const ok = await executor(action);
      if (ok) {
        sent++;
      } else {
        remaining.push(action);
        failed++;
      }
    } catch {
      remaining.push(action);
      failed++;
    }
  }

  writeQueue(remaining);
  return { sent, failed };
}
