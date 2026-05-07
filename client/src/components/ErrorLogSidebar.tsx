import { useEffect, useState } from 'react';
import {
  ErrorEntry,
  ErrorSource,
  clearErrors,
  subscribeErrors,
} from '../lib/errorLog';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SOURCE_TONE: Record<ErrorSource, string> = {
  stream: 'bg-rose-500/15 text-rose-200 border-rose-500/30',
  tool: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  approval: 'bg-sky-500/15 text-sky-200 border-sky-500/30',
  workspace: 'bg-indigo-500/15 text-indigo-200 border-indigo-500/30',
  voice: 'bg-teal-500/15 text-teal-200 border-teal-500/30',
  observability: 'bg-violet-500/15 text-violet-200 border-violet-500/30',
  mastra: 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/30',
  client: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
};

export function ErrorLogSidebar({ open, onClose }: Props) {
  const [entries, setEntries] = useState<ErrorEntry[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<ErrorSource | 'all'>('all');

  useEffect(() => {
    return subscribeErrors(setEntries);
  }, []);

  if (!open) return null;

  const visible =
    filter === 'all' ? entries : entries.filter((e) => e.source === filter);
  const sourceCounts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.source] = (acc[e.source] ?? 0) + 1;
    return acc;
  }, {});
  const allOpen =
    visible.length > 0 && visible.every((e) => expanded[e.id]);

  function toggleAll() {
    if (allOpen) {
      const next = { ...expanded };
      for (const e of visible) delete next[e.id];
      setExpanded(next);
    } else {
      const next = { ...expanded };
      for (const e of visible) next[e.id] = true;
      setExpanded(next);
    }
  }

  return (
    <aside
      className="fixed top-14 right-0 bottom-0 z-40 w-[480px] flex flex-col scan-lines"
      style={{
        borderLeft: '1px solid rgba(255, 88, 116, 0.4)',
        background: 'linear-gradient(180deg, rgba(40, 4, 12, 0.5), rgba(2, 14, 20, 0.85))',
        boxShadow: '0 0 30px rgba(255, 88, 116, 0.15)',
      }}
    >
      <div
        className="px-3 py-2.5 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255, 88, 116, 0.35)' }}
      >
        <span className="glow-red text-base" style={{ color: '#ff859a' }}>⚠</span>
        <div className="holo-title text-sm glow-red" style={{ color: '#ff859a' }}>
          ERROR LOG
        </div>
        <span className="text-[10px] holo-readout" style={{ color: 'rgba(255, 184, 200, 0.6)' }}>
          [{visible.length.toString().padStart(2, '0')}
          {filter !== 'all' && entries.length > visible.length
            ? `/${entries.length.toString().padStart(2, '0')}`
            : ''}]
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={toggleAll}
            disabled={visible.length === 0}
            className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              border: '1px solid rgba(108, 230, 248, 0.25)',
              color: 'rgba(108, 230, 248, 0.7)',
              background: 'rgba(108, 230, 248, 0.04)',
            }}
            title={allOpen ? 'Collapse all' : 'Expand all'}
          >
            {allOpen ? '◢ COLLAPSE' : '◣ EXPAND'}
          </button>
          <button
            onClick={clearErrors}
            disabled={entries.length === 0}
            className="holo-button holo-button-red disabled:opacity-40"
          >
            ✕ CLR
          </button>
          <button
            onClick={onClose}
            className="text-base px-1 transition-colors"
            style={{ color: 'rgba(255, 184, 200, 0.6)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ff859a')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 184, 200, 0.6)')}
            title="Close error log"
          >
            ✕
          </button>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="px-2 py-1.5 border-b border-slate-800 flex flex-wrap gap-1">
          <FilterChip
            label="all"
            count={entries.length}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            tone="bg-slate-700/30 text-slate-200 border-slate-600/40"
          />
          {(Object.keys(SOURCE_TONE) as ErrorSource[]).map((s) =>
            sourceCounts[s] ? (
              <FilterChip
                key={s}
                label={s}
                count={sourceCounts[s]}
                active={filter === s}
                onClick={() => setFilter(s)}
                tone={SOURCE_TONE[s]}
              />
            ) : null,
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {entries.length === 0 && (
          <div className="text-[10px] holo-readout px-2 py-3" style={{ color: 'rgba(108, 230, 248, 0.5)' }}>
            // SYSTEM NOMINAL
            <br />
            // No errors logged. Stream, tool, approval and workspace failures
            will surface here as they happen.
          </div>
        )}
        {entries.length > 0 && visible.length === 0 && (
          <div className="text-[10px] holo-readout px-2 py-3" style={{ color: 'rgba(108, 230, 248, 0.5)' }}>
            // No errors match the <span style={{ color: '#aaf6ff' }}>{filter}</span> filter.
          </div>
        )}
        {visible.map((e) => (
          <ErrorRow
            key={e.id}
            entry={e}
            open={!!expanded[e.id]}
            onToggle={() =>
              setExpanded((prev) => ({ ...prev, [e.id]: !prev[e.id] }))
            }
          />
        ))}
      </div>
    </aside>
  );
}

function ErrorRow({
  entry: e,
  open,
  onToggle,
}: {
  entry: ErrorEntry;
  open: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState<'' | 'message' | 'all'>('');

  async function copy(kind: 'message' | 'all') {
    const text =
      kind === 'message'
        ? e.message
        : formatErrorForClipboard(e);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(''), 1200);
    } catch {
      /* clipboard blocked — silent */
    }
  }

  return (
    <div
      className={`rounded border ${SOURCE_TONE[e.source]} overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-2 py-1.5 hover:bg-white/5"
      >
        <div className="flex items-center gap-2 text-[10px] font-mono opacity-80">
          <span aria-hidden className="text-[11px] leading-none">
            {open ? '▾' : '▸'}
          </span>
          <span className="uppercase tracking-wide">{e.source}</span>
          {e.toolName && <span>· {e.toolName}</span>}
          {e.agentId && <span>· {e.agentId}</span>}
          <span
            className="ml-auto"
            title={new Date(e.ts).toLocaleString()}
          >
            {formatRelative(e.ts)}
          </span>
        </div>
        <div className="mt-0.5 text-xs whitespace-pre-wrap break-words">
          {e.message}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/10 bg-slate-950/60">
          <dl className="px-2 py-2 grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-[10px] font-mono">
            <DetailRow label="time" value={new Date(e.ts).toLocaleString()} />
            <DetailRow label="source" value={e.source} />
            {e.toolName && <DetailRow label="tool" value={e.toolName} />}
            {e.agentId && <DetailRow label="agent" value={e.agentId} />}
            {e.threadId && <DetailRow label="thread" value={e.threadId} />}
            {e.runId && <DetailRow label="run" value={e.runId} />}
          </dl>

          <div className="px-2 pb-2">
            <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">
              message
            </div>
            <pre className="m-0 px-2 py-1.5 rounded bg-slate-950 text-[11px] font-mono text-slate-100 whitespace-pre-wrap break-words border border-slate-800">
              {e.message}
            </pre>
          </div>

          {e.detail && (
            <div className="px-2 pb-2">
              <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">
                stack / detail
              </div>
              <pre className="m-0 px-2 py-1.5 rounded bg-slate-950 text-[10px] font-mono text-slate-300 whitespace-pre-wrap break-all border border-slate-800 max-h-80 overflow-auto">
                {e.detail}
              </pre>
            </div>
          )}

          <div className="px-2 pb-2 flex items-center gap-1.5">
            <button
              onClick={() => copy('message')}
              className="text-[10px] px-2 py-0.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {copied === 'message' ? '✓ copied' : 'copy message'}
            </button>
            <button
              onClick={() => copy('all')}
              className="text-[10px] px-2 py-0.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {copied === 'all' ? '✓ copied' : 'copy full'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-slate-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-slate-200 break-all">{value}</dd>
    </>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  tone,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
        active
          ? `${tone} ring-1 ring-white/20`
          : 'border-slate-700 text-slate-400 hover:bg-slate-800'
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );
}

export function ErrorLogToggleButton({
  onClick,
  active,
}: {
  onClick: () => void;
  active: boolean;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => subscribeErrors((es) => setCount(es.length)), []);
  return (
    <button
      onClick={onClick}
      title="Show recent errors"
      className="text-[10px] font-mono tracking-widest uppercase px-2 py-1 transition-all"
      style={{
        border: count > 0 ? '1px solid rgba(255, 88, 116, 0.5)' : '1px solid rgba(108, 230, 248, 0.25)',
        color: count > 0 ? '#ff859a' : 'rgba(108, 230, 248, 0.7)',
        background: active
          ? count > 0
            ? 'rgba(255, 88, 116, 0.12)'
            : 'rgba(108, 230, 248, 0.12)'
          : count > 0
            ? 'rgba(255, 88, 116, 0.04)'
            : 'rgba(108, 230, 248, 0.04)',
        textShadow: count > 0 ? '0 0 5px rgba(255, 88, 116, 0.5)' : 'none',
      }}
    >
      ⚠ ERR{count > 0 && <span className="ml-1">[{count.toString().padStart(2, '0')}]</span>}
    </button>
  );
}

function formatRelative(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleString();
}

function formatErrorForClipboard(e: ErrorEntry): string {
  const lines: string[] = [];
  lines.push(`[${e.source}] ${e.message}`);
  lines.push(`time: ${new Date(e.ts).toISOString()}`);
  if (e.toolName) lines.push(`tool: ${e.toolName}`);
  if (e.agentId) lines.push(`agent: ${e.agentId}`);
  if (e.threadId) lines.push(`thread: ${e.threadId}`);
  if (e.runId) lines.push(`run: ${e.runId}`);
  if (e.detail) {
    lines.push('');
    lines.push('--- detail ---');
    lines.push(e.detail);
  }
  return lines.join('\n');
}
