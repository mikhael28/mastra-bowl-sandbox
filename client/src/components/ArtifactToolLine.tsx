import { ToolCallState, statusText, extractPath } from './tool-cards/types';

interface Props {
  tc: ToolCallState;
  onClick?: () => void;
}

const KIND_LABEL: Record<string, { kind: string; tone: string }> = {
  mastra_workspace_write_file: { kind: 'write', tone: 'text-emerald-300' },
  mastra_workspace_edit_file: { kind: 'edit', tone: 'text-sky-300' },
  mastra_workspace_ast_edit: { kind: 'ast-edit', tone: 'text-sky-300' },
  mastra_workspace_delete_file: { kind: 'delete', tone: 'text-rose-300' },
  mastra_workspace_execute_command: { kind: 'exec', tone: 'text-amber-300' },
  mastra_workspace_read_file: { kind: 'read', tone: 'text-slate-300' },
  fs_read_text_file: { kind: 'read', tone: 'text-slate-300' },
  mastra_workspace_list_files: { kind: 'ls', tone: 'text-slate-400' },
  fs_list_directory_with_sizes: { kind: 'ls', tone: 'text-slate-400' },
};

function summarize(tc: ToolCallState): string {
  if (tc.toolName === 'mastra_workspace_execute_command') {
    const cmd = (tc.args as any)?.command ?? (tc.args as any)?.cmd ?? '';
    return typeof cmd === 'string' ? cmd : '';
  }
  const path = extractPath(tc.args, tc.result);
  return path ?? '';
}

function statusDot(status: ToolCallState['status']): string {
  if (status === 'error') return 'bg-rose-400';
  if (status === 'awaiting-approval') return 'bg-sky-400 animate-pulse';
  if (status === 'declined') return 'bg-slate-500';
  if (status === 'calling') return 'bg-amber-400 animate-pulse';
  return 'bg-emerald-400';
}

export function ArtifactToolLine({ tc, onClick }: Props) {
  const meta = KIND_LABEL[tc.toolName] ?? {
    kind: tc.toolName.replace(/^mastra_workspace_/, ''),
    tone: 'text-slate-300',
  };
  const detail = summarize(tc);
  const clickable = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`w-full text-left flex items-center gap-2 px-2 py-1 rounded text-[11px] font-mono ${
        clickable ? 'hover:bg-slate-800/60 cursor-pointer' : 'cursor-default'
      }`}
      title={`${tc.toolName} • ${statusText(tc.status)}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(tc.status)}`} />
      <span className={`${meta.tone} font-semibold w-14 shrink-0`}>{meta.kind}</span>
      <span className="text-slate-400 truncate flex-1">{detail}</span>
      <span className="text-[10px] text-slate-500 shrink-0">
        {statusText(tc.status)}
      </span>
    </button>
  );
}
