const STORAGE_KEY = "bw-offline-queue";
const MAX_QUEUE_SIZE = 50;

export interface QueuedAction {
  id: string;
  type: "respond" | "vote";
  url: string;
  body: string; // JSON-stringified body
  timestamp: number;
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function enqueue(action: QueuedAction) {
  const queue = readQueue();
  if (queue.length >= MAX_QUEUE_SIZE) {
    // Drop oldest to stay within limit
    queue.shift();
  }
  queue.push(action);
  writeQueue(queue);
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

export async function flush(
  executor: (action: QueuedAction) => Promise<boolean>
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
