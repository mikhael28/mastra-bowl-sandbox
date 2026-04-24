import { Band, Lane, parseStepGraph } from '../lib/workflow-graph';

export type StepRunState =
  | 'idle'
  | 'running'
  | 'completed'
  | 'suspended'
  | 'failed';

interface Props {
  stepGraph: unknown;
  /** Status per step id — `undefined` means idle. */
  stepStatus: Record<string, StepRunState>;
  /** Optional iteration count for loop steps. */
  loopIterations?: Record<string, number>;
  /** Output per step id (shown as a preview under completed nodes). */
  stepOutputs?: Record<string, unknown>;
  onStepClick?: (stepId: string) => void;
}

/**
 * Vertical band-based workflow graph. Each band is either a single node,
 * a parallel fork, or a conditional branch. Loops render as a single node
 * with a "↻" badge and iteration count.
 *
 * We don't use react-flow — the layout is always a stack of bands, so a
 * flex-column of Tailwind boxes reads cleanly and scales with the workflow.
 */
export function WorkflowGraph({
  stepGraph,
  stepStatus,
  loopIterations = {},
  stepOutputs = {},
  onStepClick,
}: Props) {
  const bands = parseStepGraph(stepGraph);

  if (bands.length === 0) {
    return (
      <div className="text-sm text-slate-500 p-4">
        This workflow has no serialized step graph. It may be a processor
        workflow or an older version.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-1">
      {bands.map((band, i) => (
        <BandRenderer
          key={i}
          band={band}
          isFirst={i === 0}
          isLast={i === bands.length - 1}
          stepStatus={stepStatus}
          loopIterations={loopIterations}
          stepOutputs={stepOutputs}
          onStepClick={onStepClick}
        />
      ))}
    </div>
  );
}

function BandRenderer({
  band,
  isFirst,
  isLast,
  stepStatus,
  loopIterations,
  stepOutputs,
  onStepClick,
}: {
  band: Band;
  isFirst: boolean;
  isLast: boolean;
  stepStatus: Record<string, StepRunState>;
  loopIterations: Record<string, number>;
  stepOutputs: Record<string, unknown>;
  onStepClick?: (stepId: string) => void;
}) {
  // Incoming connector: vertical bar from the previous band into this one.
  const incoming = !isFirst && (
    <div className="flex justify-center" aria-hidden>
      <div className="w-px h-4 bg-slate-700" />
    </div>
  );
  // Outgoing connector: vertical bar out of this band.
  const outgoing = !isLast && (
    <div className="flex justify-center" aria-hidden>
      <div className="w-px h-4 bg-slate-700" />
    </div>
  );

  if (band.kind === 'single') {
    return (
      <>
        {incoming}
        <div className="flex justify-center">
          <LaneCard
            lane={band.lane}
            status={stepStatus[band.lane.step.id] ?? 'idle'}
            iterations={loopIterations[band.lane.step.id]}
            output={stepOutputs[band.lane.step.id]}
            onClick={onStepClick}
          />
        </div>
        {outgoing}
      </>
    );
  }

  // Parallel or branch: fork → lanes → merge.
  const kind = band.kind;
  const label =
    kind === 'parallel' ? '┤ parallel ├' : '◇ branch';
  const labelColor =
    kind === 'parallel'
      ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
      : 'text-teal-300 bg-teal-500/10 border-teal-500/30';

  return (
    <>
      {incoming}
      {/* Fork header */}
      <div className="flex justify-center">
        <div
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${labelColor}`}
        >
          {label}
        </div>
      </div>
      {/* Vertical connector into the fork */}
      <div className="flex justify-center" aria-hidden>
        <div className="w-px h-3 bg-slate-700" />
      </div>

      {/* Horizontal bar spanning all lanes */}
      <ForkBar count={band.lanes.length} />

      {/* Lanes themselves */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${band.lanes.length}, minmax(0, 1fr))` }}>
        {band.lanes.map((lane, i) => (
          <div key={`${lane.step.id}-${i}`} className="flex flex-col items-center">
            {kind === 'branch' && (
              <div className="text-[10px] text-slate-500 italic mb-1 font-mono text-center px-2 truncate max-w-full" title={band.conditions[i]}>
                if {band.conditions[i] || '—'}
              </div>
            )}
            {/* short vertical connector down to the node */}
            <div className="w-px h-2 bg-slate-700" />
            <LaneCard
              lane={lane}
              status={stepStatus[lane.step.id] ?? 'idle'}
              iterations={loopIterations[lane.step.id]}
              output={stepOutputs[lane.step.id]}
              onClick={onStepClick}
            />
          </div>
        ))}
      </div>

      {/* Merge bar + connector back to the trunk (skip if last band) */}
      {!isLast && (
        <>
          <ForkBar count={band.lanes.length} reverse />
          <div className="flex justify-center" aria-hidden>
            <div className="w-px h-3 bg-slate-700" />
          </div>
        </>
      )}
    </>
  );
}

function ForkBar({ count, reverse = false }: { count: number; reverse?: boolean }) {
  if (count < 2) return null;
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => {
        const isFirst = i === 0;
        const isLast = i === count - 1;
        return (
          <div key={i} className="h-3 flex items-center">
            {/* Draw only the horizontal and the tee:
                - interior lanes: full horizontal bar
                - first lane: right-half
                - last lane: left-half */}
            <div
              className={`h-px bg-slate-700 ${
                isFirst ? 'w-1/2 ml-auto' : isLast ? 'w-1/2 mr-auto' : 'w-full'
              }`}
            />
          </div>
        );
      })}
      <div className="sr-only">{reverse ? 'merge' : 'fork'}</div>
    </div>
  );
}

function LaneCard({
  lane,
  status,
  iterations,
  output,
  onClick,
}: {
  lane: Lane;
  status: StepRunState;
  iterations?: number;
  output?: unknown;
  onClick?: (stepId: string) => void;
}) {
  const step = lane.step;
  const isLoop = lane.kind === 'loop';

  const palette = paletteForStatus(status);
  const clickable = !!onClick;
  const outputPreview = formatOutputPreview(output);

  return (
    <button
      onClick={clickable ? () => onClick!(step.id) : undefined}
      disabled={!clickable}
      className={`text-left w-full max-w-[280px] rounded-md border p-2 transition-colors ${palette.bg} ${palette.border} ${
        clickable ? 'hover:brightness-125 cursor-pointer' : 'cursor-default'
      } ${status === 'running' ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        {isLoop && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
            ↻ {lane.loopType ?? 'loop'}
            {iterations != null && iterations > 0 ? ` · ${iterations}` : ''}
          </span>
        )}
        {step.canSuspend && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            ⏸ suspendable
          </span>
        )}
        <span className={`ml-auto text-[9px] uppercase tracking-wider ${palette.textOn}`}>
          {status}
        </span>
      </div>
      <div className={`text-[13px] font-mono font-medium truncate ${palette.title}`}>
        {step.id}
      </div>
      {step.description && (
        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
          {step.description}
        </div>
      )}
      {isLoop && lane.condition && (
        <div className="mt-1 text-[10px] text-slate-500 font-mono truncate" title={lane.condition}>
          until {lane.condition}
        </div>
      )}
      {outputPreview && (
        <div className="mt-1 text-[10px] text-emerald-300/80 font-mono truncate" title={outputPreview}>
          → {outputPreview}
        </div>
      )}
    </button>
  );
}

function paletteForStatus(status: StepRunState) {
  switch (status) {
    case 'running':
      return {
        bg: 'bg-indigo-500/15',
        border: 'border-indigo-500/60',
        title: 'text-indigo-100',
        textOn: 'text-indigo-300',
      };
    case 'completed':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/40',
        title: 'text-emerald-100',
        textOn: 'text-emerald-300',
      };
    case 'suspended':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/40',
        title: 'text-amber-100',
        textOn: 'text-amber-300',
      };
    case 'failed':
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/40',
        title: 'text-rose-100',
        textOn: 'text-rose-300',
      };
    default:
      return {
        bg: 'bg-slate-900',
        border: 'border-slate-800',
        title: 'text-slate-200',
        textOn: 'text-slate-500',
      };
  }
}

function formatOutputPreview(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v.length > 80 ? v.slice(0, 80) + '…' : v;
  try {
    const s = JSON.stringify(v);
    return s.length > 80 ? s.slice(0, 80) + '…' : s;
  } catch {
    return '';
  }
}
