import { PrimitiveBadge } from '../PrimitiveBadge';
import { ToolCardProps, statusColor, unwrap } from './types';

/**
 * Terminal-style card for `mastra_workspace_execute_command`. This is the one
 * that turns "the agent ran a shell command" from a JSON blob into a thing
 * that looks like a terminal — stdout, stderr, exit code, pid. It's the most
 * visually dramatic Mastra capability and deserves to look like what it is.
 *
 * Teaches:
 *   • The sandbox is a first-class primitive (Local in dev, E2B in prod).
 *   • Approval gating works the same way as for file writes.
 *   • stdout / stderr / exitCode are standard across both sandboxes.
 */
export function SandboxExecCard(props: ToolCardProps) {
  const { tc, onTeach, onApprove, onDecline, canRespond } = props;
  const args = (tc.args ?? {}) as any;
  const command: string =
    args.command ??
    args.cmd ??
    (Array.isArray(args.argv) ? args.argv.join(' ') : '?');
  const cwd: string | undefined = args.cwd ?? args.workingDirectory;

  const result = unwrap(tc.result) as any;
  const stdout: string = result?.stdout ?? result?.output ?? '';
  const stderr: string = result?.stderr ?? result?.error_output ?? '';
  const exitCode: number | undefined =
    result?.exitCode ?? result?.code ?? result?.status;
  const pid: number | undefined = result?.pid;
  const durationMs: number | undefined = result?.durationMs ?? result?.duration;

  const running = tc.status === 'calling';
  const errored = tc.status === 'error' || (typeof exitCode === 'number' && exitCode !== 0);

  return (
    <div className={`mt-2 border rounded text-xs ${statusColor(tc.status)}`}>
      <div className="px-2 py-1.5 flex items-center gap-2 border-b border-slate-800/60">
        <PrimitiveBadge primitive="sandbox" onTeach={onTeach} compact />
        <span className="text-slate-300 text-[11px] font-mono">
          execute_command
        </span>
        <span className="ml-auto flex items-center gap-2 text-[10px]">
          {running && (
            <span className="inline-flex items-center gap-1 text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              running
            </span>
          )}
          {typeof exitCode === 'number' && (
            <span
              className={`font-mono ${
                exitCode === 0 ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              exit {exitCode}
            </span>
          )}
          {typeof durationMs === 'number' && (
            <span className="text-slate-500">{Math.round(durationMs)}ms</span>
          )}
          {pid !== undefined && (
            <span className="text-slate-500 font-mono">pid {pid}</span>
          )}
        </span>
      </div>

      {cwd && (
        <div className="px-3 py-1 text-[10px] text-slate-500 border-b border-slate-800/60 font-mono">
          cwd: {cwd}
        </div>
      )}

      {/* Prompt line */}
      <div className="bg-black/60 px-3 py-1.5 border-b border-slate-800/60 font-mono text-[12px] flex items-baseline gap-2">
        <span className="text-emerald-400 select-none">$</span>
        <span className="text-slate-100 whitespace-pre-wrap break-all">
          {command}
        </span>
      </div>

      {/* Output */}
      {(stdout || stderr || running) && (
        <div className="bg-black/80 px-3 py-2 max-h-72 overflow-auto font-mono text-[11px] leading-relaxed">
          {stdout && (
            <pre className="whitespace-pre-wrap break-all text-slate-200">
              {stdout}
            </pre>
          )}
          {stderr && (
            <pre className="whitespace-pre-wrap break-all text-rose-300">
              {stderr}
            </pre>
          )}
          {running && !stdout && !stderr && (
            <span className="text-slate-500 italic">
              <span className="inline-block w-2 h-3 bg-emerald-400 animate-pulse align-middle" />
              {' '}waiting for output…
            </span>
          )}
        </div>
      )}

      {tc.status === 'awaiting-approval' && (
        <div className="px-3 py-2 flex items-center gap-2 flex-wrap border-t border-slate-800/60">
          <div className="text-sky-200 text-[11px]">
            Shell commands require approval. Review the command above.
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={onDecline}
              disabled={!canRespond}
              className="px-2 py-1 rounded border border-slate-600 text-slate-200 hover:bg-slate-700/40 disabled:opacity-40"
            >
              Decline
            </button>
            <button
              onClick={onApprove}
              disabled={!canRespond}
              className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium disabled:opacity-40"
            >
              Approve
            </button>
          </div>
        </div>
      )}

      {errored && tc.status !== 'awaiting-approval' && (
        <div className="px-3 py-1 text-[10px] text-rose-300 border-t border-rose-500/30">
          Command exited non-zero — the agent will see the error and decide what
          to do next.
        </div>
      )}

      {/* Edu footer */}
      <div className="px-3 py-1.5 border-t border-slate-800/60 flex items-center gap-2 text-[10px] text-slate-500 leading-relaxed">
        <button
          onClick={() => onTeach('sandbox')}
          className="shrink-0 text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
        >
          learn →
        </button>
        <span>
          <span className="font-mono">LocalSandbox</span> in dev,{' '}
          <span className="font-mono">E2BSandbox</span> in prod. Same API —
          stdout, stderr, exit code. Approval gating is per call.
        </span>
      </div>
    </div>
  );
}
