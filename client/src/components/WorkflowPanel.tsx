import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  WorkflowSummary,
  streamWorkflow,
  resumeWorkflow,
  getWorkflow,
  Chunk,
} from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';
import { WorkflowGraph, StepRunState } from './WorkflowGraph';
import { WorkflowStepDetailPanel } from './WorkflowStepDetailPanel';

interface Props {
  workflows: WorkflowSummary[];
  onTeach: (id: PrimitiveId) => void;
  /** Bumped after every finished workflow run so other panels refresh. */
  onRunFinished?: () => void;
  /** Deep-link into Observability for this run. */
  onViewTrace?: (runId: string) => void;
}

type StepEntry = {
  stepId: string;
  status: 'running' | 'completed' | 'suspended' | 'failed';
  output?: unknown;
  suspendPayload?: unknown;
  /** How many times this step has entered 'running' (for dountil loops). */
  iterations?: number;
};

type RunState = {
  runId?: string;
  workflowId: string;
  steps: StepEntry[];
  final?: unknown;
  suspendedAtStep?: string;
  suspendedPayload?: any;
  error?: string;
};

const INPUT_TEMPLATES: Record<string, string> = {
  'tech-touchdown-workflow': JSON.stringify(
    { sportsTopic: 'NBA playoffs', aiTopic: 'open source LLMs' },
    null,
    2,
  ),
  'deep-search': JSON.stringify(
    { initialQuery: 'best durable execution engines in 2026' },
    null,
    2,
  ),
  'rag-workflow': JSON.stringify(
    { query: 'what is a Mastra workflow?', collectionId: 'mastra-docs' },
    null,
    2,
  ),
  'triage-workflow': JSON.stringify({ repo: 'mastra-ai/mastra' }, null, 2),
};

export function WorkflowPanel({
  workflows,
  onTeach,
  onRunFinished,
  onViewTrace,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    workflows[0]?.id ?? null,
  );
  const [inputJson, setInputJson] = useState('');
  const [run, setRun] = useState<RunState | null>(null);
  const [running, setRunning] = useState(false);
  const [resumeText, setResumeText] = useState('');
  /** Full workflow record (fetched) — has stepGraph, steps, etc. */
  const [detail, setDetail] = useState<any | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const selected = useMemo(
    () => workflows.find((w) => w.id === selectedId) ?? null,
    [workflows, selectedId],
  );

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let alive = true;
    getWorkflow(selectedId).then((d) => {
      if (alive) setDetail(d);
    });
    return () => {
      alive = false;
    };
  }, [selectedId]);

  useEffect(() => {
    if (selectedId && INPUT_TEMPLATES[selectedId]) {
      setInputJson(INPUT_TEMPLATES[selectedId]);
    } else {
      setInputJson('{\n  \n}');
    }
    setRun(null);
    setResumeText('');
    setSelectedStepId(null);
  }, [selectedId]);

  async function start() {
    if (!selected) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(inputJson);
    } catch (e: any) {
      setRun({
        workflowId: selected.id,
        steps: [],
        error: `Bad JSON: ${e.message}`,
      });
      return;
    }
    setRun({ workflowId: selected.id, steps: [] });
    setRunning(true);
    const startedAt = Date.now();
    const ctl = new AbortController();
    abortRef.current = ctl;
    let runtimeError: string | null = null;
    let suspended = false;
    try {
      const stream = streamWorkflow(
        selected.id,
        { inputData: parsed, closeOnSuspend: true },
        ctl.signal,
      );
      for await (const chunk of stream) {
        applyWorkflowChunk(chunk, setRun);
      }
    } catch (err: any) {
      runtimeError = String(err?.message ?? err);
      setRun((r) => (r ? { ...r, error: runtimeError! } : r));
    } finally {
      setRunning(false);
      abortRef.current = null;
      onRunFinished?.();
      const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
      // Read the latest run snapshot to decide which toast to fire. We use a
      // setRun callback to avoid a stale closure over `run`.
      setRun((r) => {
        if (r?.suspendedAtStep) suspended = true;
        const errMsg = runtimeError ?? r?.error;
        if (errMsg) {
          toast.error(`${selected.id} failed`, { description: errMsg });
        } else if (suspended) {
          toast.warning(`${selected.id} suspended`, {
            description: `Paused at step "${r?.suspendedAtStep}" — provide input to resume.`,
          });
        } else {
          toast.success(`${selected.id} completed`, {
            description: `Finished in ${seconds}s`,
          });
        }
        return r;
      });
    }
  }

  function stop() {
    abortRef.current?.abort();
    setRunning(false);
  }

  async function doResume() {
    if (!selected || !run?.runId || !run.suspendedAtStep) return;
    setRunning(true);
    try {
      const result = await resumeWorkflow(selected.id, {
        runId: run.runId,
        step: run.suspendedAtStep,
        resumeData: { clarifiedIntent: resumeText },
      });
      setRun((r) =>
        r
          ? {
              ...r,
              suspendedAtStep: undefined,
              suspendedPayload: undefined,
              final: result,
            }
          : r,
      );
      setResumeText('');
    } catch (err: any) {
      setRun((r) =>
        r ? { ...r, error: String(err?.message ?? err) } : r,
      );
    } finally {
      setRunning(false);
    }
  }

  if (workflows.length === 0) {
    return (
      <div className="flex-1 p-6 text-sm text-slate-400">
        No workflows registered.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden scan-lines">
      <header
        className="p-4 flex items-center gap-3"
        style={{
          borderBottom: '1px solid rgba(108, 230, 248, 0.22)',
          background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.5), rgba(2, 14, 20, 0.25))',
        }}
      >
        <div>
          <div className="holo-eyebrow">// MODULE 03</div>
          <h2 className="holo-title text-base mt-0.5">WORKFLOW</h2>
        </div>
        <select
          value={selectedId ?? ''}
          onChange={(e) => setSelectedId(e.target.value)}
          className="px-2 py-1.5 text-sm font-mono"
          style={{ background: 'rgba(2, 14, 20, 0.7)', border: '1px solid rgba(108, 230, 248, 0.3)', color: '#cdf2fb' }}
        >
          {workflows.map((w) => (
            <option key={w.id} value={w.id}>
              {w.id}
            </option>
          ))}
        </select>
        <PrimitiveBadge primitive="workflow" onTeach={onTeach} compact />
        {selectedId?.includes('rag') || selectedId === 'deep-search' ? (
          <PrimitiveBadge
            primitive="workflow-suspend"
            onTeach={onTeach}
            compact
          />
        ) : null}
        {selected?.description && (
          <div className="text-xs holo-readout truncate" style={{ color: 'rgba(170, 246, 255, 0.7)' }}>
            // {selected.description}
          </div>
        )}
      </header>

      <div className="flex-1 overflow-hidden flex">
        <div className="w-1/2 border-r border-slate-800 p-4 overflow-y-auto">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Input (JSON)
          </div>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            rows={10}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono focus:outline-none focus:border-indigo-500/60"
          />
          <div className="mt-3 flex gap-2">
            {running ? (
              <button
                onClick={stop}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-sm rounded"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={start}
                disabled={!selected}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-sm rounded"
              >
                Start workflow
              </button>
            )}
          </div>

          <div className="mt-6 text-[11px] text-slate-500 leading-relaxed">
            POST /api/workflows/{selectedId}/stream →{' '}
            <span className="font-mono">inputData</span> is validated against
            the workflow&apos;s Zod schema on the server.
          </div>

          <StepOutputFeed
            steps={run?.steps ?? []}
            selectedStepId={selectedStepId}
            onSelect={(id) => setSelectedStepId(id)}
            running={running}
          />
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs uppercase tracking-wider text-slate-500 flex-1">
              Run graph
            </div>
            {run?.runId && onViewTrace && (
              <button
                onClick={() => onViewTrace(run.runId!)}
                className="text-[11px] text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
                title="Open this run in the Observability tab"
              >
                view trace ↗
              </button>
            )}
          </div>
          {!run && !detail && (
            <div className="text-sm text-slate-500">
              Hit &quot;Start workflow&quot; to see steps as they execute.
            </div>
          )}

          {run?.error && (
            <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 mb-3">
              {run.error}
            </div>
          )}

          {detail?.stepGraph && (
            <WorkflowGraph
              stepGraph={detail.stepGraph}
              stepStatus={stepStatusMap(run?.steps ?? [])}
              loopIterations={loopIterationsMap(run?.steps ?? [])}
              stepOutputs={stepOutputsMap(run?.steps ?? [])}
              selectedStepId={selectedStepId}
              onStepClick={(id) => setSelectedStepId(id)}
            />
          )}

          {run?.suspendedAtStep && (
            <div className="mt-4 p-3 rounded border border-amber-500/40 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <PrimitiveBadge
                  primitive="workflow-suspend"
                  onTeach={onTeach}
                  compact
                />
                <div className="text-sm font-medium text-amber-200">
                  Workflow paused at step {run.suspendedAtStep}
                </div>
              </div>
              {run.suspendedPayload?.assistantMessage && (
                <pre className="text-xs whitespace-pre-wrap bg-slate-950 p-2 rounded mb-2">
                  {run.suspendedPayload.assistantMessage}
                </pre>
              )}
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={3}
                placeholder="Your answers / clarified intent..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs"
              />
              <button
                onClick={doResume}
                disabled={running || !resumeText.trim()}
                className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-xs rounded"
              >
                Resume workflow
              </button>
            </div>
          )}

          {run?.final !== undefined && (
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                Final output
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded p-2 text-[11px] whitespace-pre-wrap break-all max-h-96 overflow-auto">
                {safe(run.final)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <WorkflowStepDetailPanel
        open={selectedStepId !== null}
        stepId={selectedStepId}
        status={
          (selectedStepId &&
            run?.steps.find((s) => s.stepId === selectedStepId)?.status) ||
          'idle'
        }
        output={
          selectedStepId
            ? run?.steps.find((s) => s.stepId === selectedStepId)?.output
            : undefined
        }
        suspendPayload={
          selectedStepId
            ? run?.steps.find((s) => s.stepId === selectedStepId)
                ?.suspendPayload
            : undefined
        }
        iterations={
          selectedStepId
            ? run?.steps.find((s) => s.stepId === selectedStepId)?.iterations
            : undefined
        }
        onClose={() => setSelectedStepId(null)}
      />
    </div>
  );
}

function safe(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function StepOutputFeed({
  steps,
  selectedStepId,
  onSelect,
  running,
}: {
  steps: StepEntry[];
  selectedStepId: string | null;
  onSelect: (id: string) => void;
  running: boolean;
}) {
  if (steps.length === 0) {
    return null;
  }
  return (
    <div className="mt-6">
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
        <span>Step outputs</span>
        {running && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        )}
        <span className="ml-auto text-[10px] font-mono text-slate-600">
          {steps.filter((s) => s.status === 'completed').length}/{steps.length}
        </span>
      </div>
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <StepOutputRow
            key={`${s.stepId}-${i}`}
            entry={s}
            index={i}
            selected={selectedStepId === s.stepId}
            onClick={() => onSelect(s.stepId)}
          />
        ))}
      </ol>
    </div>
  );
}

function StepOutputRow({
  entry,
  index,
  selected,
  onClick,
}: {
  entry: StepEntry;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const [expanded, setExpanded] = useState(
    entry.status === 'running' || entry.status === 'suspended',
  );
  const userToggledRef = useRef(false);

  // Auto-expand on output arrival or once the step reaches a terminal state.
  // We skip auto-expansion if the user has explicitly toggled the row, so
  // their preference sticks once the workflow finishes.
  useEffect(() => {
    if (userToggledRef.current) return;
    if (entry.output !== undefined) {
      setExpanded(true);
      return;
    }
    if (
      entry.status === 'completed' ||
      entry.status === 'failed' ||
      entry.status === 'suspended'
    ) {
      setExpanded(true);
    }
  }, [entry.output, entry.status]);

  const palette = stepRowPalette(entry.status);
  const icon =
    entry.status === 'running'
      ? '◐'
      : entry.status === 'completed'
        ? '✓'
        : entry.status === 'suspended'
          ? '⏸'
          : entry.status === 'failed'
            ? '✗'
            : '·';

  return (
    <li
      className={`rounded border ${palette.border} ${palette.bg} ${
        selected ? 'ring-1 ring-sky-400/70' : ''
      }`}
    >
      <button
        onClick={() => {
          userToggledRef.current = true;
          setExpanded((e) => !e);
          onClick();
        }}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
      >
        <span className="font-mono text-[10px] text-slate-600 w-4 text-right">
          {index + 1}
        </span>
        <span className={`font-mono w-4 text-center ${palette.icon}`}>
          {icon}
        </span>
        <span className="font-mono text-[12px] text-slate-100 truncate flex-1">
          {entry.stepId}
        </span>
        {entry.iterations != null && entry.iterations > 1 && (
          <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10">
            ↻ {entry.iterations}
          </span>
        )}
        <span className={`text-[10px] uppercase tracking-wider ${palette.icon}`}>
          {entry.status}
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-2 pt-0">
          {entry.output !== undefined ? (
            <pre className="bg-slate-950 border border-slate-800 rounded p-2 text-[10px] whitespace-pre-wrap break-all max-h-48 overflow-auto text-slate-200">
              {safe(entry.output)}
            </pre>
          ) : entry.status === 'running' ? (
            <div className="text-[11px] text-indigo-300/80 italic">
              running — output will appear here when the step finishes…
            </div>
          ) : entry.status === 'suspended' ? (
            <div className="text-[11px] text-amber-300/80 italic">
              suspended, awaiting resume input.
            </div>
          ) : entry.status === 'completed' ? (
            <div className="text-[11px] text-slate-500 italic">
              completed with no output.
            </div>
          ) : null}
        </div>
      )}
    </li>
  );
}

function stepRowPalette(status: StepEntry['status']) {
  switch (status) {
    case 'running':
      return {
        bg: 'bg-indigo-500/10 animate-pulse',
        border: 'border-indigo-500/40',
        icon: 'text-indigo-300',
      };
    case 'completed':
      return {
        bg: 'bg-emerald-500/5',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-300',
      };
    case 'suspended':
      return {
        bg: 'bg-amber-500/5',
        border: 'border-amber-500/30',
        icon: 'text-amber-300',
      };
    case 'failed':
      return {
        bg: 'bg-rose-500/5',
        border: 'border-rose-500/30',
        icon: 'text-rose-300',
      };
    default:
      return {
        bg: 'bg-slate-900/40',
        border: 'border-slate-800',
        icon: 'text-slate-400',
      };
  }
}

function stepStatusMap(steps: StepEntry[]): Record<string, StepRunState> {
  const out: Record<string, StepRunState> = {};
  for (const s of steps) out[s.stepId] = s.status;
  return out;
}

function loopIterationsMap(steps: StepEntry[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of steps) if (s.iterations) out[s.stepId] = s.iterations;
  return out;
}

function stepOutputsMap(steps: StepEntry[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const s of steps) if (s.output !== undefined) out[s.stepId] = s.output;
  return out;
}

function applyWorkflowChunk(
  chunk: Chunk,
  setRun: React.Dispatch<React.SetStateAction<RunState | null>>,
) {
  // Workflow streams use step-related chunks + occasional watch / suspend.
  // The actual shape varies between versions, so we try to be generous.
  const type = chunk.type;
  setRun((run) => {
    if (!run) return run;
    const maybeStepId =
      chunk.payload?.stepId ??
      chunk.payload?.id ??
      chunk.stepId ??
      chunk.payload?.output?.stepId;

    if (chunk.runId && !run.runId) {
      run = { ...run, runId: chunk.runId };
    }

    switch (type) {
      case 'step-start':
      case 'workflow-step-start': {
        if (!maybeStepId) return run;
        const already = run.steps.find((s) => s.stepId === maybeStepId);
        if (already) {
          // Re-entering a step (e.g. inside a dountil loop) — bump the
          // iteration count, reset status to running, clear prior output.
          return {
            ...run,
            steps: run.steps.map((s) =>
              s.stepId === maybeStepId
                ? {
                    ...s,
                    status: 'running' as const,
                    iterations: (s.iterations ?? 1) + 1,
                    output: undefined,
                  }
                : s,
            ),
          };
        }
        return {
          ...run,
          steps: [
            ...run.steps,
            { stepId: maybeStepId, status: 'running', iterations: 1 },
          ],
        };
      }
      case 'step-finish':
      case 'workflow-step-finish':
      case 'step-output':
      case 'step-result':
      case 'workflow-step-output':
      case 'workflow-step-result': {
        if (!maybeStepId) return run;
        // Mastra's workflow-step-result includes a `status` field — only mark
        // as completed for success; failed/suspended carry their own meaning.
        const reportedStatus = chunk.payload?.status;
        const nextStatus: StepEntry['status'] =
          reportedStatus === 'failed' || reportedStatus === 'error'
            ? 'failed'
            : reportedStatus === 'suspended'
              ? 'suspended'
              : 'completed';
        const stepExists = run.steps.find((s) => s.stepId === maybeStepId);
        const nextSteps = stepExists
          ? run.steps.map((s) =>
              s.stepId === maybeStepId
                ? {
                    ...s,
                    status: nextStatus,
                    output:
                      chunk.payload?.output ??
                      chunk.payload?.result ??
                      s.output,
                  }
                : s,
            )
          : [
              ...run.steps,
              {
                stepId: maybeStepId,
                status: nextStatus,
                iterations: 1,
                output: chunk.payload?.output ?? chunk.payload?.result,
              },
            ];
        return { ...run, steps: nextSteps };
      }
      case 'workflow-step-progress': {
        // Loop iteration just completed — bump iteration count.
        if (!maybeStepId) return run;
        const total = chunk.payload?.completedCount;
        return {
          ...run,
          steps: run.steps.map((s) =>
            s.stepId === maybeStepId
              ? {
                  ...s,
                  iterations:
                    typeof total === 'number' ? total : (s.iterations ?? 1) + 1,
                }
              : s,
          ),
        };
      }
      case 'step-suspend':
      case 'workflow-step-suspend':
      case 'workflow-step-suspended':
      case 'suspend': {
        const stepId = maybeStepId ?? 'unknown';
        const existing = run.steps.find((s) => s.stepId === stepId);
        const updated = existing
          ? run.steps.map((s) =>
              s.stepId === stepId
                ? {
                    ...s,
                    status: 'suspended' as const,
                    suspendPayload: chunk.payload,
                  }
                : s,
            )
          : [
              ...run.steps,
              {
                stepId,
                status: 'suspended' as const,
                suspendPayload: chunk.payload,
              },
            ];
        return {
          ...run,
          steps: updated,
          suspendedAtStep: stepId,
          suspendedPayload: chunk.payload,
        };
      }
      case 'workflow-finish':
      case 'finish': {
        // workflow-finish payload only carries token usage + metadata. The
        // workflow's actual output is the last completed step's output.
        const explicit = chunk.payload?.result ?? chunk.payload?.output;
        const looksLikeUsage =
          explicit &&
          typeof explicit === 'object' &&
          'usage' in (explicit as Record<string, unknown>) &&
          Object.keys(explicit as Record<string, unknown>).length <= 2;
        const last = [...run.steps]
          .reverse()
          .find((s) => s.status === 'completed' && s.output !== undefined);
        return {
          ...run,
          final:
            (looksLikeUsage ? undefined : explicit) ?? last?.output ?? run.final,
        };
      }
      case 'error':
      case 'workflow-error': {
        return {
          ...run,
          error: String(chunk.payload?.error ?? 'workflow error'),
        };
      }
      default:
        return run;
    }
  });
}
