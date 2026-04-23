import { useEffect, useMemo, useRef, useState } from 'react';
import {
  WorkflowSummary,
  streamWorkflow,
  resumeWorkflow,
  Chunk,
} from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';

interface Props {
  workflows: WorkflowSummary[];
  onTeach: (id: PrimitiveId) => void;
}

type StepEntry = {
  stepId: string;
  status: 'running' | 'completed' | 'suspended' | 'failed';
  output?: unknown;
  suspendPayload?: unknown;
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
  'blog-post-workflow': JSON.stringify(
    { topic: 'why local-first software beats SaaS for devs', tone: 'bold' },
    null,
    2,
  ),
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
};

export function WorkflowPanel({ workflows, onTeach }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    workflows[0]?.id ?? null,
  );
  const [inputJson, setInputJson] = useState('');
  const [run, setRun] = useState<RunState | null>(null);
  const [running, setRunning] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const selected = useMemo(
    () => workflows.find((w) => w.id === selectedId) ?? null,
    [workflows, selectedId],
  );

  useEffect(() => {
    if (selectedId && INPUT_TEMPLATES[selectedId]) {
      setInputJson(INPUT_TEMPLATES[selectedId]);
    } else {
      setInputJson('{\n  \n}');
    }
    setRun(null);
    setResumeText('');
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
    const ctl = new AbortController();
    abortRef.current = ctl;
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
      setRun((r) =>
        r ? { ...r, error: String(err?.message ?? err) } : r,
      );
    } finally {
      setRunning(false);
      abortRef.current = null;
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
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header className="border-b border-slate-800 p-4 flex items-center gap-3">
        <select
          value={selectedId ?? ''}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-sm"
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
          <div className="text-xs text-slate-400 truncate">
            {selected.description}
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
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Run timeline
          </div>
          {!run && (
            <div className="text-sm text-slate-500">
              Hit &quot;Start workflow&quot; to see steps as they execute.
            </div>
          )}

          {run?.error && (
            <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">
              {run.error}
            </div>
          )}

          <ol className="space-y-2">
            {run?.steps.map((s, i) => (
              <li
                key={`${s.stepId}-${i}`}
                className={`p-2 rounded border text-xs ${
                  s.status === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : s.status === 'suspended'
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : s.status === 'failed'
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-slate-200">{s.stepId}</div>
                  <div className="text-slate-400">{s.status}</div>
                </div>
                {s.output !== undefined && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-slate-500">
                      output
                    </summary>
                    <pre className="mt-1 bg-slate-950 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all text-[11px]">
                      {safe(s.output)}
                    </pre>
                  </details>
                )}
              </li>
            ))}
          </ol>

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
        if (already) return run;
        return {
          ...run,
          steps: [
            ...run.steps,
            { stepId: maybeStepId, status: 'running' },
          ],
        };
      }
      case 'step-finish':
      case 'workflow-step-finish':
      case 'step-output':
      case 'step-result': {
        if (!maybeStepId) return run;
        return {
          ...run,
          steps: run.steps.map((s) =>
            s.stepId === maybeStepId
              ? {
                  ...s,
                  status: 'completed',
                  output:
                    chunk.payload?.output ??
                    chunk.payload?.result ??
                    s.output,
                }
              : s,
          ),
        };
      }
      case 'step-suspend':
      case 'workflow-step-suspend':
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
        return {
          ...run,
          final: chunk.payload?.output ?? chunk.payload?.result ?? run.final,
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
