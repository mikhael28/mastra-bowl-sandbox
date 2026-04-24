import { useMemo, useState, useRef, useEffect } from 'react';
import {
  buildSpanTree,
  flattenTree,
  metaForSpanType,
  formatDuration,
  type SpanNode,
} from '../../lib/spans';
import type { SpanRecord } from '../../lib/mastraClient';

interface Props {
  spans: SpanRecord[];
  selectedSpanId: string | null;
  onSelectSpan: (span: SpanNode) => void;
  /** When true, internal processor_run spans are hidden to reduce clutter. */
  hideInternal?: boolean;
}

const ROW_HEIGHT = 24;
const NAME_WIDTH = 340;

/**
 * Gantt-style waterfall of spans. Left column shows the span tree (indented
 * by depth). Right column is a time axis with colored bars proportional to
 * span duration. The whole trace fits horizontally — no horizontal scroll.
 */
export function TraceWaterfall({
  spans,
  selectedSpanId,
  onSelectSpan,
  hideInternal = false,
}: Props) {
  const { roots, traceEndMs, traceStartMs, flat } = useMemo(() => {
    const { roots, traceStartMs, traceEndMs } = buildSpanTree(spans);
    const flat = flattenTree(roots).filter(
      (n) => !hideInternal || n.spanType !== 'processor_run',
    );
    return { roots, traceStartMs, traceEndMs, flat };
  }, [spans, hideInternal]);

  const totalMs = Math.max(1, traceEndMs - traceStartMs);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [innerWidth, setInnerWidth] = useState(600);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver(() => {
      setInnerWidth(Math.max(200, el.clientWidth - NAME_WIDTH - 16));
    });
    observer.observe(el);
    setInnerWidth(Math.max(200, el.clientWidth - NAME_WIDTH - 16));
    return () => observer.disconnect();
  }, []);

  const isHidden = (n: SpanNode): boolean => {
    let p: SpanNode | undefined = n;
    // Walk up via depth by finding ancestors in `flat` — cheaper: we stored
    // parent on the original record but not node tree, so re-derive via map.
    const byId = new Map(flat.map((s) => [s.spanId, s]));
    let cursor: SpanNode | undefined = byId.get(n.parentSpanId ?? '');
    while (cursor) {
      if (collapsed.has(cursor.spanId)) return true;
      cursor = byId.get(cursor.parentSpanId ?? '');
    }
    void p;
    return false;
  };

  const visible = flat.filter((n) => !isHidden(n));

  // Axis ticks at fixed fractions of the trace.
  const ticks = useMemo(() => {
    const N = 5;
    return Array.from({ length: N + 1 }, (_, i) => {
      const fraction = i / N;
      return {
        fraction,
        label: formatDuration(totalMs * fraction),
      };
    });
  }, [totalMs]);

  if (spans.length === 0) {
    return (
      <div className="p-8 text-sm text-slate-500">
        No spans in this trace.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0 font-mono text-[11px]">
      {/* Time axis header */}
      <div
        className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex"
        style={{ height: ROW_HEIGHT + 4 }}
      >
        <div
          className="shrink-0 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500"
          style={{ width: NAME_WIDTH }}
        >
          Span · duration
        </div>
        <div className="flex-1 relative px-2">
          {ticks.map((t, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-slate-800/70"
              style={{ left: `${t.fraction * 100}%` }}
            >
              <span className="absolute top-1 left-1 text-[9px] text-slate-500 whitespace-nowrap">
                {i === 0 ? '0' : t.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div>
        {visible.map((n) => (
          <WaterfallRow
            key={n.spanId}
            node={n}
            totalMs={totalMs}
            selected={n.spanId === selectedSpanId}
            collapsed={collapsed.has(n.spanId)}
            hasChildren={n.children.length > 0}
            onToggle={() =>
              setCollapsed((c) => {
                const next = new Set(c);
                if (next.has(n.spanId)) next.delete(n.spanId);
                else next.add(n.spanId);
                return next;
              })
            }
            onClick={() => onSelectSpan(n)}
            nameWidth={NAME_WIDTH}
            barWidth={innerWidth}
          />
        ))}
      </div>

      {/* spacer so the last row doesn't sit flush against the pane bottom */}
      <div style={{ height: 40 }} />

      {/* Don't highlight unused variable */}
      <input type="hidden" value={roots.length} readOnly />
    </div>
  );
}

function WaterfallRow({
  node,
  totalMs,
  selected,
  collapsed,
  hasChildren,
  onToggle,
  onClick,
  nameWidth,
  barWidth,
}: {
  node: SpanNode;
  totalMs: number;
  selected: boolean;
  collapsed: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onClick: () => void;
  nameWidth: number;
  barWidth: number;
}) {
  const meta = metaForSpanType(node.spanType);
  const startPct = Math.max(0, (node.startOffsetMs / totalMs) * 100);
  // Minimum visible width: 2px so events and microsecond spans are discoverable.
  const widthPct = Math.max(
    0.3,
    (Math.max(node.durationMs, 0) / totalMs) * 100,
  );
  const errored = !!node.errorInfo?.message;

  const indentPx = 10 + node.depth * 14;
  const label =
    node.name ||
    `${meta.label} ${node.entityName ?? node.entityId ?? ''}`.trim();

  return (
    <div
      className={`flex items-center border-b border-slate-900/80 hover:bg-slate-800/40 cursor-pointer ${
        selected ? 'bg-indigo-500/10' : ''
      }`}
      style={{ height: ROW_HEIGHT }}
      onClick={onClick}
    >
      {/* Tree name column */}
      <div
        className="shrink-0 h-full flex items-center overflow-hidden"
        style={{ width: nameWidth, paddingLeft: indentPx, paddingRight: 6 }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`mr-1 w-3 text-slate-500 hover:text-slate-200 text-[10px] ${
            hasChildren ? '' : 'invisible'
          }`}
        >
          {collapsed ? '▸' : '▾'}
        </button>
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${meta.color}`}
        />
        <span className="truncate text-slate-200" title={label}>
          {label}
        </span>
      </div>

      {/* Bar area */}
      <div
        className="relative h-full flex items-center"
        style={{ width: barWidth }}
      >
        <div
          className={`absolute top-1 bottom-1 ${errored ? 'bg-rose-500' : meta.color} rounded-sm transition-opacity ${
            selected ? 'opacity-100' : 'opacity-80'
          }`}
          style={{
            left: `${startPct}%`,
            width: `${widthPct}%`,
            minWidth: 2,
          }}
          title={`${node.name}\n${formatDuration(node.durationMs)}`}
        />
        {/* Duration label just right of the bar when there's room */}
        <span
          className="absolute text-[10px] text-slate-400 whitespace-nowrap pointer-events-none"
          style={{
            left: `calc(${startPct + widthPct}% + 4px)`,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {formatDuration(node.durationMs)}
        </span>
      </div>
    </div>
  );
}
