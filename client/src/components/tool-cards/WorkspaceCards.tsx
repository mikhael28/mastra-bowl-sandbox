import { useMemo, useState } from 'react';
import { PrimitiveBadge } from '../PrimitiveBadge';
import { DiffView } from '../DiffView';
import {
  ToolCardProps,
  statusColor,
  statusText,
  safeStringify,
  unwrap,
  extractPath,
} from './types';

/**
 * Teaching copy shown under every workspace card. Workspace is the primitive
 * that gives the agent a real scratch space — these cards exist to show:
 *   (1) what the agent is about to do, or
 *   (2) what it just did, without collapsing it into a JSON blob.
 *
 * Each card has an EduStrip at the bottom that names the WORKSPACE_TOOL and
 * teaches *why* that specific tool is gated (write vs. read).
 */
function EduStrip({ text, onTeach, primitive }: {
  text: string;
  onTeach: (id: any) => void;
  primitive: 'workspace' | 'sandbox';
}) {
  return (
    <div className="mt-2 pt-2 border-t border-slate-800/70 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
      <button
        onClick={() => onTeach(primitive)}
        className="shrink-0 text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
      >
        learn →
      </button>
      <span>{text}</span>
    </div>
  );
}

function CardShell({
  tc,
  primitive,
  subtitle,
  onTeach,
  onApprove,
  onDecline,
  canRespond,
  children,
}: ToolCardProps & {
  primitive: 'workspace' | 'sandbox';
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mt-2 border rounded p-2 text-xs ${statusColor(tc.status)}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <PrimitiveBadge primitive={primitive} onTeach={onTeach} compact />
          <span className="font-mono text-slate-200 truncate">
            {tc.toolName}
          </span>
          <span className="text-slate-400 text-[10px]">{statusText(tc.status)}</span>
        </div>
      </div>
      {subtitle && (
        <div className="text-[11px] text-slate-400 mt-1 font-mono truncate">
          {subtitle}
        </div>
      )}
      <div className="mt-2">{children}</div>
      {tc.status === 'awaiting-approval' && (
        <div className="mt-2 flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/60">
          <div className="text-sky-200 text-[11px]">
            Approval required before this runs.
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// LIST_FILES: render the result as a little file-tree snippet.
// ---------------------------------------------------------------------------

export function WorkspaceListCard(props: ToolCardProps) {
  const { tc, onTeach, onOpenFile } = props;
  const result = unwrap(tc.result) as any;
  const entries: Array<any> = Array.isArray(result)
    ? result
    : Array.isArray(result?.files)
      ? result.files
      : Array.isArray(result?.entries)
        ? result.entries
        : [];

  const path = (tc.args as any)?.path ?? '.';

  return (
    <CardShell {...props} primitive="workspace" subtitle={`ls ${path}`}>
      {entries.length === 0 && tc.status === 'done' && (
        <div className="text-slate-500 italic">(empty)</div>
      )}
      {entries.length > 0 && (
        <ul className="space-y-0.5 font-mono text-[11px]">
          {entries.slice(0, 50).map((e: any, i: number) => {
            const isDir = e.type === 'directory' || e.isDirectory;
            const name = e.name ?? e.path ?? '?';
            const full = e.path ?? (path === '.' ? name : `${path}/${name}`);
            return (
              <li key={`${name}-${i}`} className="flex items-center gap-2">
                <span className="text-slate-500 w-3">{isDir ? '📁' : '📄'}</span>
                {isDir || !onOpenFile ? (
                  <span className="text-slate-300 truncate">{name}</span>
                ) : (
                  <button
                    onClick={() => onOpenFile(full)}
                    className="text-indigo-300 hover:text-indigo-200 underline decoration-dotted truncate text-left"
                  >
                    {name}
                  </button>
                )}
                {typeof e.size === 'number' && (
                  <span className="text-slate-600 ml-auto">{formatSize(e.size)}</span>
                )}
              </li>
            );
          })}
          {entries.length > 50 && (
            <li className="text-slate-500 italic pl-5">
              … {entries.length - 50} more
            </li>
          )}
        </ul>
      )}
      <EduStrip
        onTeach={onTeach}
        primitive="workspace"
        text="`mastra_workspace_list_files` is read-only, so no approval gate. Every entry here is addressable by `_read_file`."
      />
    </CardShell>
  );
}

function formatSize(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}

// ---------------------------------------------------------------------------
// READ_FILE: show the file contents in a scrollable code box.
// ---------------------------------------------------------------------------

export function WorkspaceReadCard(props: ToolCardProps) {
  const { tc, onTeach } = props;
  const path = (tc.args as any)?.path ?? '?';
  const result = unwrap(tc.result) as any;
  const content =
    typeof result === 'string'
      ? result
      : result?.content ?? result?.text ?? result?.data ?? '';

  return (
    <CardShell {...props} primitive="workspace" subtitle={`cat ${path}`}>
      {tc.status === 'done' && (
        <pre className="bg-slate-950 rounded p-2 text-[11px] whitespace-pre-wrap break-all max-h-72 overflow-auto font-mono">
          {typeof content === 'string' ? content : safeStringify(content)}
        </pre>
      )}
      {tc.status !== 'done' && tc.status !== 'awaiting-approval' && (
        <div className="text-slate-500 text-[11px]">reading…</div>
      )}
      <EduStrip
        onTeach={onTeach}
        primitive="workspace"
        text="Reads from ./workspace. Mastra's LocalFilesystem resolves paths relative to that root, so the agent can't escape."
      />
    </CardShell>
  );
}

// ---------------------------------------------------------------------------
// WRITE_FILE / EDIT_FILE: diff view for approval.
// ---------------------------------------------------------------------------

export function WorkspaceWriteCard(props: ToolCardProps) {
  const { tc, onTeach, agentId } = props;
  const args = (tc.args ?? {}) as any;
  const path = args.path ?? args.filePath ?? '?';
  const isEdit =
    tc.toolName === 'mastra_workspace_edit_file' ||
    tc.toolName === 'mastra_workspace_ast_edit' ||
    tc.toolName === 'fs_edit_file';

  // `fs_edit_file` and friends pass an `edits[]` array of `{oldText, newText}`
  // — each is a targeted replace within the file. Render each as its own
  // tiny diff block so you can read what's changing where.
  const editsArray: Array<{ oldText: string; newText: string }> | null =
    Array.isArray(args.edits)
      ? args.edits
          .map((e: any) => ({
            oldText: String(e.oldText ?? e.old_text ?? ''),
            newText: String(e.newText ?? e.new_text ?? ''),
          }))
          .filter((e: any) => e.oldText || e.newText)
      : null;

  const singleShotOld: string | undefined =
    args.oldText ?? args.oldContent ?? undefined;
  const singleShotNew: string =
    args.content ?? args.newContent ?? args.newText ?? '';

  return (
    <CardShell
      {...props}
      primitive="workspace"
      subtitle={`${isEdit ? 'edit' : 'write'} ${path}`}
    >
      {editsArray && editsArray.length > 0 ? (
        <div className="space-y-2">
          <div className="text-[10px] text-slate-500">
            {editsArray.length} edit{editsArray.length === 1 ? '' : 's'} requested
          </div>
          {editsArray.map((e, i) => (
            <DiffView
              key={i}
              path={`${path} (edit ${i + 1})`}
              oldContent={e.oldText}
              newContent={e.newText}
              maxLines={20}
            />
          ))}
        </div>
      ) : (
        <DiffView
          path={path}
          oldContent={singleShotOld}
          newContent={
            typeof singleShotNew === 'string'
              ? singleShotNew
              : String(singleShotNew ?? '')
          }
          agentId={agentId}
          fetchOriginalIfMissing={isEdit}
        />
      )}
      <EduStrip
        onTeach={onTeach}
        primitive="workspace"
        text={
          isEdit
            ? 'Edits must match existing text exactly. Approval gates the overwrite — declining keeps the file untouched.'
            : 'Writes require approval because they overwrite or create files. The diff above is what will hit disk.'
        }
      />
    </CardShell>
  );
}

// ---------------------------------------------------------------------------
// DELETE: prominent red warning.
// ---------------------------------------------------------------------------

export function WorkspaceDeleteCard(props: ToolCardProps) {
  const { tc, onTeach } = props;
  const path = (tc.args as any)?.path ?? '?';
  return (
    <CardShell {...props} primitive="workspace" subtitle={`rm ${path}`}>
      <div className="flex items-start gap-2 p-2 rounded border border-rose-500/40 bg-rose-500/5">
        <span className="text-rose-300 text-lg leading-none">⚠</span>
        <div className="text-xs text-rose-200">
          The agent is requesting to <b>delete</b>{' '}
          <span className="font-mono">{path}</span> from the workspace.
        </div>
      </div>
      <EduStrip
        onTeach={onTeach}
        primitive="workspace"
        text="Destructive ops are always gated by `requireApproval`. The LocalSandbox can't bypass this — it's enforced at the tool level."
      />
    </CardShell>
  );
}

// ---------------------------------------------------------------------------
// GREP / MKDIR / other read-only workspace operations.
// ---------------------------------------------------------------------------

export function WorkspaceSimpleCard(props: ToolCardProps) {
  const { tc, onTeach } = props;
  const [open, setOpen] = useState(false);
  const path = extractPath(tc.args, tc.result);
  return (
    <CardShell
      {...props}
      primitive="workspace"
      subtitle={path ? `${shortToolAction(tc.toolName)} ${path}` : shortToolAction(tc.toolName)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[11px] text-slate-400 hover:text-slate-200"
      >
        {open ? '▲ hide' : '▼ details'}
      </button>
      {open && (
        <div className="mt-2 space-y-1">
          <div className="text-[10px] uppercase text-slate-500">args</div>
          <pre className="bg-slate-950 rounded p-2 text-[11px] whitespace-pre-wrap break-all max-h-40 overflow-auto">
            {safeStringify(tc.args)}
          </pre>
          {tc.result !== undefined && (
            <>
              <div className="text-[10px] uppercase text-slate-500">result</div>
              <pre className="bg-slate-950 rounded p-2 text-[11px] whitespace-pre-wrap break-all max-h-56 overflow-auto">
                {safeStringify(tc.result)}
              </pre>
            </>
          )}
        </div>
      )}
      <EduStrip
        onTeach={onTeach}
        primitive="workspace"
        text="Workspace BM25 + auto-indexing mean the agent can grep and search its own outputs across sessions."
      />
    </CardShell>
  );
}

function shortToolAction(name: string): string {
  return name.replace(/^mastra_workspace_/, '').replace(/_/g, ' ');
}
