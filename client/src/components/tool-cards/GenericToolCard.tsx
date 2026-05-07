import { useState } from 'react';
import { PrimitiveBadge } from '../PrimitiveBadge';
import {
  ToolCardProps,
  statusColor,
  statusText,
  safeStringify,
} from './types';
import { classifyTool, primitiveForToolKind } from '../../lib/education';

/**
 * Generic fallback renderer. Used when a tool doesn't match any of the
 * specialized kinds (workspace, sandbox, stagehand, rag, todo, subagent,
 * workflow). Visually identical to the original `ToolCallView` in Chat.tsx.
 */
export function GenericToolCard(props: ToolCardProps) {
  const { tc, onTeach, onApprove, onDecline, canRespond } = props;
  const [open, setOpen] = useState(tc.status === 'awaiting-approval');
  const primitive = primitiveForToolKind(classifyTool(tc.toolName));

  return (
    <div className={`mt-2 border p-2 text-xs ${statusColor(tc.status)}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <PrimitiveBadge primitive={primitive} onTeach={onTeach} compact />
          <span className="font-mono text-cyan-200 truncate uppercase tracking-wider text-[11px]">
            {tc.toolName}
          </span>
          <span className="holo-eyebrow">{statusText(tc.status)}</span>
        </div>
        <span className="text-cyan-500">{open ? '▲' : '▼'}</span>
      </button>

      {tc.status === 'awaiting-approval' && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <div className="text-cyan-200 text-[10px] holo-readout">
            // ◇ APPROVAL REQUIRED — confirm before executing
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

      {open && (
        <div className="mt-2 space-y-2">
          <div>
            <div className="holo-eyebrow mb-0.5">// ARGS</div>
            <pre
              className="p-2 overflow-x-auto text-[11px] whitespace-pre-wrap break-all"
              style={{ background: 'rgba(2, 14, 20, 0.7)', border: '1px solid rgba(108, 230, 248, 0.18)', color: '#cdf2fb' }}
            >
              {safeStringify(tc.args)}
            </pre>
          </div>
          {tc.result !== undefined && (
            <div>
              <div className="holo-eyebrow mb-0.5">// RESULT</div>
              <pre
                className="p-2 overflow-x-auto text-[11px] whitespace-pre-wrap break-all max-h-64"
                style={{ background: 'rgba(2, 14, 20, 0.7)', border: '1px solid rgba(108, 230, 248, 0.18)', color: '#cdf2fb' }}
              >
                {safeStringify(tc.result)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
