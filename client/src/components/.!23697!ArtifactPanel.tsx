import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AgentSummary,
  Chunk,
  streamAgent,
  resumeToolApproval,
  listWorkspace,
  readWorkspaceFile,
  WorkspaceEntry,
} from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';
import {
  artifactUrl,
  isInsideArtifactSession,
  previewModeFor,
  relativeToSession,
} from '../lib/artifactPreview';

interface Props {
  agent: AgentSummary | null;
  onTeach: (id: PrimitiveId) => void;
}

const RESOURCE_ID = 'mastra-bowl-demo-user';

type ArtifactToolCall = {
  id: string;
  toolName: string;
  args: any;
  /** workspace-write | workspace-edit | sandbox-exec | other */
  kind: 'workspace-write' | 'workspace-edit' | 'sandbox-exec' | 'other';
  status: 'calling' | 'awaiting-approval' | 'auto-approved' | 'done' | 'error';
  result?: any;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  toolCalls: ArtifactToolCall[];
  finished?: boolean;
  runId?: string;
};

type TerminalEntry = {
  id: string;
  command: string;
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
  status: 'running' | 'done' | 'error';
};

function classifyKind(toolName: string): ArtifactToolCall['kind'] {
  if (
    toolName === 'mastra_workspace_write_file' ||
    toolName === 'fs_write_file'
  )
    return 'workspace-write';
  if (
    toolName === 'mastra_workspace_edit_file' ||
    toolName === 'mastra_workspace_ast_edit'
  )
    return 'workspace-edit';
  if (toolName === 'mastra_workspace_execute_command') return 'sandbox-exec';
  return 'other';
}

function truncate(s: string, n: number): string {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function buildPreamble(sessionId: string): string {
  const dir = `workspace/artifacts/${sessionId}`;
  return [
    '## Code Artifact mode',
    '',
    `You are building a runnable artifact for the user inside the directory \`${dir}/\`.`,
    '',
    'Rules:',
    `- Write all files INSIDE \`${dir}/\`. Never write outside this folder.`,
    '- For visual artifacts (UI, animations, charts, mock pages): produce a single self-contained `index.html` with inline CSS + JS, no build step.',
    '- For Node scripts: write a `.js` or `.mjs` file and run with `node <file>` via execute_command.',
    '- For Python scripts: use `python3 <file>`.',
    '- For SVG/PNG art assets: write the file directly and stop.',
    '- After writing, verify by running the artifact when applicable. Keep commands short.',
    '- Keep your chat replies very short — the UI shows the file and preview live.',
    '',
    'User request:',
    '',
  ].join('\n');
}

export function ArtifactPanel({ agent, onTeach }: Props) {
  const [sessionId, setSessionId] = useState<string>(
    () => `art-${Math.random().toString(36).slice(2, 10)}`,
  );
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<WorkspaceEntry[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string | null>(
    null,
  );
  const [terminal, setTerminal] = useState<TerminalEntry[]>([]);
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview');
  const [rightTab, setRightTab] = useState<'files' | 'terminal'>('files');
  const [iframeKey, setIframeKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;
  const filesRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const sessionRoot = `workspace/artifacts/${sessionId}`;

  // Refresh the file tree (debounced — multiple writes in a row coalesce).
  const refreshFiles = useCallback(async () => {
    if (!agent) return;
    if (filesRefreshRef.current) clearTimeout(filesRefreshRef.current);
    filesRefreshRef.current = setTimeout(async () => {
      const list = await listWorkspace(agent.id, sessionRoot);
      setFiles(list);
    }, 150);
  }, [agent?.id, sessionRoot]);

  // Load file content when activeFile changes.
  useEffect(() => {
    if (!agent || !activeFile) {
      setActiveFileContent(null);
      return;
    }
    let alive = true;
    readWorkspaceFile(agent.id, activeFile).then((res) => {
      if (!alive) return;
      setActiveFileContent(res?.content ?? null);
    });
    return () => {
      alive = false;
    };
  }, [agent?.id, activeFile, iframeKey]);

  // Clear panes when session changes.
  useEffect(() => {
    setMessages([]);
    setFiles([]);
    setActiveFile(null);
    setActiveFileContent(null);
    setTerminal([]);
    refreshFiles();
  }, [sessionId, refreshFiles]);

  function newArtifact() {
    if (streaming) return;
    setSessionId(`art-${Math.random().toString(36).slice(2, 10)}`);
  }

  // ----- Approval helper ---------------------------------------------------

  const approveCall = useCallback(
    async (runId: string, toolCallId: string) => {
      if (!agent) return;
      try {
        const stream = resumeToolApproval(agent.id, {
          runId,
          toolCallId,
          approved: true,
        });
        for await (const chunk of stream) {
          // Fold the resumed stream's chunks back into the original
          // assistant message that owns this toolCallId.
          const assistantId = messagesRef.current.find((m) =>
            m.toolCalls.some((t) => t.id === toolCallId),
          )?.id;
          if (assistantId) {
            applyChunk(chunk, assistantId);
          }
        }
      } catch (err: any) {
        setError(`approve failed: ${err?.message ?? err}`);
      }
    },
    [agent?.id],
  );

  // ----- Stream chunk reducer ---------------------------------------------

  const applyChunk = useCallback(
    (chunk: Chunk, assistantId: string) => {
      const type = chunk.type;
      setMessages((msgs) =>
        msgs.map((msg) => {
          if (msg.id !== assistantId) return msg;

          switch (type) {
            case 'text-delta': {
              return { ...msg, text: msg.text + (chunk.payload?.text ?? '') };
            }
            case 'tool-call': {
              const id = chunk.payload?.toolCallId ?? crypto.randomUUID();
              if (msg.toolCalls.some((t) => t.id === id)) return msg;
              const toolName = chunk.payload?.toolName ?? 'unknown';
              const args = chunk.payload?.args;
              return {
                ...msg,
                toolCalls: [
                  ...msg.toolCalls,
                  {
                    id,
                    toolName,
                    args,
                    kind: classifyKind(toolName),
                    status: 'calling',
                  },
                ],
              };
            }
            case 'tool-call-approval':
            case 'data-tool-call-approval': {
              const id = chunk.payload?.toolCallId ?? chunk.data?.toolCallId;
              const toolName =
                chunk.payload?.toolName ?? chunk.data?.toolName ?? 'unknown';
              const args = chunk.payload?.args ?? chunk.data?.args;
              const path: string | undefined = args?.path ?? args?.filePath;
              const sessionScoped = path
                ? isInsideArtifactSession(path, sessionId)
                : toolName === 'mastra_workspace_execute_command';
              const status: ArtifactToolCall['status'] = sessionScoped
                ? 'auto-approved'
                : 'awaiting-approval';

              const existing = msg.toolCalls.find((t) => t.id === id);
              const next: ArtifactToolCall = {
                id: id ?? crypto.randomUUID(),
                toolName,
                args,
                kind: classifyKind(toolName),
                status,
                result: existing?.result,
              };

              // Auto-approve outside the reducer so we don't fire side
              // effects in render. Schedule it on a microtask.
              if (sessionScoped && msg.runId && id) {
                queueMicrotask(() => approveCall(msg.runId!, id));
              }

              const toolCalls = existing
                ? msg.toolCalls.map((t) => (t.id === id ? next : t))
                : [...msg.toolCalls, next];
              return { ...msg, toolCalls };
            }
            case 'tool-result': {
              const id = chunk.payload?.toolCallId;
              const isError = chunk.payload?.isError;
              return {
                ...msg,
                toolCalls: msg.toolCalls.map((t) =>
                  t.id === id
                    ? {
                        ...t,
                        result: chunk.payload?.result,
                        status: isError ? 'error' : 'done',
                      }
                    : t,
                ),
              };
            }
            case 'tool-error': {
              const id = chunk.payload?.toolCallId;
              return {
                ...msg,
                toolCalls: msg.toolCalls.map((t) =>
                  t.id === id
                    ? {
                        ...t,
                        result: chunk.payload?.error,
                        status: 'error',
                      }
                    : t,
                ),
              };
            }
            case 'finish': {
              return { ...msg, finished: true };
            }
            case 'error': {
              const err = chunk.payload?.error;
              return {
                ...msg,
                text:
                  msg.text +
                  `\n\n*error: ${typeof err === 'string' ? err : JSON.stringify(err)}*`,
                finished: true,
              };
            }
            default:
              return msg;
          }
        }),
      );

      // Side-effects driven by tool calls — files panel, terminal panel.
      if (type === 'tool-call' || type === 'tool-result') {
        const payload = chunk.payload ?? {};
        const toolCallId = payload.toolCallId;
        const toolName = payload.toolName;
        // For tool-call we know the toolName + args; for tool-result we don't,
        // so look it up in the current message state.
        const lookup = messagesRef.current
          .flatMap((m) => m.toolCalls)
          .find((t) => t.id === toolCallId);

        const effectiveName = toolName ?? lookup?.toolName;
        const effectiveArgs = payload.args ?? lookup?.args ?? {};

        if (
          effectiveName === 'mastra_workspace_write_file' ||
          effectiveName === 'mastra_workspace_edit_file' ||
          effectiveName === 'mastra_workspace_ast_edit'
        ) {
          const path: string | undefined =
            effectiveArgs.path ?? effectiveArgs.filePath;
          if (path && isInsideArtifactSession(path, sessionId) && type === 'tool-result') {
            setActiveFile(path);
            setIframeKey((k) => k + 1);
            refreshFiles();
            setRightTab('files');
            setPreviewTab('preview');
          }
        }

        if (effectiveName === 'mastra_workspace_execute_command') {
          const cmd = effectiveArgs.command ?? effectiveArgs.cmd ?? '';
          if (type === 'tool-call') {
            setTerminal((tt) => [
              ...tt,
              {
                id: toolCallId ?? crypto.randomUUID(),
                command: cmd,
                status: 'running',
              },
            ]);
            setRightTab('terminal');
          }
          if (type === 'tool-result') {
            const result = payload.result ?? {};
            const stdout =
              typeof result === 'string' ? result : (result.stdout ?? '');
            const stderr = typeof result === 'object' ? (result.stderr ?? '') : '';
            const exitCode =
              typeof result === 'object' ? (result.exitCode ?? null) : null;
            setTerminal((tt) =>
              tt.map((e) =>
                e.id === toolCallId
                  ? {
                      ...e,
                      stdout,
                      stderr,
                      exitCode,
                      status: payload.isError ? 'error' : 'done',
                    }
                  : e,
              ),
            );
            // Refresh files in case the script wrote new files.
            refreshFiles();
          }
        }
      }
    },
    [sessionId, approveCall, refreshFiles],
  );

  // ----- Send prompt -------------------------------------------------------

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !agent || streaming) return;
    setError(null);
    setInput('');

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
    setMessages((m) => [...m, userMsg, assistantMsg]);
    setStreaming(true);

    const ctl = new AbortController();
    abortRef.current = ctl;

    const threadId = `artifact-${sessionId}`;
    const preamble = buildPreamble(sessionId);

    try {
      const stream = streamAgent(
        agent.id,
        {
          messages: `${preamble}${trimmed}`,
          memory: { thread: threadId, resource: RESOURCE_ID },
          runId,
        },
        ctl.signal,
      );
      for await (const chunk of stream) {
        applyChunk(chunk, assistantId);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError(String(err?.message ?? err));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      refreshFiles();
    }
  }, [agent?.id, applyChunk, input, refreshFiles, sessionId, streaming]);

  function abort() {
    abortRef.current?.abort();
  }

  // ----- Derived preview ---------------------------------------------------

  const previewMode = previewModeFor(activeFile);
  const previewSrc =
    activeFile && previewMode !== 'empty'
      ? artifactUrl(sessionId, activeFile)
      : null;

  if (!agent) {
    return (
      <div className="flex-1 p-6 text-slate-400 text-sm">
        Select an agent to start an artifact session.
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* ============================ LEFT: Chat ============================ */}
      <section className="w-[360px] flex flex-col border-r border-slate-800 bg-slate-950/40">
        <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold flex items-center gap-2">
              Artifact
              <PrimitiveBadge primitive="workspace" onTeach={onTeach} compact />
              <PrimitiveBadge primitive="sandbox" onTeach={onTeach} compact />
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {sessionRoot}
            </div>
          </div>
          <button
            onClick={newArtifact}
            className="text-xs px-2 py-1 rounded border border-slate-700 hover:bg-slate-800 disabled:opacity-50"
            disabled={streaming}
            title="Start a new artifact session (resets panes; old files stay on disk)"
          >
            New
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-xs text-slate-500 leading-relaxed">
              <p className="mb-2">
                Tell the agent what to build. It will write files into{' '}
                <span className="font-mono text-slate-400">
                  {sessionRoot}/
                </span>{' '}
                and run them in the sandbox. Tool calls scoped to this folder
                are auto-approved so the loop stays fluid.
              </p>
              <p className="mb-2 text-slate-400">Try:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>
                  &ldquo;Build me a single-file HTML page that shows the
                  current time updating every second.&rdquo;
                </li>
                <li>
                  &ldquo;Write a Node script that fetches example.com and
                  prints the title, then run it.&rdquo;
                </li>
                <li>&ldquo;Create a 200×200 SVG of a cat.&rdquo;</li>
              </ul>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              {m.role === 'user' ? (
                <div className="rounded bg-indigo-500/10 border border-indigo-500/30 px-3 py-2 text-slate-100">
                  {m.text}
                </div>
              ) : (
                <div className="space-y-2">
                  {m.text && (
                    <div className="prose prose-invert prose-sm max-w-none text-slate-200">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  )}
                  {m.toolCalls.map((t) => (
                    <ToolLine
                      key={t.id}
                      tc={t}
                      sessionId={sessionId}
                      onClickFile={(p) => {
                        setActiveFile(p);
                        setRightTab('files');
                        setPreviewTab('preview');
                      }}
                      onClickExec={() => setRightTab('terminal')}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded px-2 py-1">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="What should the agent build?  (⌘/Ctrl+Enter)"
            className="w-full h-20 bg-slate-900 border border-slate-700 rounded p-2 text-sm resize-none focus:outline-none focus:border-indigo-500"
            disabled={streaming}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-[11px] text-slate-500">
              {streaming ? 'streaming…' : 'idle'}
            </div>
            {streaming ? (
              <button
                onClick={abort}
                className="text-xs px-3 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={send}
                className="text-xs px-3 py-1 rounded bg-indigo-500 hover:bg-indigo-400 text-white disabled:opacity-50"
                disabled={!input.trim()}
              >
                Send
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================== CENTER: Preview ======================== */}
      <section className="flex-1 flex flex-col bg-slate-950">
        <header className="px-4 py-2 border-b border-slate-800 flex items-center gap-3">
          <div className="text-xs font-mono text-slate-400 truncate flex-1">
            {activeFile
              ? relativeToSession(activeFile, sessionId)
              : 'no file selected'}
          </div>
          <TabButton
            active={previewTab === 'preview'}
            onClick={() => setPreviewTab('preview')}
          >
            Preview
          </TabButton>
          <TabButton
            active={previewTab === 'code'}
            onClick={() => setPreviewTab('code')}
          >
            Code
          </TabButton>
          {previewMode === 'iframe' && (
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="text-[11px] px-2 py-0.5 rounded border border-slate-700 hover:bg-slate-800"
              title="Reload the preview"
            >
