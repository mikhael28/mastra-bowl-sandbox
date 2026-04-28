import { PrimitiveId } from '../../lib/education';

export type ToolCallState = {
  toolCallId: string;
  toolName: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
  status: 'calling' | 'awaiting-approval' | 'declined' | 'done' | 'error';
};

export type ToolCardProps = {
  tc: ToolCallState;
  onTeach: (id: PrimitiveId) => void;
  onApprove: () => void;
  onDecline: () => void;
  canRespond: boolean;
  agentId: string;
  onOpenFile?: (path: string) => void;
};

export function statusColor(status: ToolCallState['status']): string {
  if (status === 'error')
    return 'bg-rose-500/15 border-rose-500/30';
  if (status === 'awaiting-approval')
    return 'bg-sky-500/10 border-sky-500/40';
  if (status === 'declined')
    return 'bg-slate-700/30 border-slate-600/50';
  if (status === 'calling') return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-emerald-500/10 border-emerald-500/30';
}

export function statusText(status: ToolCallState['status']): string {
  if (status === 'awaiting-approval') return 'awaiting approval';
  if (status === 'declined') return 'declined';
  if (status === 'calling') return '…';
  if (status === 'error') return 'errored';
  return 'done';
}

export function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2) ?? String(v);
  } catch {
    return String(v);
  }
}

/**
 * Many Mastra tool results are wrapped `{ data: {...} }` — sometimes doubly,
 * depending on which transport shipped them. Peel those layers off.
 */
export function unwrap(value: unknown): unknown {
  let v = value;
  for (let i = 0; i < 3; i++) {
    if (v && typeof v === 'object' && 'data' in (v as any) && Object.keys(v as any).length <= 2) {
      v = (v as any).data;
      continue;
    }
    if (v && typeof v === 'object' && 'result' in (v as any) && Object.keys(v as any).length <= 2) {
      v = (v as any).result;
      continue;
    }
    break;
  }
  return v;
}

/** Extract a filesystem-ish "path" from either tool args or result. */
export function extractPath(args: unknown, result?: unknown): string | undefined {
  const fromArgs = (args as any)?.path ?? (args as any)?.filePath ?? (args as any)?.filepath;
  if (typeof fromArgs === 'string') return fromArgs;
  const r = unwrap(result);
  if (r && typeof r === 'object') {
    const p = (r as any).path ?? (r as any).filePath;
    if (typeof p === 'string') return p;
  }
  return undefined;
}
