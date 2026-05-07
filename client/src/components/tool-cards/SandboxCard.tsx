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
    <div className={`mt-2 border text-xs ${statusColor(tc.status)}`}>
      <div className="px-2 py-1.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.18)' }}>
        <PrimitiveBadge primitive="sandbox" onTeach={onTeach} compact />
        <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: '#aaf6ff' }}>
          ▸ EXEC_COMMAND
        </span>
        <span className="ml-auto flex items-center gap-2 text-[10px] holo-readout">
          {running && (
            <span className="inline-flex items-center gap-1 glow-amber" style={{ color: '#ffd082' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#ffb84d', boxShadow: '0 0 4px #ffb84d' }} />
              EXEC
            </span>
          )}
          {typeof exitCode === 'number' && (
            <span
              className="font-mono"
              style={{ color: exitCode === 0 ? '#66f5c2' : '#ff859a' }}
            >
              EXIT {exitCode}
            </span>
          )}
          {typeof durationMs === 'number' && (
            <span style={{ color: 'rgba(108, 230, 248, 0.55)' }}>{Math.round(durationMs)}ms</span>
          )}
          {pid !== undefined && (
            <span className="font-mono" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>PID {pid}</span>
          )}
        </span>
      </div>

      {cwd && (
        <div className="px-3 py-1 text-[10px] font-mono" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.18)', color: 'rgba(108, 230, 248, 0.6)' }}>
          &gt; CWD: {cwd}
        </div>
      )}

      {/* Prompt line */}
      <div
        className="px-3 py-1.5 font-mono text-[12px] flex items-baseline gap-2"
        style={{ background: 'rgba(0, 0, 0, 0.7)', borderBottom: '1px solid rgba(108, 230, 248, 0.18)' }}
      >
        <span className="select-none glow-cyan" style={{ color: '#aaf6ff' }}>▸</span>
        <span className="whitespace-pre-wrap break-all" style={{ color: '#cdf2fb' }}>
          {command}
        </span>
      </div>

      {/* Output */}
      {(stdout || stderr || running) && (
        <div
          className="px-3 py-2 max-h-72 overflow-auto font-mono text-[11px] leading-relaxed"
          style={{ background: 'rgba(0, 0, 0, 0.85)' }}
        >
          {stdout && (
            <pre className="whitespace-pre-wrap break-all" style={{ color: '#cdf2fb' }}>
              {stdout}
            </pre>
          )}
          {stderr && (
            <pre className="whitespace-pre-wrap break-all glow-red" style={{ color: '#ff859a' }}>
              {stderr}
            </pre>
          )}
          {running && !stdout && !stderr && (
            <span className="italic" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
              <span
                className="inline-block w-2 h-3 align-middle animate-pulse"
                style={{ background: '#aaf6ff', boxShadow: '0 0 6px #aaf6ff' }}
              />
              {' '}// awaiting output...
            </span>
          )}
        </div>
      )}

      {tc.status === 'awaiting-approval' && (
        <div className="px-3 py-2 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(108, 230, 248, 0.18)' }}>
          <div className="holo-readout text-[10px]" style={{ color: '#88efff' }}>
            // ◇ SHELL EXEC REQUIRES APPROVAL — review above
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={onDecline}
              disabled={!canRespond}
              className="holo-button holo-button-red disabled:opacity-40"
            >
              ✕ DECLINE
            </button>
            <button
              onClick={onApprove}
              disabled={!canRespond}
              className="holo-button disabled:opacity-40"
            >
              ✓ APPROVE
            </button>
          </div>
        </div>
      )}

      {errored && tc.status !== 'awaiting-approval' && (
        <div
          className="px-3 py-1 text-[10px] holo-readout glow-red"
          style={{ borderTop: '1px solid rgba(255, 88, 116, 0.4)', color: '#ff859a' }}
        >
          // ⚠ NON-ZERO EXIT — agent will inspect and choose recovery.
        </div>
      )}

      {/* Edu footer */}
      <div
        className="px-3 py-1.5 flex items-center gap-2 text-[10px] holo-readout leading-relaxed"
        style={{ borderTop: '1px solid rgba(108, 230, 248, 0.15)', color: 'rgba(108, 230, 248, 0.55)' }}
      >
        <button
          onClick={() => onTeach('sandbox')}
          className="shrink-0 underline decoration-dotted uppercase tracking-widest"
          style={{ color: '#88efff' }}
        >
          ▸ LEARN
        </button>
        <span>
          <span className="font-mono" style={{ color: '#aaf6ff' }}>LocalSandbox</span> in dev,{' '}
          <span className="font-mono" style={{ color: '#aaf6ff' }}>E2BSandbox</span> in prod. Same API —
          stdout, stderr, exit code. Approval gating is per call.
        </span>
      </div>
    </div>
  );
}
