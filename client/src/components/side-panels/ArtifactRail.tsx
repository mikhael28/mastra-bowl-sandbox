import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  WorkspaceEntry,
  listWorkspace,
  readWorkspaceFile,
  writeWorkspaceFile,
} from '../../lib/mastraClient';
import {
  artifactUrl,
  isInsideArtifactSession,
  previewModeFor,
  relativeToSession,
} from '../../lib/artifactPreview';
import { describeError, logError } from '../../lib/errorLog';
import { type Message } from '../../lib/streamParse';
import { extractPath } from '../tool-cards/types';

/**
 * Compact in-rail artifact workspace. Mirrors what the standalone Artifact
 * tab used to render (preview / editor / files / terminal) but lives next
 * to the chat thread that's driving it.
 *
 * The session id is derived from the chat thread id — every chat thread
 * implicitly owns one artifact session under workspace/artifacts/<sid>/.
 */

interface Props {
  agentId: string;
  sessionId: string;
  // The current chat thread's messages — we scan these for tool results to
  // build the terminal log and to detect file writes.
  messages: Message[];
  refreshNonce: number;
}

type TerminalEntry = {
  id: string;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

const WRITE_TOOLS = new Set([
  'mastra_workspace_write_file',
  'mastra_workspace_edit_file',
  'mastra_workspace_ast_edit',
  'fs_write_file',
  'fs_edit_file',
]);

const EXEC_TOOLS = new Set(['mastra_workspace_execute_command']);

export function ArtifactRail({ agentId, sessionId, messages, refreshNonce }: Props) {
  const [files, setFiles] = useState<WorkspaceEntry[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState('');
  const [editorBuffer, setEditorBuffer] = useState('');
  const [savingFile, setSavingFile] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [tab, setTab] = useState<'preview' | 'code' | 'files' | 'terminal'>(
    'preview',
  );
  const filesRefreshNonceRef = useRef(0);
  const sessionFolder = `artifacts/${sessionId}`;

  const refreshFiles = useCallback(async () => {
    const nonce = ++filesRefreshNonceRef.current;
    const [primary, legacy] = await Promise.all([
      listFilesRecursive(agentId, sessionFolder),
      listFilesRecursive(agentId, `workspace/${sessionFolder}`),
    ]);
    if (nonce !== filesRefreshNonceRef.current) return;
    const seen = new Set<string>();
    const merged: WorkspaceEntry[] = [];
    for (const e of [...primary, ...legacy]) {
      const rel = e.path
        .replace(/^workspace\//, '')
        .replace(new RegExp(`^${sessionFolder}/`), '');
      if (seen.has(rel)) continue;
      seen.add(rel);
      merged.push(e);
    }
    setFiles(merged);
  }, [agentId, sessionFolder]);

  // Re-list when messages change (the agent may have just written a file)
  // or when the parent bumps the refresh nonce.
  useEffect(() => {
    refreshFiles();
  }, [refreshFiles, messages, refreshNonce]);

  // After every finished turn, force the preview iframe + editor buffer to
  // reload — even if the agent kept editing the SAME file, we want to show
  // the latest bytes without making the user click ⟳.
  // Skip the very first render (refreshNonce starts at 0) so an empty
  // session doesn't try to reload nothing.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setIframeKey((k) => k + 1);
  }, [refreshNonce]);

  // Auto-focus the most recent file written by the agent in this thread.
  // Also tracks the (path, count) signature so that successive edits to the
  // same file still bump the iframe key when the count increases.
  const lastWrittenPath = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      for (let j = m.toolCalls.length - 1; j >= 0; j--) {
        const tc = m.toolCalls[j];
        if (!WRITE_TOOLS.has(tc.toolName)) continue;
        const p = extractPath(tc.args, tc.result);
        if (p && isInsideArtifactSession(p, sessionId)) return p;
      }
    }
    return null;
  }, [messages, sessionId]);

  // Count of write-tool calls that have landed in the artifact session — a
  // monotonically increasing signal that triggers a preview reload even when
  // the same file is edited multiple times back-to-back.
  const sessionWriteCount = useMemo(() => {
    let n = 0;
    for (const m of messages) {
      for (const tc of m.toolCalls) {
        if (!WRITE_TOOLS.has(tc.toolName)) continue;
        if (tc.status !== 'done') continue;
        const p = extractPath(tc.args, tc.result);
        if (p && isInsideArtifactSession(p, sessionId)) n++;
      }
    }
    return n;
  }, [messages, sessionId]);

  useEffect(() => {
    if (lastWrittenPath && lastWrittenPath !== activeFile) {
      setActiveFile(lastWrittenPath);
    }
  }, [lastWrittenPath, activeFile]);

  // Reload preview whenever the count of completed writes ticks up — covers
  // both "new file" and "same file edited again".
  useEffect(() => {
    if (sessionWriteCount > 0) {
      setIframeKey((k) => k + 1);
    }
  }, [sessionWriteCount]);

  // Default to the first file in the listing if nothing's selected yet.
  useEffect(() => {
    if (!activeFile && files.length > 0) {
      const indexHtml = files.find((f) =>
        relativeToSession(f.path, sessionId).toLowerCase() === 'index.html',
      );
      setActiveFile((indexHtml ?? files[0]).path);
    }
  }, [files, activeFile, sessionId]);

  // Load contents when activeFile changes.
  useEffect(() => {
    if (!activeFile) {
      setActiveFileContent('');
      setEditorBuffer('');
      return;
    }
    let alive = true;
    (async () => {
      let content: string | null = null;
      if (isInsideArtifactSession(activeFile, sessionId)) {
        try {
          const res = await fetch(artifactUrl(sessionId, activeFile), {
            cache: 'no-store',
          });
          if (res.ok) content = await res.text();
        } catch {
          /* fall through */
        }
      }
      if (content === null) {
        const r = await readWorkspaceFile(agentId, activeFile);
        content = r?.content ?? '';
      }
      if (!alive) return;
      setActiveFileContent(content);
      setEditorBuffer(content);
    })();
    return () => {
      alive = false;
    };
  }, [activeFile, agentId, sessionId, iframeKey]);

  // Build the terminal entries by scanning every exec result in the thread.
  const terminal = useMemo(() => {
    const entries: TerminalEntry[] = [];
    for (const m of messages) {
      for (const tc of m.toolCalls) {
        if (!EXEC_TOOLS.has(tc.toolName)) continue;
        const command =
          (tc.args as any)?.command ??
          (tc.args as any)?.cmd ??
          '(unknown command)';
        const r = unwrap(tc.result) as any;
        const stdout =
          typeof r?.stdout === 'string'
            ? r.stdout
            : typeof r?.output === 'string'
              ? r.output
              : '';
        const stderr =
          typeof r?.stderr === 'string'
            ? r.stderr
            : typeof r?.error === 'string'
              ? r.error
              : '';
        const exitCode =
          typeof r?.exitCode === 'number'
            ? r.exitCode
            : typeof r?.code === 'number'
              ? r.code
              : null;
        entries.push({
          id: tc.toolCallId,
          command,
          stdout,
          stderr,
          exitCode,
        });
      }
    }
    return entries;
  }, [messages]);

  const activeFileRel = useMemo(
    () => (activeFile ? relativeToSession(activeFile, sessionId) : ''),
    [activeFile, sessionId],
  );
  const activeMode = useMemo(
    () => (activeFile ? previewModeFor(activeFile) : 'code'),
    [activeFile],
  );

  const saveActiveFile = useCallback(async () => {
    if (!activeFile || savingFile) return;
    setSavingFile(true);
    try {
      const ok = await writeWorkspaceFile(agentId, activeFile, editorBuffer);
      if (!ok) {
        logError({
          source: 'workspace',
          message: `Failed to save ${activeFile}`,
          agentId,
        });
        return;
      }
      setActiveFileContent(editorBuffer);
      setIframeKey((k) => k + 1);
    } catch (err) {
      const e = describeError(err);
      logError({
        source: 'workspace',
        message: `Save failed: ${e.message}`,
        detail: e.detail,
        agentId,
      });
    } finally {
      setSavingFile(false);
    }
  }, [activeFile, agentId, editorBuffer, savingFile]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          Build
        </span>
        <span className="text-[10px] font-mono text-slate-500 truncate">
          artifacts/{sessionId.slice(0, 8)}
        </span>
        <button
          onClick={() => {
            refreshFiles();
            setIframeKey((k) => k + 1);
          }}
          className="ml-auto text-[10px] text-slate-500 hover:text-slate-200"
          title="Refresh files + preview"
        >
          ⟳
        </button>
      </div>

      <div className="flex border-b border-slate-800 text-[11px]">
        {(['preview', 'code', 'files', 'terminal'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 ${
              tab === t
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            {t === 'files' && files.length > 0 ? `Files (${files.length})` : null}
            {t === 'terminal' && terminal.length > 0
              ? `Terminal (${terminal.length})`
              : null}
            {t !== 'files' && t !== 'terminal' && t}
            {t === 'files' && files.length === 0 && 'Files'}
            {t === 'terminal' && terminal.length === 0 && 'Terminal'}
          </button>
        ))}
      </div>

      {/* Active file picker (always visible above the body). */}
      {(tab === 'preview' || tab === 'code') && (
        <div className="px-2 py-1 border-b border-slate-800 flex items-center gap-2">
          <select
            value={activeFile ?? ''}
            onChange={(e) => setActiveFile(e.target.value || null)}
            className="bg-slate-900 border border-slate-700 rounded text-[10px] py-0.5 px-1 text-slate-200 max-w-full truncate"
          >
            {!activeFile && <option value="">— no file —</option>}
            {files.map((f) => (
              <option key={f.path} value={f.path}>
                {relativeToSession(f.path, sessionId)}
              </option>
            ))}
          </select>
          {tab === 'code' && activeFile && (
            <button
              onClick={saveActiveFile}
              disabled={savingFile || editorBuffer === activeFileContent}
              className="ml-auto text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500"
            >
              {savingFile
                ? 'saving…'
                : editorBuffer === activeFileContent
                  ? 'saved'
                  : 'save'}
            </button>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'preview' && (
          <PreviewBody
            key={iframeKey}
            sessionId={sessionId}
            filePath={activeFile}
            relPath={activeFileRel}
            mode={activeMode}
            content={activeFileContent}
          />
        )}
        {tab === 'code' && (
          <Editor
            height="100%"
            language={monacoLanguageFor(activeFile ?? '')}
            theme="vs-dark"
            value={editorBuffer}
            onChange={(v) => setEditorBuffer(v ?? '')}
            options={{
              minimap: { enabled: false },
              fontSize: 11,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              tabSize: 2,
            }}
          />
        )}
        {tab === 'files' && (
          <FilesPane
            files={files}
            sessionId={sessionId}
            activeFile={activeFile}
            onSelect={(p) => {
              setActiveFile(p);
              setTab('preview');
            }}
            onRefresh={refreshFiles}
          />
        )}
        {tab === 'terminal' && <TerminalPane entries={terminal} />}
      </div>
    </div>
  );
}

function PreviewBody({
  sessionId,
  filePath,
  relPath,
  mode,
  content,
}: {
  sessionId: string;
  filePath: string | null;
  relPath: string;
  mode: ReturnType<typeof previewModeFor> | 'code';
  content: string;
}) {
  if (!filePath) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-600 text-[11px] px-4 text-center">
        No artifact files yet. Ask the agent to build something — files written
        to <code className="text-slate-400">artifacts/{sessionId.slice(0, 8)}/</code>{' '}
        will appear here live.
      </div>
    );
  }
  if (mode === 'iframe') {
    return (
      <iframe
        title="artifact-preview"
        src={artifactUrl(sessionId, filePath)}
        sandbox="allow-scripts allow-forms allow-modals"
        className="w-full h-full bg-white"
      />
    );
  }
  if (mode === 'image') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 p-4 overflow-auto">
        <img
          alt={relPath}
          src={artifactUrl(sessionId, filePath)}
          className="max-w-full max-h-full"
        />
      </div>
    );
  }
  if (mode === 'markdown') {
    return (
      <div className="h-full overflow-auto p-3 text-xs text-slate-200">
        <pre className="whitespace-pre-wrap font-sans">{content}</pre>
      </div>
    );
  }
  return (
    <pre className="h-full overflow-auto m-0 p-2 text-[11px] font-mono text-slate-200 bg-slate-950 leading-relaxed whitespace-pre-wrap">
      {content || '(empty)'}
    </pre>
  );
}

function FilesPane({
  files,
  sessionId,
  activeFile,
  onSelect,
  onRefresh,
}: {
  files: WorkspaceEntry[];
  sessionId: string;
  activeFile: string | null;
  onSelect: (path: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="text-xs h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          artifacts/{sessionId.slice(0, 8)}
        </span>
        <button
          onClick={onRefresh}
          className="ml-auto text-[10px] text-slate-500 hover:text-slate-200"
          title="Refresh"
        >
          ⟳
        </button>
      </div>
      {files.length === 0 && (
        <div className="px-3 py-3 text-[11px] text-slate-500">
          No files yet.
        </div>
      )}
      <ul className="py-1">
        {files.map((f) => (
          <li key={f.path}>
            <button
              onClick={() => onSelect(f.path)}
              className={`w-full text-left px-3 py-1 text-[11px] font-mono flex items-center gap-2 ${
                activeFile === f.path
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <span className="text-slate-500">
                {f.type === 'directory' ? '📁' : '📄'}
              </span>
              <span className="truncate">
                {relativeToSession(f.path, sessionId)}
              </span>
              {f.size != null && f.type === 'file' && (
                <span className="ml-auto text-[10px] text-slate-500">
                  {humanSize(f.size)}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TerminalPane({ entries }: { entries: TerminalEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="px-3 py-3 text-[11px] text-slate-500">
        No commands run yet.
      </div>
    );
  }
  return (
    <div className="font-mono text-[11px] p-2 space-y-2 h-full overflow-y-auto">
      {entries.map((e) => (
        <div
          key={e.id}
          className="rounded border border-slate-800 bg-slate-950 overflow-hidden"
        >
          <div className="px-2 py-1 bg-slate-900 text-slate-300 truncate flex items-center gap-2">
            <span className="text-slate-500">$</span>
            <span className="truncate flex-1">{e.command}</span>
            <span
              className={`text-[10px] ${
                e.exitCode != null && e.exitCode !== 0
                  ? 'text-rose-300'
                  : 'text-emerald-300'
              }`}
            >
              {e.exitCode != null ? `exit ${e.exitCode}` : 'done'}
            </span>
          </div>
          {e.stdout && (
            <pre className="m-0 px-2 py-1 text-slate-200 whitespace-pre-wrap break-all">
              {e.stdout}
            </pre>
          )}
          {e.stderr && (
            <pre className="m-0 px-2 py-1 text-rose-300 whitespace-pre-wrap break-all border-t border-slate-800">
              {e.stderr}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function listFilesRecursive(
  agentId: string,
  rootPath: string,
  maxDepth = 3,
): Promise<WorkspaceEntry[]> {
  const out: WorkspaceEntry[] = [];
  async function walk(path: string, depth: number) {
    const entries = await listWorkspace(agentId, path);
    for (const e of entries) {
      if (e.type === 'file') {
        out.push(e);
      } else if (e.type === 'directory' && depth < maxDepth) {
        await walk(e.path, depth + 1);
      }
    }
  }
  await walk(rootPath, 0);
  return out;
}

function unwrap(v: unknown): unknown {
  let x = v;
  for (let i = 0; i < 3; i++) {
    if (
      x &&
      typeof x === 'object' &&
      'data' in (x as any) &&
      Object.keys(x as any).length <= 2
    ) {
      x = (x as any).data;
      continue;
    }
    if (
      x &&
      typeof x === 'object' &&
      'result' in (x as any) &&
      Object.keys(x as any).length <= 2
    ) {
      x = (x as any).result;
      continue;
    }
    break;
  }
  return x;
}

function humanSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function monacoLanguageFor(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (
    lower.endsWith('.js') ||
    lower.endsWith('.jsx') ||
    lower.endsWith('.mjs') ||
    lower.endsWith('.cjs')
  )
    return 'javascript';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.css')) return 'css';
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'shell';
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
  if (lower.endsWith('.toml')) return 'toml';
  if (lower.endsWith('.xml') || lower.endsWith('.svg')) return 'xml';
  if (lower.endsWith('.sql')) return 'sql';
  return 'plaintext';
}
