import { useMemo, useState } from 'react';
import type { SpanNode } from '../../lib/spans';
import { metaForSpanType, formatDuration } from '../../lib/spans';
import {
  breakdownFromUsage,
  computeCost,
  formatCost,
  formatTokens,
} from '../../lib/cost';

interface Props {
  span: SpanNode | null;
  onClose: () => void;
}

/** Side panel (right) showing the selected span's attributes, I/O, and timings. */
export function SpanDetail({ span, onClose }: Props) {
  if (!span) return null;
  const meta = metaForSpanType(span.spanType);
  const attrs = (span.attributes ?? {}) as any;
  const usage = attrs?.usage;
  const breakdown = useMemo(() => (usage ? breakdownFromUsage(usage) : null), [usage]);
  const cost = useMemo(
    () => (breakdown ? computeCost(breakdown, attrs?.model) : null),
    [breakdown, attrs?.model],
  );

  return (
    <aside className="w-[420px] border-l border-slate-800 bg-slate-950 flex flex-col min-h-0">
      <div className="px-3 py-2 border-b border-slate-800 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${meta.bg} ${meta.textOn}`}
            >
              {meta.label}
            </span>
            {span.errorInfo?.message && (
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                error
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-slate-100 truncate" title={span.name}>
            {span.name}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200 text-xs leading-none p-1"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto text-xs">
        {/* Timing panel */}
        <Section label="Timing">
          <KV k="duration" v={formatDuration(span.durationMs)} />
          <KV k="started" v={new Date(span.startedAt).toLocaleTimeString()} />
          {span.endedAt && (
            <KV k="ended" v={new Date(span.endedAt).toLocaleTimeString()} />
          )}
          <KV k="offset" v={`+${formatDuration(span.startOffsetMs)}`} />
        </Section>

        {/* Identity */}
        <Section label="Identity">
          {span.entityName && <KV k="entity" v={`${span.entityType}: ${span.entityName}`} />}
          <KV k="span id" v={span.spanId} mono />
          {span.parentSpanId && <KV k="parent" v={span.parentSpanId} mono />}
          <KV k="trace id" v={span.traceId} mono />
          {span.runId && <KV k="run id" v={span.runId} mono />}
          {span.threadId && <KV k="thread" v={span.threadId} mono />}
          {span.resourceId && <KV k="resource" v={span.resourceId} mono />}
        </Section>

        {/* Usage + cost for model generations */}
        {breakdown && breakdown.totalTokens > 0 && (
          <Section label="Token usage">
            <KV k="input" v={formatTokens(breakdown.inputTokens)} />
            <KV k="output" v={formatTokens(breakdown.outputTokens)} />
            {breakdown.cachedTokens > 0 && (
              <KV k="cached" v={formatTokens(breakdown.cachedTokens)} />
            )}
            {breakdown.reasoningTokens > 0 && (
              <KV k="reasoning" v={formatTokens(breakdown.reasoningTokens)} />
            )}
            <KV k="total" v={formatTokens(breakdown.totalTokens)} />
            {cost != null && <KV k="cost" v={formatCost(cost)} />}
          </Section>
        )}

        {/* Error */}
        {span.errorInfo?.message && (
          <Section label="Error">
            <pre className="whitespace-pre-wrap text-rose-300 text-[11px] bg-rose-500/5 border border-rose-500/20 rounded p-2">
              {span.errorInfo.message}
            </pre>
          </Section>
        )}

        {/* Attributes — the span-type-specific metadata */}
        {attrs && Object.keys(attrs).length > 0 && (
          <Section label="Attributes" defaultOpen>
            <JsonView value={stripBulky(attrs)} />
          </Section>
        )}

        {/* Input */}
        {span.input !== undefined && span.input !== null && (
          <Section label="Input">
            <JsonOrText value={span.input} />
          </Section>
        )}

        {/* Output */}
        {span.output !== undefined && span.output !== null && (
          <Section label="Output">
            <JsonOrText value={span.output} />
          </Section>
        )}

        {/* Metadata */}
        {span.metadata && Object.keys(span.metadata).length > 0 && (
          <Section label="Metadata">
            <JsonView value={span.metadata} />
          </Section>
        )}

        {/* Tags */}
        {span.tags && span.tags.length > 0 && (
          <Section label="Tags">
            <div className="flex flex-wrap gap-1">
              {span.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </aside>
  );
}

function Section({
  label,
  defaultOpen = true,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-900/80">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-300 hover:bg-slate-900/60"
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>{label}</span>
      </button>
      {open && <div className="px-3 pb-3 pt-1 space-y-1">{children}</div>}
    </div>
  );
}

function KV({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <div className="w-20 text-slate-500 shrink-0">{k}</div>
      <div
        className={`flex-1 min-w-0 text-slate-200 break-all ${mono ? 'font-mono text-[10.5px]' : ''}`}
      >
        {v}
      </div>
    </div>
  );
}

function JsonView({ value }: { value: unknown }) {
  return (
    <pre className="text-[11px] bg-slate-950 border border-slate-800 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
      {safeStringify(value)}
    </pre>
  );
}

function JsonOrText({ value }: { value: unknown }) {
  if (typeof value === 'string') {
    return (
      <div className="text-[11px] bg-slate-950 border border-slate-800 rounded p-2 whitespace-pre-wrap break-words">
        {value}
      </div>
    );
  }
  return <JsonView value={value} />;
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

/**
 * Some spans carry huge blobs in attributes (e.g. full agent instructions,
 * entire tool catalogs). Those dominate the viewport when pretty-printed —
 * trim them to a preview and let the user expand.
 *
 * Keeping this conservative: only truncate string fields that obviously
 * spill, not objects/arrays.
 */
function stripBulky(attrs: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (typeof v === 'string' && v.length > 800) {
      out[k] = v.slice(0, 800) + `\n… [${v.length - 800} more chars]`;
    } else {
      out[k] = v;
    }
  }
  return out;
}
