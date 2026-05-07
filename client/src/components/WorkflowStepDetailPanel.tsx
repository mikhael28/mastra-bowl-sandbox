import { useEffect } from 'react';
import { StepRunState } from './WorkflowGraph';

interface Props {
  open: boolean;
  stepId: string | null;
  status: StepRunState;
  output?: unknown;
  suspendPayload?: unknown;
  iterations?: number;
  onClose: () => void;
}

export function WorkflowStepDetailPanel({
  open,
  stepId,
  status,
  output,
  suspendPayload,
  iterations,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden
      />
      <aside
        className={`fixed right-0 top-12 bottom-0 w-[420px] max-w-[90vw] bg-slate-950 border-l border-slate-800 z-50 flex flex-col transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <header className="border-b border-slate-800 px-4 py-3 flex items-center gap-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Step
          </div>
          <div className="text-sm font-mono text-slate-100 truncate flex-1" title={stepId ?? ''}>
            {stepId ?? '—'}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg leading-none px-1"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
          <StatusPill status={status} />
          {iterations != null && iterations > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
              ↻ {iterations} iterations
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {status === 'idle' && (
            <div className="text-sm text-slate-500">
              This step hasn&apos;t started yet.
            </div>
          )}

          {suspendPayload !== undefined && (
            <Section label="Suspend payload">
              <JsonBlock value={suspendPayload} />
            </Section>
          )}

          {output !== undefined ? (
            <Section label="Output">
              <JsonBlock value={output} />
            </Section>
          ) : status === 'running' ? (
            <div className="text-sm text-indigo-300/80">
              Step is running — output will appear here when it finishes.
            </div>
          ) : status === 'completed' ? (
            <div className="text-sm text-slate-500">
              Step completed but emitted no output.
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  let text: string;
  try {
    text =
      typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  } catch {
    text = String(value);
  }
  return (
    <pre className="bg-slate-900 border border-slate-800 rounded p-2 text-[11px] whitespace-pre-wrap break-all max-h-[60vh] overflow-auto text-slate-200">
      {text}
    </pre>
  );
}

function StatusPill({ status }: { status: StepRunState }) {
  const palette: Record<StepRunState, { bg: string; text: string; border: string }> = {
    idle: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' },
    running: { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/40' },
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    suspended: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/40' },
    failed: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/40' },
  };
  const p = palette[status];
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-mono ${p.bg} ${p.text} ${p.border}`}
    >
      {status}
    </span>
  );
}
