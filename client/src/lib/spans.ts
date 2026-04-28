/**
 * Helpers for transforming flat SpanRecord[] payloads (from
 * /api/observability/traces/:traceId) into tree / waterfall shapes the UI
 * can render. All pure functions — no fetching.
 */

import type { SpanRecord, SpanType } from './mastraClient';
import {
  breakdownFromUsage,
  computeCost,
  addBreakdown,
  EMPTY_BREAKDOWN,
  type TokenBreakdown,
} from './cost';

export type SpanNode = SpanRecord & {
  depth: number;
  children: SpanNode[];
  /** Start offset from the trace's earliest startedAt, in ms. */
  startOffsetMs: number;
  /** Span duration in ms (0 for events / running spans). */
  durationMs: number;
};

/**
 * Build a parent→children tree out of a flat span list. Orphans (whose parent
 * is missing from the list) are promoted to roots so nothing is dropped.
 */
export function buildSpanTree(spans: SpanRecord[]): {
  roots: SpanNode[];
  traceStartMs: number;
  traceEndMs: number;
} {
  if (spans.length === 0) {
    return { roots: [], traceStartMs: 0, traceEndMs: 0 };
  }

  const byId = new Map<string, SpanRecord>();
  for (const s of spans) byId.set(s.spanId, s);

  const traceStartMs = Math.min(
    ...spans.map((s) => Date.parse(s.startedAt)).filter((n) => isFinite(n)),
  );
  const rawEnds = spans
    .map((s) => (s.endedAt ? Date.parse(s.endedAt) : null))
    .filter((n): n is number => typeof n === 'number' && isFinite(n));
  const traceEndMs = rawEnds.length
    ? Math.max(...rawEnds)
    : traceStartMs;

  const nodes = new Map<string, SpanNode>();
  for (const s of spans) {
    const started = Date.parse(s.startedAt);
    const ended = s.endedAt ? Date.parse(s.endedAt) : null;
    nodes.set(s.spanId, {
      ...s,
      depth: 0,
      children: [],
      startOffsetMs: isFinite(started) ? started - traceStartMs : 0,
      durationMs: ended && isFinite(ended) && isFinite(started) ? ended - started : 0,
    });
  }

  const roots: SpanNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentSpanId ? nodes.get(node.parentSpanId) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Recursively compute depth and sort children by startTime.
  const walk = (n: SpanNode, d: number) => {
    n.depth = d;
    n.children.sort((a, b) => a.startOffsetMs - b.startOffsetMs);
    for (const c of n.children) walk(c, d + 1);
  };
  roots.sort((a, b) => a.startOffsetMs - b.startOffsetMs);
  for (const r of roots) walk(r, 0);

  return { roots, traceStartMs, traceEndMs };
}

/** Flatten the tree back out in display order (preorder). */
export function flattenTree(roots: SpanNode[]): SpanNode[] {
  const out: SpanNode[] = [];
  const walk = (n: SpanNode) => {
    out.push(n);
    for (const c of n.children) walk(c);
  };
  for (const r of roots) walk(r);
  return out;
}

export type SpanSummary = {
  totalDurationMs: number;
  spanCount: number;
  byType: Record<string, number>;
  /** Summed usage across every model_generation span. */
  usage: TokenBreakdown;
  /** Best-effort total cost across every billed generation. */
  costUsd: number | null;
  /** Top-level model id seen on a model_generation span, if any. */
  primaryModel: string | null;
  /** True if any span errored. */
  hasError: boolean;
  errorMessage: string | null;
  /** Count of each span type we visualize separately. */
  modelCalls: number;
  toolCalls: number;
  processorCalls: number;
  workflowSteps: number;
};

export function summarizeSpans(spans: SpanRecord[]): SpanSummary {
  if (spans.length === 0) {
    return {
      totalDurationMs: 0,
      spanCount: 0,
      byType: {},
      usage: { ...EMPTY_BREAKDOWN },
      costUsd: 0,
      primaryModel: null,
      hasError: false,
      errorMessage: null,
      modelCalls: 0,
      toolCalls: 0,
      processorCalls: 0,
      workflowSteps: 0,
    };
  }

  const byType: Record<string, number> = {};
  let usage = { ...EMPTY_BREAKDOWN };
  let costUsd = 0;
  let costKnown = false;
  let primaryModel: string | null = null;
  let hasError = false;
  let errorMessage: string | null = null;

  const starts = spans.map((s) => Date.parse(s.startedAt)).filter((n) => isFinite(n));
  const ends = spans
    .map((s) => (s.endedAt ? Date.parse(s.endedAt) : null))
    .filter((n): n is number => typeof n === 'number' && isFinite(n));
  const totalDurationMs =
    starts.length && ends.length ? Math.max(...ends) - Math.min(...starts) : 0;

  for (const s of spans) {
    byType[s.spanType] = (byType[s.spanType] ?? 0) + 1;
    if (s.errorInfo?.message) {
      hasError = true;
      errorMessage = errorMessage ?? s.errorInfo.message;
    }
    if (s.spanType === 'model_generation') {
      const attrs = (s.attributes ?? {}) as any;
      const model: string | null = attrs.model ?? null;
      if (model && !primaryModel) primaryModel = model;
      if (attrs.usage) {
        const b = breakdownFromUsage(attrs.usage);
        usage = addBreakdown(usage, b);
        const c = computeCost(b, model);
        if (c != null) {
          costUsd += c;
          costKnown = true;
        }
      }
    } else if (s.spanType === 'model_step') {
      // Older shape — usage sometimes lives on model_step, not model_generation.
      const attrs = (s.attributes ?? {}) as any;
      if (attrs.usage && usage.totalTokens === 0) {
        const b = breakdownFromUsage(attrs.usage);
        usage = addBreakdown(usage, b);
      }
    }
  }

  return {
    totalDurationMs,
    spanCount: spans.length,
    byType,
    usage,
    costUsd: costKnown ? costUsd : null,
    primaryModel,
    hasError,
    errorMessage,
    modelCalls: byType['model_generation'] ?? 0,
    toolCalls: (byType['tool_call'] ?? 0) + (byType['mcp_tool_call'] ?? 0),
    processorCalls: byType['processor_run'] ?? 0,
    workflowSteps: byType['workflow_step'] ?? 0,
  };
}

export const SPAN_KIND_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; textOn: string }
> = {
  agent_run: {
    label: 'Agent',
    color: 'bg-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/40',
    textOn: 'text-indigo-200',
  },
  workflow_run: {
    label: 'Workflow',
    color: 'bg-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    textOn: 'text-emerald-200',
  },
  workflow_step: {
    label: 'Step',
    color: 'bg-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/40',
    textOn: 'text-emerald-100',
  },
  workflow_conditional: {
    label: 'Branch',
    color: 'bg-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/40',
    textOn: 'text-teal-200',
  },
  workflow_conditional_eval: {
    label: 'Branch eval',
    color: 'bg-teal-400',
    bg: 'bg-teal-400/10',
    border: 'border-teal-400/40',
    textOn: 'text-teal-100',
  },
  workflow_parallel: {
    label: 'Parallel',
    color: 'bg-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/40',
    textOn: 'text-cyan-200',
  },
  workflow_loop: {
    label: 'Loop',
    color: 'bg-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/40',
    textOn: 'text-cyan-100',
  },
  model_generation: {
    label: 'LLM',
    color: 'bg-sky-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/40',
    textOn: 'text-sky-200',
  },
  model_step: {
    label: 'Step',
    color: 'bg-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/40',
    textOn: 'text-sky-100',
  },
  model_chunk: {
    label: 'Chunk',
    color: 'bg-sky-300',
    bg: 'bg-sky-300/10',
    border: 'border-sky-300/40',
    textOn: 'text-sky-100',
  },
  tool_call: {
    label: 'Tool',
    color: 'bg-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    textOn: 'text-amber-200',
  },
  mcp_tool_call: {
    label: 'MCP Tool',
    color: 'bg-fuchsia-500',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/40',
    textOn: 'text-fuchsia-200',
  },
  processor_run: {
    label: 'Processor',
    color: 'bg-slate-500',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/40',
    textOn: 'text-slate-300',
  },
  generic: {
    label: 'Span',
    color: 'bg-slate-600',
    bg: 'bg-slate-600/10',
    border: 'border-slate-600/40',
    textOn: 'text-slate-300',
  },
};

export function metaForSpanType(t: SpanType | string) {
  return SPAN_KIND_META[t] ?? SPAN_KIND_META.generic;
}

export function formatDuration(ms: number): string {
  if (!isFinite(ms) || ms <= 0) return '—';
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)}s`;
  const s = ms / 1000;
  const m = Math.floor(s / 60);
  return `${m}m ${Math.round(s % 60)}s`;
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (!isFinite(t)) return '';
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(t).toLocaleString();
}
