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
    <div className={`mt-2 border rounded p-2 text-xs ${statusColor(tc.status)}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <PrimitiveBadge primitive={primitive} onTeach={onTeach} compact />
          <span className="font-mono text-slate-200 truncate">
            {tc.toolName}
          </span>
          <span className="text-slate-400">{statusText(tc.status)}</span>
        </div>
        <span className="text-slate-500">{open ? '▲' : '▼'}</span>
      </button>

      {tc.status === 'awaiting-approval' && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <div className="text-sky-200 text-[11px]">
            This tool requires your approval before it runs.
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

      {open && (
        <div className="mt-2 space-y-2">
          <div>
            <div className="text-[10px] uppercase text-slate-500 mb-0.5">
              args
            </div>
            <pre className="bg-slate-950 rounded p-2 overflow-x-auto text-[11px] whitespace-pre-wrap break-all">
              {safeStringify(tc.args)}
            </pre>
          </div>
          {tc.result !== undefined && (
            <div>
              <div className="text-[10px] uppercase text-slate-500 mb-0.5">
                result
              </div>
              <pre className="bg-slate-950 rounded p-2 overflow-x-auto text-[11px] whitespace-pre-wrap break-all max-h-64">
                {safeStringify(tc.result)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
