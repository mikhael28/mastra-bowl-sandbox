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
    <aside
      className="w-[340px] flex flex-col min-h-0 scan-lines"
      style={{
        borderRight: '1px solid rgba(108, 230, 248, 0.22)',
        background: 'rgba(2, 14, 20, 0.55)',
      }}
    >
      <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}>
        <div className="holo-eyebrow flex-1">
          // RECENT TRACES [{loading ? '...' : counts.total.toString().padStart(2, '0')}]
        </div>
      </div>

      <div className="flex gap-1 p-2 text-[10px]" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}>
        {(['all', 'agent', 'workflow'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-2 py-1 flex-1 font-mono uppercase tracking-widest"
            style={
              filter === f
                ? {
                    background: 'rgba(108, 230, 248, 0.15)',
                    color: '#aaf6ff',
                    border: '1px solid rgba(108, 230, 248, 0.55)',
                    textShadow: '0 0 4px rgba(108, 230, 248, 0.5)',
                  }
                : {
                    background: 'rgba(2, 14, 20, 0.55)',
                    color: 'rgba(108, 230, 248, 0.6)',
                    border: '1px solid rgba(108, 230, 248, 0.18)',
                  }
            }
          >
            {f === 'all' ? `ALL [${counts.total}]` : f === 'agent' ? `AGT [${counts.agents}]` : `WKF [${counts.workflows}]`}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 m-2 text-xs holo-panel-red glow-red" style={{ color: '#ff859a' }}>
          ⚠ {error}
        </div>
      )}

      <ul className="flex-1 overflow-y-auto">
        {spans.length === 0 && !loading && (
          <li className="p-4 text-[10px] holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
            // No traces yet. Send a message on the Chat tab to produce one.
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
        className="w-full text-left px-3 py-2 transition-all"
        style={{
          borderLeft: active ? '2px solid #aaf6ff' : '2px solid transparent',
          background: active
            ? 'linear-gradient(90deg, rgba(108, 230, 248, 0.14), transparent 90%)'
            : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = 'rgba(108, 230, 248, 0.05)';
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = 'transparent';
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-mono ${meta.bg} ${meta.textOn}`}
          >
            {meta.label}
          </span>
          {errored && (
            <span
              className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 glow-red"
              style={{
                background: 'rgba(255, 88, 116, 0.15)',
                color: '#ff859a',
                border: '1px solid rgba(255, 88, 116, 0.45)',
              }}
            >
              ⚠ ERR
            </span>
          )}
          <span className="text-[10px] holo-readout ml-auto" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
            {formatRelativeTime(span.startedAt)}
          </span>
        </div>
        <div className="text-sm font-display uppercase tracking-wider truncate" style={{ color: active ? '#aaf6ff' : '#cdf2fb' }}>
          {span.entityName ?? span.entityId ?? span.name}
        </div>
        {span.input && typeof span.input === 'string' && (
          <div className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(108, 230, 248, 0.6)' }}>
            {span.input}
          </div>
        )}
        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
          <span>{formatDuration(duration)}</span>
          {totalTokens > 0 && <span>{totalTokens.toLocaleString()} tok</span>}
          <span className="truncate ml-auto">{span.traceId.slice(0, 10)}…</span>
        </div>
      </button>
    </li>
  );
}
