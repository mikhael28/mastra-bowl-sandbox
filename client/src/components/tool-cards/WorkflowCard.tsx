import { useEffect, useRef, useState } from 'react';
import { PrimitiveBadge } from '../PrimitiveBadge';
import { ToolCardProps, statusColor, unwrap, safeStringify } from './types';
import { getWorkflowRun, listWorkflowRuns } from '../../lib/mastraClient';

/**
 * When the parent agent calls a workflow-as-tool, the chat stream only shows
 * the wrapping tool call. The workflow itself has an ordered DAG of steps —
 * and those are the whole *point* of the workflow primitive. This card
 * fetches the stored run from `/api/workflows/:id/runs/:runId` once the call
 * completes and renders each step's status, input, and output.
 *
 * Teaching:
 *   • Workflows are DAGs, not single-blob pipelines — show the shape.
 *   • Each step's input/output is typed (Zod), so it can be introspected.
 *   • Suspended steps (HITL) are visible; status colors reflect state.
 */
export function WorkflowCard(props: ToolCardProps) {
  const { tc, onTeach } = props;
  const workflowId = tc.toolName;
  const result = unwrap(tc.result) as any;

  // The result.runId is only available once the call completes. While the tool
  // is `calling` we discover the runId by polling /api/workflows/:id/runs and
  // picking the most recent run that started after this card mounted.
  const resultRunId: string | undefined =
    result?.runId ?? result?.workflowRunId ?? result?.id;
  const [discoveredRunId, setDiscoveredRunId] = useState<string | null>(null);
  const runId = resultRunId ?? discoveredRunId ?? undefined;

  const [run, setRun] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const mountTimeRef = useRef<number>(Date.now());

  // Discover the runId while the tool call is still in flight by sampling the
  // workflow's run list. Mastra writes a snapshot when each run is created.
  useEffect(() => {
    if (runId) return;
    if (tc.status !== 'calling') return;
    let alive = true;
    let cancelled = false;
    const startedAt = mountTimeRef.current;

    async function tick() {
      while (alive && !cancelled) {
        try {
          const runs = await listWorkflowRuns(workflowId);
          // Pick the freshest run that postdates this card. Allow a small
          // skew to absorb clock differences between client and server.
          const candidate = runs
            .map((r: any) => ({
              runId: r.runId ?? r.id,
              ts: new Date(r.createdAt ?? r.created_at ?? 0).getTime(),
              status: r.status,
            }))
            .filter((r) => r.runId && r.ts >= startedAt - 5_000)
            .sort((a, b) => b.ts - a.ts)[0];
          if (candidate?.runId && alive) {
            setDiscoveredRunId(candidate.runId);
            return;
          }
        } catch {
          /* swallow — try again next tick */
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    tick();
    return () => {
      alive = false;
      cancelled = true;
    };
  }, [workflowId, runId, tc.status]);

  // Once we know the runId, poll the run snapshot. Stop when the tool is done
  // and we've fetched at least one final snapshot (so progress stays on screen).
  useEffect(() => {
    const id = runId;
    if (!id) return;
    let alive = true;
    let cancelled = false;

    async function tick() {
      while (alive && !cancelled) {
        if (!run) setLoading(true);
        try {
          const r = await getWorkflowRun(workflowId, id!);
          if (!alive) return;
          setRun(r);
          if (tc.status === 'done') return;
        } catch {
          /* swallow */
        } finally {
          if (alive) setLoading(false);
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    tick();
    return () => {
      alive = false;
      cancelled = true;
    };
  }, [workflowId, runId, tc.status]);

  const steps = extractSteps(run ?? result);

  return (
    <div className={`mt-2 border rounded p-2 text-xs ${statusColor(tc.status)}`}>
      <div className="flex items-center gap-2">
        <PrimitiveBadge primitive="workflow" onTeach={onTeach} compact />
        <span className="font-mono text-slate-200 truncate">{workflowId}</span>
        <span className="ml-auto text-[10px] text-slate-400">{tc.status}</span>
      </div>

      {tc.status === 'calling' && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-300/80 italic">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
          {steps.length > 0
            ? `running — ${steps.filter((s) => s.status === 'completed').length}/${steps.length} steps complete`
            : runId
              ? 'running — waiting for first step snapshot…'
              : 'starting workflow run…'}
        </div>
      )}

      {steps.length > 0 && (
        <ol className="mt-2 space-y-1">
          {steps.map((s, i) => (
            <StepRow key={`${s.id}-${i}`} step={s} index={i} />
          ))}
        </ol>
      )}

      {tc.status === 'done' && steps.length === 0 && (
        <div className="mt-2 text-[11px] text-slate-500">
          {loading ? 'loading run details…' : 'Workflow completed. Run snapshot unavailable — see raw output below.'}
        </div>
      )}

      {result && steps.length === 0 && tc.status === 'done' && (
        <details className="mt-2">
          <summary className="text-[10px] text-slate-500 cursor-pointer">
            raw result
          </summary>
          <pre className="mt-1 bg-slate-950 rounded p-2 text-[11px] whitespace-pre-wrap break-all max-h-56 overflow-auto">
            {safeStringify(result)}
          </pre>
        </details>
      )}

      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
        <button
          onClick={() => onTeach('workflow')}
          className="shrink-0 text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
        >
          learn →
        </button>
        <span>
          A workflow is a typed DAG of steps (then / parallel / branch /
          dountil). Each step output is stored so failed runs can be resumed.
        </span>
      </div>
    </div>
  );
}

type StepView = {
  id: string;
  status: 'running' | 'completed' | 'suspended' | 'failed' | 'skipped';
  output?: unknown;
  input?: unknown;
  startedAt?: string;
  endedAt?: string;
};

function extractSteps(runOrResult: any): StepView[] {
  if (!runOrResult) return [];
  // Run snapshot shape (varies across Mastra versions)
  const snapshot =
    runOrResult.snapshot ??
    runOrResult.run?.snapshot ??
    runOrResult.runtimeContext ??
    runOrResult;

  const rawSteps =
    snapshot?.context?.steps ??
    snapshot?.steps ??
    snapshot?.stepResults ??
    runOrResult?.stepResults ??
    null;

  if (rawSteps && typeof rawSteps === 'object' && !Array.isArray(rawSteps)) {
    return Object.entries(rawSteps).map(([id, raw]) => normalizeStep(id, raw));
  }
  if (Array.isArray(rawSteps)) {
    return rawSteps.map((s, i) => normalizeStep(s.id ?? s.stepId ?? `step-${i}`, s));
  }
  return [];
}

function normalizeStep(id: string, raw: any): StepView {
  const status: StepView['status'] =
    raw?.status === 'success' || raw?.status === 'completed'
      ? 'completed'
      : raw?.status === 'suspended'
        ? 'suspended'
        : raw?.status === 'failed' || raw?.status === 'error'
          ? 'failed'
          : raw?.status === 'skipped'
            ? 'skipped'
            : 'running';
  return {
    id,
    status,
    output: raw?.output ?? raw?.result,
    input: raw?.input ?? raw?.payload,
    startedAt: raw?.startedAt,
    endedAt: raw?.endedAt,
  };
}

function StepRow({ step, index }: { step: StepView; index: number }) {
  // Default-open while running and once a terminal state arrives (so outputs
  // are visible at the end of the workflow without an extra click). Users can
  // collapse manually; we don't fight that.
  const [open, setOpen] = useState<boolean>(
    step.status === 'running' || step.output !== undefined,
  );
  const touchedRef = useRef(false);
  useEffect(() => {
    if (touchedRef.current) return;
    if (
      step.output !== undefined ||
      step.status === 'completed' ||
      step.status === 'failed' ||
      step.status === 'suspended'
    ) {
      setOpen(true);
    }
  }, [step.output, step.status]);
  const icon: Record<StepView['status'], string> = {
    running: '◐',
    completed: '✓',
    suspended: '⏸',
    failed: '✗',
    skipped: '↷',
  };
  const color: Record<StepView['status'], string> = {
    running: 'text-amber-300',
    completed: 'text-emerald-300',
    suspended: 'text-amber-300',
    failed: 'text-rose-300',
    skipped: 'text-slate-500',
  };
  return (
    <li className="border border-slate-800 rounded bg-slate-900/40 text-[11px]">
      <button
        onClick={() => {
          touchedRef.current = true;
          setOpen((o) => !o);
        }}
        className="w-full flex items-center gap-2 px-2 py-1 text-left"
      >
        <span className="text-slate-600 font-mono w-4 text-right">
          {index + 1}
        </span>
        <span className={`font-mono w-4 ${color[step.status]}`}>
          {icon[step.status]}
        </span>
        <span className="font-mono text-slate-200 truncate">{step.id}</span>
        <span className={`ml-auto text-[10px] ${color[step.status]}`}>
          {step.status}
        </span>
      </button>
      {open && (
        <div className="px-3 pb-2 space-y-1">
          {step.input !== undefined && (
            <>
              <div className="text-[10px] uppercase text-slate-500">input</div>
              <pre className="bg-slate-950 rounded p-2 text-[10px] whitespace-pre-wrap break-all max-h-24 overflow-auto">
                {safeStringify(step.input)}
              </pre>
            </>
          )}
          {step.output !== undefined && (
            <>
              <div className="text-[10px] uppercase text-slate-500">output</div>
              <pre className="bg-slate-950 rounded p-2 text-[10px] whitespace-pre-wrap break-all max-h-36 overflow-auto">
                {safeStringify(step.output)}
              </pre>
            </>
          )}
        </div>
      )}
    </li>
  );
}
