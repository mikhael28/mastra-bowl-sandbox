/**
 * Tiny pub/sub store for runtime errors surfaced from the Mastra streams,
 * tool calls, voice/transcribe routes, approval resumes, etc.
 *
 * Components log via `logError(...)` and subscribe via `subscribeErrors(fn)`
 * (or the `useErrorLog` hook) to render a running feed.
 */

export type ErrorSource =
  | 'stream'
  | 'tool'
  | 'approval'
  | 'workspace'
  | 'voice'
  | 'observability'
  | 'mastra'
  | 'client';

export type ErrorEntry = {
  id: string;
  ts: number;
  source: ErrorSource;
  message: string;
  detail?: string;
  agentId?: string;
  threadId?: string;
  runId?: string;
  toolName?: string;
};

const MAX_ENTRIES = 500;

let entries: ErrorEntry[] = [];
const listeners = new Set<(entries: ErrorEntry[]) => void>();

function notify() {
  for (const fn of listeners) fn(entries);
}

export function logError(input: Omit<ErrorEntry, 'id' | 'ts'>): ErrorEntry {
  const entry: ErrorEntry = {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ts: Date.now(),
    ...input,
  };
  entries = [entry, ...entries].slice(0, MAX_ENTRIES);
  notify();
  // Mirror to the dev console so traces stay greppable.
  // eslint-disable-next-line no-console
  console.warn(`[errorLog:${entry.source}]`, entry.message, entry.detail ?? '');
  return entry;
}

export function clearErrors() {
  entries = [];
  notify();
}

export function getErrors(): ErrorEntry[] {
  return entries;
}

export function subscribeErrors(fn: (entries: ErrorEntry[]) => void): () => void {
  listeners.add(fn);
  fn(entries);
  return () => {
    listeners.delete(fn);
  };
}

/** Best-effort message extraction for Error / string / unknown shapes. */
export function describeError(err: unknown): { message: string; detail?: string } {
  if (err instanceof Error) {
    return { message: err.message, detail: err.stack };
  }
  if (typeof err === 'string') return { message: err };
  if (err && typeof err === 'object') {
    const anyErr = err as any;
    const msg =
      anyErr.message ??
      anyErr.error ??
      anyErr.reason ??
      anyErr.toString?.() ??
      'unknown error';
    let detail: string | undefined;
    try {
      detail = JSON.stringify(err, null, 2);
    } catch {
      /* ignore */
    }
    return { message: String(msg), detail };
  }
  return { message: String(err) };
}
