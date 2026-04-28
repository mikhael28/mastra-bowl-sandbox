import { useEffect, useMemo, useState } from 'react';
import { listTraces, SpanRecord } from '../../lib/mastraClient';
import { formatDuration, formatRelativeTime, metaForSpanType } from '../../lib/spans';

type EntityFilter = 'all' | 'agent' | 'workflow';

interface Props {
  selectedTraceId: string | null;
  onSelectTrace: (traceId: string, rootSpan: SpanRecord) => void;
  /** When this number changes, force a refetch — used to sync after a new Chat turn. */
  refreshNonce: number;
}

/**
 * Left rail of the Observability tab: a scrollable list of recent traces.
 * One row per trace (i.e. per root span — agent_run or workflow_run).
 * Auto-refreshes every 10 seconds so new chat turns show up without
 * reloading the tab.
 */
export function TraceList({ selectedTraceId, onSelectTrace, refreshNonce }: Props) {
  const [spans, setSpans] = useState<SpanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<EntityFilter>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const page = await listTraces({
          perPage: 50,
          entityType: filter === 'all' ? undefined : filter,
        });
        if (alive) {
          setSpans(page.spans);
          setError(null);
        }
      } catch (e: any) {
        if (alive) setError(String(e?.message ?? e));
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 10_000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [filter, refreshNonce]);

  // Auto-select the newest trace when nothing's selected yet.
  useEffect(() => {
    if (!selectedTraceId && spans[0]) {
      onSelectTrace(spans[0].traceId, spans[0]);
    }
  }, [selectedTraceId, spans, onSelectTrace]);

  const counts = useMemo(() => {
    const agents = spans.filter((s) => s.entityType === 'agent').length;
    const workflows = spans.filter((s) => s.entityType === 'workflow').length;
    return { agents, workflows, total: spans.length };
  }, [spans]);

  return (
    <aside className="w-[340px] border-r border-slate-800 bg-slate-950/60 flex flex-col min-h-0">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 flex-1">
          Recent traces {loading ? '…' : `(${counts.total})`}
        </div>
      </div>

      <div className="flex gap-1 p-2 border-b border-slate-800 text-[11px]">
        {(['all', 'agent', 'workflow'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded flex-1 ${
              filter === f
                ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/40'
                : 'border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {f === 'all' ? `All · ${counts.total}` : f === 'agent' ? `Agents · ${counts.agents}` : `Workflows · ${counts.workflows}`}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 m-2 text-xs text-rose-300 border border-rose-500/30 bg-rose-500/10 rounded">
          {error}
        </div>
      )}

      <ul className="flex-1 overflow-y-auto">
        {spans.length === 0 && !loading && (
          <li className="p-4 text-[12px] text-slate-500">
            No traces yet. Send a message on the Chat tab to produce one.
          </li>
        )}
        {spans.map((s) => (
          <TraceRow
            key={s.traceId}
            span={s}
            active={s.traceId === selectedTraceId}
            onClick={() => onSelectTrace(s.traceId, s)}
          />
        ))}
      </ul>
    </aside>
  );
}

function TraceRow({
  span,
  active,
  onClick,
}: {
  span: SpanRecord;
  active: boolean;
  onClick: () => void;
}) {
  const meta = metaForSpanType(span.spanType);
  const started = Date.parse(span.startedAt);
  const ended = span.endedAt ? Date.parse(span.endedAt) : null;
  const duration =
    isFinite(started) && ended && isFinite(ended) ? ended - started : 0;
  const errored = !!span.errorInfo?.message;
  const attrs = (span.attributes ?? {}) as any;
  const totalTokens =
    (attrs?.usage?.inputTokens ?? 0) + (attrs?.usage?.outputTokens ?? 0);

  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2 border-l-2 ${
          active
            ? 'bg-indigo-500/10 border-l-indigo-500'
            : 'border-l-transparent hover:bg-slate-800/40'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${meta.bg} ${meta.textOn}`}
          >
            {meta.label}
          </span>
          {errored && (
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
              error
            </span>
          )}
          <span className="text-[10px] text-slate-500 ml-auto">
            {formatRelativeTime(span.startedAt)}
          </span>
        </div>
        <div className="text-sm font-medium text-slate-200 truncate">
          {span.entityName ?? span.entityId ?? span.name}
        </div>
        {span.input && typeof span.input === 'string' && (
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            {span.input}
          </div>
        )}
        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-mono">
          <span>{formatDuration(duration)}</span>
          {totalTokens > 0 && <span>{totalTokens.toLocaleString()} tok</span>}
          <span className="truncate ml-auto">{span.traceId.slice(0, 10)}…</span>
        </div>
      </button>
    </li>
  );
}
