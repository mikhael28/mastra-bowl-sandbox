import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  AgentSummary,
  Chunk,
  MemoryMessage,
  WorkspaceEntry,
  getMemoryThreadMessages,
  listMemoryThreads,
  listWorkspace,
  readWorkspaceFile,
  resumeToolApproval,
  streamAgent,
  writeWorkspaceFile,
} from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';
import { applyChunkToMessage, type Message } from '../lib/streamParse';
import {
  artifactUrl,
  isInsideArtifactSession,
  previewModeFor,
  relativeToSession,
} from '../lib/artifactPreview';
import { extractPath } from './tool-cards/types';
import { ArtifactToolLine } from './ArtifactToolLine';
import { PrimitiveBadge } from './PrimitiveBadge';

interface Props {
  agent: AgentSummary | null;
  onTeach: (id: PrimitiveId) => void;
}

const RESOURCE_ID = 'mastra-bowl-demo-user';

type TerminalEntry = {
  id: string;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  status: 'running' | 'done' | 'error';
};

type FileVersion = {
  ts: number;
  content: string;
  source: 'agent' | 'user';
};

type PastSession = {
  sessionId: string;
  threadId: string;
  title?: string;
  updatedAt?: string;
};

const ARTIFACT_THREAD_PREFIX = 'artifact-';
const versionsStorageKey = (sid: string) => `artifact-versions:${sid}`;
const MAX_VERSIONS_PER_FILE = 30;

const WRITE_TOOLS = new Set([
  'mastra_workspace_write_file',
  'mastra_workspace_edit_file',
  'mastra_workspace_ast_edit',
]);
const EXEC_TOOLS = new Set([
  'mastra_workspace_execute_command',
]);

export function ArtifactPanel({ agent, onTeach }: Props) {
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [files, setFiles] = useState<WorkspaceEntry[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string>('');
  const [terminal, setTerminal] = useState<TerminalEntry[]>([]);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code' | 'split'>('split');
  // Local edit buffer for the Monaco editor — separate from the agent's
  // last-written content so we can detect "dirty" state and only persist on
  // an explicit Save.
  const [editorBuffer, setEditorBuffer] = useState<string>('');
  const [savingFile, setSavingFile] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<'files' | 'terminal'>('files');
  const [iframeKey, setIframeKey] = useState(0);
  const [autoApproveBanner, setAutoApproveBanner] = useState<string | null>(null);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [versionsByFile, setVersionsByFile] = useState<Record<string, FileVersion[]>>({});
  const [showVersions, setShowVersions] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const currentAssistantIdRef = useRef<string | null>(null);
  const currentRunIdRef = useRef<string | null>(null);
  const handledApprovalsRef = useRef<Set<string>>(new Set());
  const pendingApprovalsRef = useRef<Array<{ toolCallId: string; toolName: string }>>([]);
  const filesRefreshNonceRef = useRef(0);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  // Tracks the source of the next file-content refetch so we can tag the
  // resulting version snapshot. 'agent' = the agent just wrote the file;
  // 'user' = the user just saved.
  const nextSnapshotSourceRef = useRef<'agent' | 'user' | null>(null);
  // Keeps the latest saveActiveFile reachable from Monaco's addCommand binding,
  // which only runs once at mount and would otherwise call a stale closure
  // (writing back the originally-loaded buffer instead of current edits).
  const saveActiveFileRef = useRef<() => void>(() => {});

  const sessionFolderPath = `artifacts/${sessionId}`;

  // -------------------------------------------------------------------------
  // File listing (right pane / file picker)
  // -------------------------------------------------------------------------

  const refreshFiles = useCallback(async () => {
    if (!agent) return;
    const nonce = ++filesRefreshNonceRef.current;
    // Scan both the canonical path (`artifacts/<sid>/`) and the legacy nested
    // path (`workspace/artifacts/<sid>/`) — older runs may have written to
    // the doubled-prefix location before the preamble was clarified.
    const [primary, legacy] = await Promise.all([
      listFilesRecursive(agent.id, sessionFolderPath),
      listFilesRecursive(agent.id, `workspace/${sessionFolderPath}`),
    ]);
    if (nonce !== filesRefreshNonceRef.current) return;
    // Deduplicate by relative-to-session path so the same file written via
    // either toolset only shows up once.
    const seen = new Set<string>();
    const merged: WorkspaceEntry[] = [];
    for (const e of [...primary, ...legacy]) {
      const rel = e.path
        .replace(/^workspace\//, '')
        .replace(new RegExp(`^${sessionFolderPath}/`), '');
      if (seen.has(rel)) continue;
      seen.add(rel);
      merged.push(e);
    }
    setFiles(merged);
  }, [agent?.id, sessionFolderPath]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  // -------------------------------------------------------------------------
  // Past sessions (memory threads with the artifact- prefix)
  // -------------------------------------------------------------------------

  const refreshPastSessions = useCallback(async () => {
    if (!agent) return;
    const threads = await listMemoryThreads({
      resourceId: RESOURCE_ID,
      agentId: agent.id,
    });
    const artifactThreads = threads.filter((t) =>
      t.id.startsWith(ARTIFACT_THREAD_PREFIX),
    );
    artifactThreads.sort((a, b) => {
      const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return tb - ta;
    });
    setPastSessions(
      artifactThreads.map((t) => ({
        sessionId: t.id.slice(ARTIFACT_THREAD_PREFIX.length),
        threadId: t.id,
        title: t.title,
        updatedAt: t.updatedAt,
      })),
    );
  }, [agent?.id]);

  useEffect(() => {
    refreshPastSessions();
  }, [refreshPastSessions]);

  const loadSession = useCallback(
    async (sid: string) => {
      if (!agent || sid === sessionId) {
        setShowSessionPicker(false);
        return;
      }
      // Drop any in-flight stream / pending approvals before swapping context.
      abortRef.current?.abort();
      abortRef.current = null;
      pendingApprovalsRef.current = [];
      handledApprovalsRef.current = new Set();
      currentRunIdRef.current = null;
      currentAssistantIdRef.current = null;

      setLoadingSession(true);
      setShowSessionPicker(false);
      setStreaming(false);
      setSessionId(sid);
      setMessages([]);
      setActiveFile(null);
      setActiveFileContent('');
      setEditorBuffer('');
      setTerminal([]);
      setIframeKey(0);
      setAutoApproveBanner(null);
      setSaveBanner(null);
      try {
        const raw = await getMemoryThreadMessages(
          `${ARTIFACT_THREAD_PREFIX}${sid}`,
          { agentId: agent.id },
        );
        setMessages(memoryMessagesToLocal(raw));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[artifact] load session failed:', err);
      } finally {
        setLoadingSession(false);
      }
    },
    [agent?.id, sessionId],
  );

  // Load + persist version history for this session. Source of truth is
  // localStorage so versions survive reloads and switching between past
  // sessions.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(versionsStorageKey(sessionId));
      setVersionsByFile(raw ? JSON.parse(raw) : {});
    } catch {
      setVersionsByFile({});
    }
  }, [sessionId]);

  const recordVersion = useCallback(
    (path: string, content: string, source: 'agent' | 'user') => {
      setVersionsByFile((prev) => {
        const existing = prev[path] ?? [];
        const last = existing[existing.length - 1];
        // Dedupe consecutive identical contents — covers the save → refetch
        // round-trip and the manual reload button.
        if (last && last.content === content) return prev;
        const next = [...existing, { ts: Date.now(), content, source }].slice(
          -MAX_VERSIONS_PER_FILE,
        );
        const merged = { ...prev, [path]: next };
        try {
          window.localStorage.setItem(
            versionsStorageKey(sessionId),
            JSON.stringify(merged),
          );
        } catch {
          /* quota exceeded — drop silently */
        }
        return merged;
      });
    },
    [sessionId],
  );

  // Load contents of the active file when it changes. Prefer the HTTP route
  // (`/artifacts/<sid>/<rel>`) — the same one the preview iframe uses — so
  // the editor always sees exactly what the preview is rendering. Fall back
  // to the MCP `fs_read_text_file` tool if the file lives outside the
  // session folder for any reason.
  useEffect(() => {
    if (!agent || !activeFile) {
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
          /* fall through to MCP read */
        }
      }
      if (content === null) {
        const r = await readWorkspaceFile(agent.id, activeFile);
        content = r?.content ?? '';
      }
      if (!alive) return;
      setActiveFileContent(content);
      setEditorBuffer(content);
      // Default tag is 'agent' — first load + manual reloads count as the
      // canonical on-disk version.
      const source = nextSnapshotSourceRef.current ?? 'agent';
      nextSnapshotSourceRef.current = null;
      recordVersion(activeFile, content, source);
    })();
    return () => {
      alive = false;
    };
  }, [agent?.id, activeFile, sessionId, iframeKey, recordVersion]);

  useEffect(() => {
    messagesScrollRef.current?.scrollTo({
      top: messagesScrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  // -------------------------------------------------------------------------
  // Stream + tool-call routing
  // -------------------------------------------------------------------------

  const handleChunk = useCallback(
    (chunk: Chunk, assistantId: string) => {
      applyChunkToMessage(chunk, assistantId, setMessages, onTeach);

      // Approval auto-resolution: when the agent asks for approval on a write
      // / edit / exec inside our sandboxed session folder, queue an approval
      // to fire once the current stream drains. Running the resume call
      // concurrently with the suspended outer stream caused the run to
      // terminate early.
      if (
        chunk.type === 'tool-call-approval' ||
        chunk.type === 'data-tool-call-approval'
      ) {
        const toolCallId =
          chunk.payload?.toolCallId ?? chunk.data?.toolCallId;
        const toolName =
          chunk.payload?.toolName ?? chunk.data?.toolName ?? '';
        const args = chunk.payload?.args ?? chunk.data?.args;
        const path = extractPath(args);
        const command = (args as any)?.command;
        const targetIsSandboxed =
          isInsideArtifactSession(path, sessionId) ||
          // For `execute_command`, the cwd / path may live outside but the
          // command itself runs in the sandbox; auto-approve the well-known
          // exec tool too.
          (EXEC_TOOLS.has(toolName) && typeof command === 'string');
        if (toolCallId && targetIsSandboxed && agent) {
          if (handledApprovalsRef.current.has(toolCallId)) return;
          handledApprovalsRef.current.add(toolCallId);
          setAutoApproveBanner(`auto-approved ${toolName}`);
          pendingApprovalsRef.current.push({ toolCallId, toolName });
        }
      }

      // File writes → refresh tree + focus the file + reload preview.
      if (chunk.type === 'tool-result') {
        const toolName = chunk.payload?.toolName ?? '';
        const args = chunk.payload?.args;
        const result = chunk.payload?.result;
        const path = extractPath(args, result);
        if (WRITE_TOOLS.has(toolName) && path) {
          if (isInsideArtifactSession(path, sessionId)) {
            setActiveFile(path);
            nextSnapshotSourceRef.current = 'agent';
            setIframeKey((k) => k + 1);
            // Don't clobber the user's chosen view mode on subsequent writes —
            // only force `split` the first time so they see preview + code.
            setPreviewMode((current) =>
              activeFile ? current : 'split',
            );
          }
          // Always refresh tree even if path is outside (rare).
          refreshFiles();
        }
        if (EXEC_TOOLS.has(toolName)) {
          appendTerminal(args, result, chunk.payload?.toolCallId);
          setRightTab('terminal');
        }
      }
    },
    [agent?.id, sessionId, refreshFiles, activeFile],
  );

  function appendTerminal(
    args: unknown,
    result: unknown,
    toolCallId?: string,
  ) {
    const command =
      (args as any)?.command ?? (args as any)?.cmd ?? '(unknown command)';
    const r = unwrap(result) as any;
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
    const status: TerminalEntry['status'] =
      exitCode === 0 ? 'done' : exitCode == null ? 'done' : 'error';
    const entry: TerminalEntry = {
      id: toolCallId ?? crypto.randomUUID(),
      command,
      stdout,
      stderr,
      exitCode,
      status,
    };
    setTerminal((t) => [...t, entry]);
  }

  async function consumeStream(
    stream: AsyncGenerator<Chunk, void, void>,
    assistantId: string,
  ) {
    for await (const chunk of stream) {
      if (chunk.runId) {
        currentRunIdRef.current = chunk.runId;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId && !msg.runId
              ? { ...msg, runId: chunk.runId }
              : msg,
          ),
        );
      }
      handleChunk(chunk, assistantId);
    }
    // Drain queued auto-approvals sequentially. Each resume call may surface
    // further approvals; those get queued and processed on the next pass.
    while (pendingApprovalsRef.current.length > 0) {
      const next = pendingApprovalsRef.current.shift()!;
      await runResume(next.toolCallId, true, assistantId);
    }
  }

  async function runResume(
    toolCallId: string,
    approved: boolean,
    assistantId: string,
  ) {
    if (!agent) return;
    const runId = currentRunIdRef.current;
    if (!runId) return;
    setMessages((m) =>
      m.map((msg) => {
        if (msg.id !== assistantId) return msg;
        return {
          ...msg,
          toolCalls: msg.toolCalls.map((t) =>
            t.toolCallId === toolCallId
              ? { ...t, status: approved ? 'calling' : 'declined' }
              : t,
          ),
        };
      }),
    );
    const ctl = new AbortController();
    try {
      const stream = resumeToolApproval(
        agent.id,
        { runId, toolCallId, approved },
        ctl.signal,
      );
      await consumeStream(stream, assistantId);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      // eslint-disable-next-line no-console
      console.error('[artifact] approval resume failed:', err);
    }
  }

  // -------------------------------------------------------------------------
  // Save (Monaco editor → workspace)
  // -------------------------------------------------------------------------

  const saveActiveFile = useCallback(async () => {
    if (!agent || !activeFile || savingFile) return;
    setSavingFile(true);
    setSaveBanner(null);
    try {
      const ok = await writeWorkspaceFile(agent.id, activeFile, editorBuffer);
      if (!ok) {
        setSaveBanner('save failed');
        return;
      }
      setActiveFileContent(editorBuffer);
      nextSnapshotSourceRef.current = 'user';
      setIframeKey((k) => k + 1);
      setSaveBanner('saved');
      window.setTimeout(() => setSaveBanner(null), 1500);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[artifact] save failed:', err);
      setSaveBanner(`error: ${err?.message ?? 'unknown'}`);
    } finally {
      setSavingFile(false);
    }
  }, [agent?.id, activeFile, editorBuffer, savingFile]);

  useEffect(() => {
    saveActiveFileRef.current = saveActiveFile;
  }, [saveActiveFile]);

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  function buildPreamble() {
    // CRITICAL path note: BOTH toolsets the agent has access to (the
    // `mastra_workspace_*` Workspace primitive AND the `fs_*` MCP filesystem
    // tools) are rooted at the project's `./workspace/` directory. So every
    // path passed to those tools is relative to `./workspace/` — paths must
    // NOT include a leading `workspace/` segment. If you write to
    // `workspace/artifacts/<sid>/index.html` the file lands at
    // `./workspace/workspace/artifacts/<sid>/index.html` (doubled prefix)
    // and the preview won't find it.
    return [
      'You are running in **Code Artifact mode**.',
      `Build the user's request as a self-contained artifact in this session's artifact folder.`,
      '',
      `**Path rules — read carefully:**`,
      `- The session's artifact folder is \`${sessionFolderPath}/\` (relative to the workspace root).`,
      `- Every file-touching tool you have (\`fs_write_file\`, \`fs_read_text_file\`, \`fs_edit_file\`, \`mastra_workspace_write_file\`, \`mastra_workspace_edit_file\`, etc.) is rooted at the workspace directory. Pass paths WITHOUT a leading \`workspace/\` segment.`,
      `- ✅ Correct:   \`${sessionFolderPath}/index.html\``,
      `- ❌ Incorrect: \`workspace/${sessionFolderPath}/index.html\` (doubles the prefix on disk)`,
      `- For \`mastra_workspace_execute_command\`, the cwd is the workspace root, so refer to files the same way: \`${sessionFolderPath}/index.html\` (e.g. \`node ${sessionFolderPath}/main.js\`).`,
      '',
      'Conventions:',
      '- For visual artifacts prefer a single self-contained `index.html` file (no build step, no external imports beyond CDN <script src> tags) so the UI iframe can render it directly.',
      `- For Node scripts, write \`${sessionFolderPath}/main.js\` and run with \`node ${sessionFolderPath}/main.js\`. For Python, write \`${sessionFolderPath}/main.py\` and run with \`python3 ${sessionFolderPath}/main.py\`.`,
      '- After writing, run / verify the artifact with `mastra_workspace_execute_command` when applicable.',
      '- Keep prose output concise — the UI is showing the file/preview live.',
      '- Do NOT call `updateWorkingMemory` in this mode — working memory is disabled for artifact threads.',
      'User request:',
      '',
    ].join('\n');
  }

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || !agent || streaming) return;
    setInput('');
    setAutoApproveBanner(null);
    const threadId = `artifact-${sessionId}`;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
      toolCalls: [],
    };
    const assistantId = crypto.randomUUID();
    const runId = `run-${crypto.randomUUID()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      text: '',
      toolCalls: [],
      runId,
    };
    currentAssistantIdRef.current = assistantId;
    currentRunIdRef.current = runId;
    setMessages((m) => [...m, userMsg, assistantMsg]);
    setStreaming(true);

    const preamble = buildPreamble();
    const ctl = new AbortController();
    abortRef.current = ctl;
    try {
      const stream = streamAgent(
        agent.id,
        {
          messages: preamble + trimmed,
          memory: {
            thread: threadId,
            resource: RESOURCE_ID,
            // Disable working-memory updates inside artifact threads. The agent
            // was burning a step on `updateWorkingMemory` and then stopping;
            // for an ephemeral artifact session there's no value in persisting
            // a user profile.
            options: {
              workingMemory: { enabled: false },
            },
          },
          runId,
          maxSteps: 25,
        },
        ctl.signal,
      );
      await consumeStream(stream, assistantId);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  text: msg.text || `*stream error: ${err.message ?? err}*`,
                  finished: true,
                }
              : msg,
          ),
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      refreshFiles();
      refreshPastSessions();
    }
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }

  function newArtifact() {
    if (streaming) stop();
    setSessionId(crypto.randomUUID());
    setMessages([]);
    setFiles([]);
    setActiveFile(null);
    setActiveFileContent('');
    setTerminal([]);
    setIframeKey(0);
    handledApprovalsRef.current = new Set();
    setAutoApproveBanner(null);
  }

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------

  const activeFileRel = useMemo(
    () => (activeFile ? relativeToSession(activeFile, sessionId) : ''),
    [activeFile, sessionId],
  );
  const activeMode = useMemo(
    () => (activeFile ? previewModeFor(activeFile) : 'code'),
    [activeFile],
  );
  const activeFileVersions = useMemo(
    () => (activeFile ? versionsByFile[activeFile] ?? [] : []),
    [activeFile, versionsByFile],
  );

  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Pick an agent to start building artifacts.
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950">
      {/* LEFT — chat */}
      <div className="w-[340px] border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800 flex items-center gap-2 relative">
          <PrimitiveBadge primitive="workspace" onTeach={onTeach} compact />
          <div className="text-xs font-semibold text-slate-100">Artifact</div>
          <button
            onClick={() => setShowSessionPicker((v) => !v)}
            disabled={pastSessions.length === 0}
            className="ml-auto text-[11px] px-2 py-0.5 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Switch to a past artifact session"
          >
            history{pastSessions.length > 0 ? ` (${pastSessions.length})` : ''} ▾
          </button>
          <button
            onClick={newArtifact}
            className="text-[11px] px-2 py-0.5 rounded border border-slate-700 hover:bg-slate-800 text-slate-300"
            title="Start a new artifact session"
          >
            + new
          </button>
          {showSessionPicker && (
            <div className="absolute left-3 right-3 top-full mt-1 max-h-80 overflow-y-auto rounded border border-slate-700 bg-slate-900 shadow-lg z-20">
              {pastSessions.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-slate-500">
                  No past sessions yet.
                </div>
              ) : (
                pastSessions.map((s) => {
                  const isCurrent = s.sessionId === sessionId;
                  return (
                    <button
                      key={s.sessionId}
                      onClick={() => loadSession(s.sessionId)}
                      disabled={isCurrent || loadingSession}
                      className={`w-full text-left px-3 py-2 text-[11px] border-b border-slate-800 last:border-b-0 ${
                        isCurrent
                          ? 'bg-slate-800/60 cursor-default'
                          : 'hover:bg-slate-800'
                      } disabled:opacity-60`}
                    >
                      <div className="text-slate-200 truncate">
                        {s.title || `Session ${s.sessionId.slice(0, 8)}`}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                        <span>{s.sessionId.slice(0, 8)}</span>
                        {s.updatedAt && (
                          <span className="ml-auto">
                            {formatRelativeTime(Date.parse(s.updatedAt))}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="ml-auto text-emerald-300">
                            current
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-mono text-slate-500 truncate">
          session: {sessionId.slice(0, 8)} • workspace/{sessionFolderPath}
        </div>

        {autoApproveBanner && (
          <div className="px-3 py-1 bg-sky-500/5 border-b border-sky-500/20 text-[10px] text-sky-300">
            ✓ {autoApproveBanner} (sandboxed path)
          </div>
        )}

        <div ref={messagesScrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {loadingSession && (
            <div className="text-xs text-slate-400">Loading session…</div>
          )}
          {!loadingSession && messages.length === 0 && (
            <div className="text-xs text-slate-500 leading-relaxed">
              <div className="font-semibold text-slate-300 mb-1">Build something.</div>
              The agent writes code into{' '}
              <code className="text-slate-300">workspace/{sessionFolderPath}/</code>
              , runs it in the sandbox, and you see the live preview. Try:
              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
                <li>"Build a single-file HTML clock with a gradient background."</li>
                <li>"Write a Node script that prints the title of example.com."</li>
                <li>"Make a 200×200 SVG of a cat."</li>
              </ul>
              <div className="mt-3 text-[11px] text-slate-500">
                Tip: send follow-ups to refine the artifact — the agent
                remembers the thread. ⌘S in the editor saves your edits.
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className="text-xs">
              {m.role === 'user' ? (
                <div className="rounded px-2 py-1 bg-indigo-500/10 border border-indigo-500/30 text-slate-200">
                  {m.text}
                </div>
              ) : (
                <div className="space-y-1">
                  {m.text && (
                    <div className="text-slate-300 whitespace-pre-wrap leading-snug">
                      {m.text}
                    </div>
                  )}
                  {m.toolCalls.length > 0 && (
                    <div className="space-y-0.5">
                      {m.toolCalls.map((tc) => (
                        <ArtifactToolLine
                          key={tc.toolCallId}
                          tc={tc}
                          onClick={() => focusToolCall(tc)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="describe an artifact…"
            disabled={streaming}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded text-xs p-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <div className="mt-1 flex gap-2">
            {streaming ? (
              <button
                onClick={stop}
                className="flex-1 text-xs py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30"
              >
                stop
              </button>
            ) : (
              <button
                onClick={send}
                disabled={!input.trim()}
                className="flex-1 text-xs py-1 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                build
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CENTER — preview */}
      <div className="flex-1 flex flex-col border-r border-slate-800 min-w-0">
        <div className="p-2 border-b border-slate-800 flex items-center gap-2">
          <select
            value={activeFile ?? ''}
            onChange={(e) => setActiveFile(e.target.value || null)}
            className="bg-slate-900 border border-slate-700 rounded text-[11px] py-0.5 px-2 text-slate-200 max-w-[40%]"
          >
            {!activeFile && <option value="">— no file —</option>}
            {files.map((f) => (
              <option key={f.path} value={f.path}>
                {relativeToSession(f.path, sessionId)}
              </option>
            ))}
          </select>
          <div className="flex-1" />
          <div className="flex items-center gap-0 text-[11px] rounded border border-slate-700 overflow-hidden">
            {(['preview', 'split', 'code'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPreviewMode(m)}
                className={`px-2 py-0.5 ${m !== 'preview' ? 'border-l border-slate-700' : ''} ${
                  previewMode === m
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {activeFile && (
            <button
              onClick={saveActiveFile}
              disabled={savingFile || editorBuffer === activeFileContent}
              className="text-[11px] px-2 py-0.5 rounded bg-emerald-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500"
              title="Save edits to workspace (⌘S)"
            >
              {savingFile ? 'saving…' : editorBuffer === activeFileContent ? 'saved' : 'save'}
            </button>
          )}
          {activeFile && activeFileVersions.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowVersions((v) => !v)}
                className="text-[11px] px-2 py-0.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800"
                title="Earlier versions of this file"
              >
                history ({activeFileVersions.length})
              </button>
              {showVersions && (
                <div className="absolute right-0 top-full mt-1 w-72 max-h-72 overflow-y-auto rounded border border-slate-700 bg-slate-900 shadow-lg z-10">
                  {[...activeFileVersions].reverse().map((v, i) => {
                    const reverseIndex = activeFileVersions.length - 1 - i;
                    const isCurrent = v.content === editorBuffer;
                    return (
                      <button
                        key={`${v.ts}-${reverseIndex}`}
                        onClick={() => {
                          setEditorBuffer(v.content);
                          setShowVersions(false);
                          setPreviewMode((m) =>
                            m === 'preview' ? 'split' : m,
                          );
                        }}
                        className={`w-full text-left px-2 py-1.5 text-[11px] border-b border-slate-800 last:border-b-0 hover:bg-slate-800 ${
                          isCurrent ? 'bg-slate-800/60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              v.source === 'user'
                                ? 'text-emerald-300'
                                : 'text-sky-300'
                            }
                          >
                            {v.source === 'user' ? '✎ user' : '🤖 agent'}
                          </span>
                          <span className="text-slate-500">
                            v{reverseIndex + 1}
                          </span>
                          <span className="ml-auto text-slate-500">
                            {formatRelativeTime(v.ts)}
                          </span>
                        </div>
                        <div className="text-slate-500 mt-0.5 truncate font-mono">
                          {v.content.slice(0, 80) || '(empty)'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {saveBanner && (
            <span className="text-[10px] text-slate-400">{saveBanner}</span>
          )}
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="text-[11px] text-slate-500 hover:text-slate-200"
            title="Reload preview"
          >
            ⟳
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden flex">
          {!activeFile && (
            <div className="h-full w-full flex items-center justify-center text-slate-600 text-xs">
              The agent's first file will appear here.
            </div>
          )}
          {activeFile && (previewMode === 'preview' || previewMode === 'split') && (
            <div className={previewMode === 'split' ? 'w-1/2 h-full border-r border-slate-800 min-w-0' : 'w-full h-full min-w-0'}>
              <PreviewBody
                key={iframeKey}
                sessionId={sessionId}
                filePath={activeFile}
                relPath={activeFileRel}
                mode={activeMode}
                content={activeFileContent}
              />
            </div>
          )}
          {activeFile && (previewMode === 'code' || previewMode === 'split') && (
            <div className={previewMode === 'split' ? 'w-1/2 h-full min-w-0' : 'w-full h-full min-w-0'}>
              <Editor
                height="100%"
                language={monacoLanguageFor(activeFile)}
                theme="vs-dark"
                value={editorBuffer}
                onChange={(v) => setEditorBuffer(v ?? '')}
                onMount={(editor, monaco) => {
                  editor.addCommand(
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                    () => {
                      saveActiveFileRef.current();
                    },
                  );
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  tabSize: 2,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — files / terminal */}
      <div className="w-[300px] flex flex-col">
        <div className="flex border-b border-slate-800 text-[11px]">
          <button
            onClick={() => setRightTab('files')}
            className={`flex-1 py-1.5 ${
              rightTab === 'files'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            Files {files.length > 0 && `(${files.length})`}
          </button>
          <button
            onClick={() => setRightTab('terminal')}
            className={`flex-1 py-1.5 border-l border-slate-800 ${
              rightTab === 'terminal'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            Terminal {terminal.length > 0 && `(${terminal.length})`}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rightTab === 'files' && (
            <FilesPane
              files={files}
              sessionId={sessionId}
              activeFile={activeFile}
              onSelect={setActiveFile}
              onRefresh={refreshFiles}
            />
          )}
          {rightTab === 'terminal' && <TerminalPane entries={terminal} />}
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------------------
  // Helpers (closure over state)
  // -------------------------------------------------------------------------

  function focusToolCall(tc: { toolName: string; args?: unknown; result?: unknown; toolCallId: string }) {
    if (WRITE_TOOLS.has(tc.toolName)) {
      const path = extractPath(tc.args, tc.result);
      if (path) {
        setActiveFile(path);
        setPreviewMode('code');
      }
    } else if (EXEC_TOOLS.has(tc.toolName)) {
      setRightTab('terminal');
    }
  }
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function PreviewBody(props: {
  sessionId: string;
  filePath: string;
  relPath: string;
  mode: ReturnType<typeof previewModeFor>;
  content: string;
}) {
  const { sessionId, filePath, relPath, mode, content } = props;
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
      <div className="h-full overflow-auto p-4 text-sm text-slate-200 prose prose-invert prose-sm">
        <pre className="whitespace-pre-wrap font-sans">{content}</pre>
      </div>
    );
  }
  return (
    <pre className="h-full overflow-auto m-0 p-3 text-[11px] font-mono text-slate-200 bg-slate-950 leading-relaxed whitespace-pre-wrap">
      {content || '(empty)'}
    </pre>
  );
}

function FilesPane(props: {
  files: WorkspaceEntry[];
  sessionId: string;
  activeFile: string | null;
  onSelect: (path: string) => void;
  onRefresh: () => void;
}) {
  const { files, sessionId, activeFile, onSelect, onRefresh } = props;
  return (
    <div className="text-xs">
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
              <span className="truncate">{relativeToSession(f.path, sessionId)}</span>
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
    <div className="font-mono text-[11px] p-2 space-y-2">
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
                e.status === 'error' ? 'text-rose-300' : 'text-emerald-300'
              }`}
            >
              {e.exitCode != null ? `exit ${e.exitCode}` : e.status}
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

function unwrap(v: unknown): unknown {
  let x = v;
  for (let i = 0; i < 3; i++) {
    if (x && typeof x === 'object' && 'data' in (x as any) && Object.keys(x as any).length <= 2) {
      x = (x as any).data;
      continue;
    }
    if (x && typeof x === 'object' && 'result' in (x as any) && Object.keys(x as any).length <= 2) {
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

/**
 * Best-effort conversion of stored MemoryMessages back into the local Message
 * shape used by the chat pane. Memory `content` may be a plain string or an
 * array of structured parts ({type:'text'|'tool-call'|'tool-result', ...}).
 * Past tool calls render with the 'done' status — we don't have live status
 * info for completed runs we're replaying.
 */
function memoryMessagesToLocal(raw: MemoryMessage[]): Message[] {
  type ToolCallStub = Message['toolCalls'][number];
  const toolCallById = new Map<string, ToolCallStub>();
  const out: Message[] = [];
  for (const m of raw) {
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    let text = '';
    const toolCalls: ToolCallStub[] = [];
    const parts = Array.isArray(m.content)
      ? (m.content as any[])
      : typeof m.content === 'string'
        ? [{ type: 'text', text: m.content }]
        : [];
    for (const p of parts) {
      if (!p || typeof p !== 'object') continue;
      if (p.type === 'text' && typeof p.text === 'string') {
        text += p.text;
      } else if (p.type === 'tool-call' && p.toolCallId) {
        const tc: ToolCallStub = {
          toolCallId: p.toolCallId,
          toolName: p.toolName ?? '',
          args: p.args,
          status: 'done',
        };
        toolCalls.push(tc);
        toolCallById.set(p.toolCallId, tc);
      } else if (p.type === 'tool-result' && p.toolCallId) {
        const existing = toolCallById.get(p.toolCallId);
        if (existing) existing.result = p.result;
      }
    }
    out.push({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      text,
      toolCalls,
      finished: true,
    });
  }
  return out;
}

function formatRelativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function monacoLanguageFor(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
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

/**
 * Recursively list `artifacts/<sessionId>/...` (depth-limited so we don't
 * blow up if the agent creates a deep tree). Returns flat list of files
 * with paths relative to the workspace root.
 */
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
