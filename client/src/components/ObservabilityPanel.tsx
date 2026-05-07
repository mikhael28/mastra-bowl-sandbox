import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTrace, getTraceByRunId, SpanRecord, TraceDetail } from '../lib/mastraClient';
import {
  summarizeSpans,
  formatDuration,
  metaForSpanType,
  type SpanNode,
} from '../lib/spans';
import { formatCost, formatTokens } from '../lib/cost';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';
import { TraceList } from './observability/TraceList';
import { TraceWaterfall } from './observability/TraceWaterfall';
import { SpanDetail } from './observability/SpanDetail';

interface Props {
  /** Optional run id handed in when the user clicks "view trace" from Chat. */
  focusRunId?: string | null;
  /** Optional trace id handed in when another panel deep-links. */
  focusTraceId?: string | null;
  onTeach: (id: PrimitiveId) => void;
  /** Incremented by Chat after every finished turn to nudge the trace list. */
  refreshNonce: number;
}

/**
 * Top-level Observability tab. Three-pane layout:
 *   TraceList (left) | Waterfall + summary (center) | SpanDetail (right)
 *
 * The waterfall is the teaching moment — users see every agent loop, tool
 * call, processor, and model generation laid out on a single time axis.
 */
export function ObservabilityPanel({
  focusRunId,
  focusTraceId,
  onTeach,
  refreshNonce,
}: Props) {
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(
    focusTraceId ?? null,
  );
  const [rootSpan, setRootSpan] = useState<SpanRecord | null>(null);
  const [trace, setTrace] = useState<TraceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedSpan, setSelectedSpan] = useState<SpanNode | null>(null);
  const [hideInternal, setHideInternal] = useState(false);

  // Resolve focusRunId → traceId whenever the parent hands us a new one.
  // Fires unconditionally on each focusRunId change so "view trace" always
  // navigates to the right run even if another trace is already selected.
  useEffect(() => {
    if (!focusRunId) return;
    let alive = true;
    (async () => {
      const t = await getTraceByRunId(focusRunId);
      if (alive && t) {
        setTrace(t);
        setSelectedTraceId(t.traceId);
        setRootSpan(t.spans.find((s) => !s.parentSpanId) ?? t.spans[0] ?? null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [focusRunId]);

  // Fetch the trace whenever the user selects one from the list.
  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!selectedTraceId) {
        setTrace(null);
        return;
      }
      setLoading(true);
      try {
        const t = await getTrace(selectedTraceId);
        if (alive) {
          setTrace(t);
          setErr(null);
          setSelectedSpan(null);
        }
      } catch (e: any) {
        if (alive) setErr(String(e?.message ?? e));
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [selectedTraceId]);

  const summary = useMemo(
    () => (trace ? summarizeSpans(trace.spans) : null),
    [trace],
  );

  const onSelectTrace = useCallback((traceId: string, span: SpanRecord) => {
    setSelectedTraceId(traceId);
    setRootSpan(span);
    setSelectedSpan(null);
  }, []);

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      <TraceList
        selectedTraceId={selectedTraceId}
        onSelectTrace={onSelectTrace}
        refreshNonce={refreshNonce}
      />

      <div className="flex-1 flex flex-col min-w-0 scan-lines">
        {/* Header */}
        <header
          className="p-3"
          style={{
            borderBottom: '1px solid rgba(108, 230, 248, 0.22)',
            background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.5), rgba(2, 14, 20, 0.25))',
          }}
        >
          {rootSpan ? (
            <div>
              <div className="holo-eyebrow">// MODULE 09 // TELEMETRY</div>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <EntityBadge span={rootSpan} />
                <h2 className="holo-title text-base truncate max-w-[480px]">
                  {rootSpan.entityName ?? rootSpan.entityId ?? rootSpan.name}
                </h2>
                <PrimitiveBadge primitive="observability" onTeach={onTeach} compact />
                {summary?.hasError && (
                  <span
                    className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 glow-red"
                    style={{
                      background: 'rgba(255, 88, 116, 0.15)',
                      color: '#ff859a',
                      border: '1px solid rgba(255, 88, 116, 0.45)',
                    }}
                  >
                    ⚠ ERROR
                  </span>
                )}
                <label className="ml-auto flex items-center gap-1.5 text-[10px] holo-readout cursor-pointer uppercase tracking-widest" style={{ color: 'rgba(108, 230, 248, 0.7)' }}>
                  <input
                    type="checkbox"
                    checked={hideInternal}
                    onChange={(e) => setHideInternal(e.target.checked)}
                    className="accent-cyan-400"
                  />
                  HIDE PROCESSORS
                </label>
              </div>

              {/* Summary row */}
              <div className="mt-2 grid grid-cols-6 gap-2 text-xs">
                <Stat label="spans" value={String(summary?.spanCount ?? '—')} />
                <Stat
                  label="duration"
                  value={formatDuration(summary?.totalDurationMs ?? 0)}
                />
                <Stat
                  label="LLM calls"
                  value={String(summary?.modelCalls ?? 0)}
                  sub={summary?.primaryModel ?? undefined}
                />
                <Stat
                  label="tools"
                  value={String(summary?.toolCalls ?? 0)}
                />
                <Stat
                  label="tokens"
                  value={formatTokens(summary?.usage.totalTokens ?? 0)}
                  sub={
                    summary && summary.usage.totalTokens > 0
                      ? `${formatTokens(summary.usage.inputTokens)} in · ${formatTokens(summary.usage.outputTokens)} out${
                          summary.usage.cachedTokens
                            ? ` · ${formatTokens(summary.usage.cachedTokens)} cached`
                            : ''
                        }`
                      : undefined
                  }
                />
                <Stat
                  label="cost"
                  value={formatCost(summary?.costUsd)}
                  sub={summary?.costUsd == null ? 'unknown model' : undefined}
                />
              </div>

              <div className="mt-2 font-mono text-[10px] truncate" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
                &gt; GET /api/observability/traces/{rootSpan.traceId}
                {rootSpan.runId ? ` · run ${rootSpan.runId}` : ''}
              </div>
            </div>
          ) : (
            <div className="text-sm holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
              // Select a trace on the left to inspect it.
            </div>
          )}
        </header>

        {/* Waterfall */}
        {loading && (
          <div className="p-8 text-sm holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>// loading trace...</div>
        )}
        {err && !loading && (
          <div
            className="m-3 p-3 text-xs holo-panel-red"
            style={{ color: '#ff859a' }}
          >
            ⚠ {err}
          </div>
        )}
        {!loading && trace && (
          <TraceWaterfall
            spans={trace.spans}
            selectedSpanId={selectedSpan?.spanId ?? null}
            onSelectSpan={setSelectedSpan}
            hideInternal={hideInternal}
          />
        )}
      </div>

      <SpanDetail span={selectedSpan} onClose={() => setSelectedSpan(null)} />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="px-2 py-1.5"
      style={{
        background: 'rgba(2, 14, 20, 0.7)',
        border: '1px solid rgba(108, 230, 248, 0.22)',
      }}
    >
      <div className="holo-eyebrow">{label}</div>
      <div className="text-sm font-bold truncate holo-num" style={{ color: '#aaf6ff', textShadow: '0 0 5px rgba(108, 230, 248, 0.4)' }}>
        {value}
      </div>
      {sub && (
        <div className="text-[10px] truncate holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function EntityBadge({ span }: { span: SpanRecord }) {
  const meta = metaForSpanType(span.spanType);
  return (
    <span
      className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-mono ${meta.bg} ${meta.textOn}`}
    >
      {meta.label}
    </span>
  );
}
