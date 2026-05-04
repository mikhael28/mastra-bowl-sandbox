import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AgentSummary,
  streamAgent,
  resumeToolApproval,
  speakText,
  listMemoryThreads,
  listVoiceSpeakers,
  getMemoryThreadMessages,
  deleteMemoryThread,
  renameMemoryThread,
  MemoryThreadSummary,
  MemoryMessage,
  Chunk,
  TokenUsage,
} from '../lib/mastraClient';
import { describeError, logError } from '../lib/errorLog';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';
import { VoiceControls } from './VoiceControls';
import { ToolCallRouter } from './tool-cards/ToolCallRouter';
import { ToolCallState } from './tool-cards/types';
import { EvalBadges } from './EvalBadges';
import { WorkspaceExplorer } from './side-panels/WorkspaceExplorer';
import { TodosRail } from './side-panels/TodosRail';
import { WorkingMemoryView } from './side-panels/WorkingMemoryView';
import { ToolCatalogDrawer } from './side-panels/ToolCatalogDrawer';
import { ArtifactRail } from './side-panels/ArtifactRail';
import {
  addBreakdown,
  breakdownFromUsage,
  computeCost,
  EMPTY_BREAKDOWN,
  formatCost,
  formatTokens,
  TokenBreakdown,
} from '../lib/cost';

import { type Message, applyChunkToMessage } from '../lib/streamParse';

interface Props {
  agent: AgentSummary | null;
  onTeach: (id: PrimitiveId) => void;
  /** Called after every finished turn (stream, approval resume). Lets the App
   * refresh the Observability trace list so the new run appears. */
  onTurnFinished?: () => void;
  /** Called when the user clicks "view trace" on a message. Deep-links into
   * the Observability tab, passing the runId we assigned at stream start. */
  onViewTrace?: (runId: string) => void;
}

const RESOURCE_ID = 'mastra-bowl-demo-user';

/** Right-rail panel selection. `null` = rail collapsed. */
type RailPanel = 'files' | 'todos' | 'memory' | 'build' | null;

/** Preamble injected when the user toggles "Build" mode in the input — same
 * one the standalone Artifact tab used to use. The thread id doubles as the
 * artifact session id, so files land under workspace/artifacts/<sid>/. */
function buildArtifactPreamble(sessionId: string): string {
  const folder = `artifacts/${sessionId}`;
  return [
    'You are running in **Build (artifact) mode**.',
    `Build the user's request as a self-contained artifact in this thread's artifact folder.`,
    '',
    `**Path rules — read carefully:**`,
    `- The session's artifact folder is \`${folder}/\` (relative to the workspace root).`,
    `- Every file-touching tool (\`fs_write_file\`, \`fs_read_text_file\`, \`fs_edit_file\`, \`mastra_workspace_write_file\`, \`mastra_workspace_edit_file\`, etc.) is rooted at the workspace directory. Pass paths WITHOUT a leading \`workspace/\` segment.`,
    `- ✅ Correct:   \`${folder}/index.html\``,
    `- ❌ Incorrect: \`workspace/${folder}/index.html\``,
    `- For \`mastra_workspace_execute_command\`, the cwd is the workspace root, so refer to files the same way: \`${folder}/index.html\`.`,
    '',
    'Conventions:',
    '- For visual artifacts prefer a single self-contained `index.html` (no build step, only CDN <script src> tags) so the in-rail iframe can render it directly.',
    `- For Node scripts, write \`${folder}/main.js\` and run with \`node ${folder}/main.js\`. For Python, \`${folder}/main.py\` run with \`python3 ${folder}/main.py\`.`,
    '- After writing, run / verify the artifact with `mastra_workspace_execute_command` when applicable.',
    '- Keep prose output concise — the right-rail is showing the file/preview live.',
    '',
    'User request:',
    '',
  ].join('\n');
}

/** Map a chat thread id to a stable artifact session id. */
function sessionIdFromThread(threadId: string): string {
  return threadId.replace(/^t-/, '').replace(/^artifact-/, '');
}

export function Chat({ agent, onTeach, onTurnFinished, onViewTrace }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [threads, setThreads] = useState<MemoryThreadSummary[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadPanelOpen, setThreadPanelOpen] = useState(true);
  const [pendingSpeak, setPendingSpeak] = useState<{ id: string; text: string } | null>(null);
  const [hasVoice, setHasVoice] = useState(false);

  // Right-rail state (Workspace Explorer / Todos / Working Memory).
  const [railPanel, setRailPanel] = useState<RailPanel>(null);
  const [workspaceFileToOpen, setWorkspaceFileToOpen] = useState<string | null>(null);
  const [todoRefreshNonce, setTodoRefreshNonce] = useState(0);
  const [memoryRefreshNonce, setMemoryRefreshNonce] = useState(0);
  const [evalRefreshNonce, setEvalRefreshNonce] = useState(0);
  const [catalogOpen, setCatalogOpen] = useState(false);
  // "Build" (artifact) mode: when on, prepends the artifact preamble to user
  // messages so the agent writes into workspace/artifacts/<thread-id>/.
  const [buildMode, setBuildMode] = useState(false);
  // Bumped after every finished turn so the ArtifactRail re-fetches its file
  // listing — the agent may have just written new files.
  const [artifactRefreshNonce, setArtifactRefreshNonce] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentAssistantIdRef = useRef<string | null>(null);
  const currentRunIdRef = useRef<string | null>(null);
  // Approvals fired during a stream are queued here and drained sequentially
  // after the active stream finishes — the resume call cannot run concurrently
  // with the suspended outer stream or the run terminates early.
  const pendingApprovalsRef = useRef<Array<{ toolCallId: string }>>([]);
  const handledApprovalsRef = useRef<Set<string>>(new Set());

  // Known subagents + workflows for this agent — fed into the router so
  // subagent/workflow tool calls get the right specialized card.
  const knownSubagents = useMemo(
    () => Object.keys(agent?.agents ?? {}),
    [agent?.agents],
  );
  const knownWorkflows = useMemo(
    () => Object.keys(agent?.workflows ?? {}),
    [agent?.workflows],
  );

  const refreshThreads = useCallback(async () => {
    if (!agent) return [] as MemoryThreadSummary[];
    setThreadsLoading(true);
    try {
      const list = await listMemoryThreads({
        resourceId: RESOURCE_ID,
        agentId: agent.id,
      });
      const sorted = [...list].sort((a, b) => {
        const ta = Date.parse(a.updatedAt ?? a.createdAt ?? '') || 0;
        const tb = Date.parse(b.updatedAt ?? b.createdAt ?? '') || 0;
        return tb - ta;
      });
      setThreads(sorted);
      return sorted;
    } finally {
      setThreadsLoading(false);
    }
  }, [agent?.id]);

  useEffect(() => {
    if (!agent) {
      setMessages([]);
      setThreads([]);
      setCurrentThreadId(null);
      return;
    }
    setMessages([]);
    setCurrentThreadId(null);
    refreshThreads().then((sorted) => {
      const newest = sorted[0];
      if (newest) setCurrentThreadId(newest.id);
    });
  }, [agent?.id, refreshThreads]);

  useEffect(() => {
    if (!agent) {
      setHasVoice(false);
      return;
    }
    let alive = true;
    setHasVoice(false);
    listVoiceSpeakers(agent.id).then((speakers) => {
      if (alive) setHasVoice(speakers.length > 0);
    });
    return () => {
      alive = false;
    };
  }, [agent?.id]);

  useEffect(() => {
    if (!agent || !currentThreadId) {
      setMessages([]);
      return;
    }
    let alive = true;
    getMemoryThreadMessages(currentThreadId, { agentId: agent.id }).then(
      (raw) => {
        if (!alive) return;
        setMessages(rehydrateMessages(raw));
      },
    );
    return () => {
      alive = false;
    };
  }, [currentThreadId, agent?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  function ensureThreadId(): string {
    if (currentThreadId) return currentThreadId;
    const id = `t-${crypto.randomUUID()}`;
    setCurrentThreadId(id);
    return id;
  }

  function newThread() {
    if (streaming) return;
    const id = `t-${crypto.randomUUID()}`;
    setMessages([]);
    setCurrentThreadId(id);
  }

  async function deleteThread(threadId: string) {
    if (!agent || streaming) return;
    if (
      !window.confirm(
        'Delete this thread and all of its messages? This cannot be undone.',
      )
    ) {
      return;
    }
    const ok = await deleteMemoryThread(threadId);
    if (!ok) {
      logError({
        source: 'mastra',
        message: `Failed to delete thread ${threadId}`,
        agentId: agent.id,
        threadId,
      });
      return;
    }
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (currentThreadId === threadId) {
      setMessages([]);
      setCurrentThreadId(null);
    }
    refreshThreads();
  }

  async function deleteAllThreads() {
    if (!agent || streaming) return;
    if (threads.length === 0) return;
    if (
      !window.confirm(
        `Delete ALL ${threads.length} threads for ${agent.name ?? agent.id}? This cannot be undone.`,
      )
    ) {
      return;
    }
    const results = await Promise.all(
      threads.map((t) =>
        deleteMemoryThread(t.id).then((ok) => ({ id: t.id, ok })),
      ),
    );
    const failed = results.filter((r) => !r.ok);
    if (failed.length) {
      logError({
        source: 'mastra',
        message: `Failed to delete ${failed.length}/${results.length} threads`,
        agentId: agent.id,
      });
    }
    setMessages([]);
    setCurrentThreadId(null);
    refreshThreads();
  }

  async function renameThread(threadId: string, current: string | undefined) {
    if (!agent || streaming) return;
    const next = window.prompt('Rename thread', current ?? '');
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === current) return;
    const ok = await renameMemoryThread(threadId, trimmed);
    if (!ok) {
      logError({
        source: 'mastra',
        message: `Failed to rename thread ${threadId}`,
        agentId: agent.id,
        threadId,
      });
      return;
    }
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, title: trimmed } : t)),
    );
  }

  async function consumeStream(
    stream: AsyncGenerator<Chunk, void, void>,
    assistantId: string,
    threadId: string | null,
  ): Promise<string> {
    let accumulated = '';
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
      if (chunk.type === 'text-delta') {
        accumulated += chunk.payload?.text ?? '';
      }
      // Auto-approve every tool-call-approval — the user has opted out of
      // per-call gating in this UI. The resume call must run sequentially
      // after the suspended outer stream drains, so queue and drain below.
      if (
        chunk.type === 'tool-call-approval' ||
        chunk.type === 'data-tool-call-approval'
      ) {
        const toolCallId =
          chunk.payload?.toolCallId ?? chunk.data?.toolCallId;
        if (toolCallId && !handledApprovalsRef.current.has(toolCallId)) {
          handledApprovalsRef.current.add(toolCallId);
          pendingApprovalsRef.current.push({ toolCallId });
        }
      }
      applyChunkToMessage(chunk, assistantId, setMessages, onTeach, {
        agentId: agent?.id,
        threadId: threadId ?? undefined,
      });
    }
    while (pendingApprovalsRef.current.length > 0) {
      const next = pendingApprovalsRef.current.shift()!;
      await runResume(next.toolCallId, true, assistantId, threadId);
    }
    return accumulated;
  }

  async function runResume(
    toolCallId: string,
    approved: boolean,
    assistantId: string,
    threadId: string | null,
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
      await consumeStream(stream, assistantId, threadId);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      const e = describeError(err);
      logError({
        source: 'approval',
        message: `auto-approve resume failed: ${e.message}`,
        detail: e.detail,
        agentId: agent.id,
        threadId: threadId ?? undefined,
        runId,
      });
    }
  }

  async function sendText(userText: string) {
    const trimmed = userText.trim();
    if (!trimmed || !agent || streaming) return;
    const threadId = ensureThreadId();
    const sessionId = sessionIdFromThread(threadId);
    // In Build mode the agent gets the artifact preamble prepended to its
    // input. We keep the user-visible bubble showing only the user's prompt.
    const agentInput = buildMode
      ? buildArtifactPreamble(sessionId) + trimmed
      : trimmed;
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
    handledApprovalsRef.current = new Set();
    pendingApprovalsRef.current = [];
    setMessages((m) => [...m, userMsg, assistantMsg]);
    setStreaming(true);

    const ctl = new AbortController();
    abortRef.current = ctl;

    let finalText = '';
    try {
      const stream = streamAgent(
        agent.id,
        {
          messages: agentInput,
          memory: {
            thread: threadId,
            resource: RESOURCE_ID,
            // Disable working-memory writes in Build mode — same rationale as
            // the old Artifact tab: the agent was burning a step on
            // updateWorkingMemory and stopping early, and per-thread artifact
            // sessions don't need a persisted user profile.
            ...(buildMode
              ? { options: { workingMemory: { enabled: false } } }
              : {}),
          },
          runId,
          ...(buildMode ? { maxSteps: 25 } : {}),
        },
        ctl.signal,
      );
      finalText = await consumeStream(stream, assistantId, threadId);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        finalText = '';
      } else {
        const e = describeError(err);
        logError({
          source: 'stream',
          message: e.message,
          detail: e.detail,
          agentId: agent.id,
          threadId,
          runId,
        });
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
      if (finalText.trim()) {
        setPendingSpeak({ id: assistantId, text: finalText });
      }
      refreshThreads();
      // When the turn completes, nudge the right-rail panels to refresh —
      // todos and working memory may have been mutated by tools or by the
      // agent's updateWorkingMemory call.
      setTodoRefreshNonce((n) => n + 1);
      setMemoryRefreshNonce((n) => n + 1);
      setEvalRefreshNonce((n) => n + 1);
      setArtifactRefreshNonce((n) => n + 1);
      onTurnFinished?.();
    }
  }

  async function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    await sendText(text);
  }

  async function decideApproval(
    assistantId: string,
    runId: string,
    toolCallId: string,
    approved: boolean,
  ) {
    if (!agent || streaming) return;
    currentRunIdRef.current = runId;
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
    setStreaming(true);
    const ctl = new AbortController();
    abortRef.current = ctl;
    let deltaText = '';
    try {
      const stream = resumeToolApproval(
        agent.id,
        { runId, toolCallId, approved },
        ctl.signal,
      );
      deltaText = await consumeStream(stream, assistantId, currentThreadId);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        const e = describeError(err);
        logError({
          source: 'approval',
          message: `approval resume failed: ${e.message}`,
          detail: e.detail,
          agentId: agent.id,
          threadId: currentThreadId ?? undefined,
          runId,
        });
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  text:
                    msg.text +
                    `\n\n*approval resume error: ${err.message ?? err}*`,
                  finished: true,
                }
              : msg,
          ),
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      if (deltaText.trim()) {
        setPendingSpeak({ id: `${assistantId}-${Date.now()}`, text: deltaText });
      }
      refreshThreads();
      setTodoRefreshNonce((n) => n + 1);
      setMemoryRefreshNonce((n) => n + 1);
      setEvalRefreshNonce((n) => n + 1);
      setArtifactRefreshNonce((n) => n + 1);
      onTurnFinished?.();
    }
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }

  function openFileInRail(path: string) {
    setRailPanel('files');
    setWorkspaceFileToOpen(path);
  }

  // Session totals across every finished assistant message in this thread.
  // Must run before any early return — React hook order is structural.
  const sessionUsage = useMemo(() => {
    let total: TokenBreakdown = { ...EMPTY_BREAKDOWN };
    let cost = 0;
    let costKnown = false;
    let turns = 0;
    for (const m of messages) {
      if (m.role !== 'assistant' || !m.usage) continue;
      turns += 1;
      const b = breakdownFromUsage(m.usage);
      total = addBreakdown(total, b);
      const c = computeCost(b, agent?.modelId);
      if (c != null) {
        cost += c;
        costKnown = true;
      }
    }
    return { total, cost: costKnown ? cost : null, turns };
  }, [messages, agent?.modelId]);

  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Pick an agent on the left to start chatting.
      </div>
    );
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const thinkingId =
    streaming && lastAssistant && !lastAssistant.text && lastAssistant.toolCalls.length === 0
      ? lastAssistant.id
      : null;

  return (
    <div className="flex-1 flex min-w-0 relative">
      {threadPanelOpen && (
        <ThreadRail
          threads={threads}
          loading={threadsLoading}
          currentThreadId={currentThreadId}
          onSelect={(id) => {
            if (streaming) return;
            setCurrentThreadId(id);
          }}
          onNew={newThread}
          onDelete={deleteThread}
          onDeleteAll={deleteAllThreads}
          onRename={renameThread}
          onCollapse={() => setThreadPanelOpen(false)}
          streaming={streaming}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-slate-800 p-4 bg-slate-900/40 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {!threadPanelOpen && (
                <button
                  onClick={() => setThreadPanelOpen(true)}
                  className="text-slate-400 hover:text-slate-200 text-xs border border-slate-800 rounded px-2 py-0.5"
                  title="Show thread history"
                >
                  ☰ Threads
                </button>
              )}
              <h2 className="text-base font-semibold truncate">
                {agent.name ?? agent.id}
              </h2>
              <PrimitiveBadge primitive="agent" onTeach={onTeach} compact />
              {knownSubagents.length > 0 && (
                <PrimitiveBadge
                  primitive="agent-as-tool"
                  onTeach={onTeach}
                  compact
                />
              )}
              {Object.keys(agent.tools ?? {}).length > 0 && (
                <PrimitiveBadge primitive="tool" onTeach={onTeach} compact />
              )}
              {knownWorkflows.length > 0 && (
                <PrimitiveBadge primitive="workflow" onTeach={onTeach} compact />
              )}
              {hasVoice && (
                <PrimitiveBadge primitive="voice" onTeach={onTeach} compact />
              )}
              <PrimitiveBadge primitive="workspace" onTeach={onTeach} compact />
              <PrimitiveBadge primitive="memory" onTeach={onTeach} compact />

              <button
                onClick={() => setCatalogOpen(true)}
                className="ml-auto text-[11px] px-2 py-0.5 rounded border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100"
                title="Browse every tool this agent can call"
              >
                🧰 Tool catalog
              </button>
            </div>
            {agent.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {agent.description}
              </p>
            )}
            <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
              POST /api/agents/{agent.id}/stream · thread{' '}
              {currentThreadId ?? '(new)'}
              {agent.modelId && (
                <>
                  {' · '}
                  <span className="text-slate-400">{agent.modelId}</span>
                </>
              )}
            </div>
            {sessionUsage.turns > 0 && (
              <SessionUsageHud
                usage={sessionUsage.total}
                cost={sessionUsage.cost}
                turns={sessionUsage.turns}
              />
            )}
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && !streaming && (
            <EmptyState agentId={agent.id} onTeach={onTeach} />
          )}
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              agentId={agent.id}
              modelId={agent.modelId}
              onTeach={onTeach}
              thinking={thinkingId === m.id}
              streaming={streaming}
              hasVoice={hasVoice}
              knownSubagents={knownSubagents}
              knownWorkflows={knownWorkflows}
              onOpenFile={openFileInRail}
              onRefreshTodos={() => setTodoRefreshNonce((n) => n + 1)}
              evalNonce={evalRefreshNonce}
              onViewTrace={onViewTrace}
              onApprove={(tcId) =>
                m.runId && decideApproval(m.id, m.runId, tcId, true)
              }
              onDecline={(tcId) =>
                m.runId && decideApproval(m.id, m.runId, tcId, false)
              }
            />
          ))}
        </div>

        <div className="border-t border-slate-800 p-3 bg-slate-900/40 space-y-2">
          {hasVoice && (
            <VoiceControls
              agentId={agent.id}
              streaming={streaming}
              onTranscript={(text) => {
                void sendText(text);
              }}
              pendingSpeak={pendingSpeak}
            />
          )}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder={`${
                buildMode ? '🎨 Build mode — describe an artifact… ' : `Message ${agent.name ?? agent.id}... `
              }(Enter to send · Shift+Enter for newline)`}
              className={`flex-1 bg-slate-950 border rounded px-3 py-2 text-sm resize-none focus:outline-none ${
                buildMode
                  ? 'border-purple-500/60 focus:border-purple-400'
                  : 'border-slate-800 focus:border-indigo-500/60'
              }`}
            />
            {streaming ? (
              <button
                onClick={stop}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded text-sm font-medium"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={send}
                disabled={!input.trim()}
                className={`px-4 py-2 disabled:opacity-40 rounded text-sm font-medium ${
                  buildMode
                    ? 'bg-purple-600 hover:bg-purple-500'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {buildMode ? 'Build' : 'Send'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <button
              onClick={() => {
                setBuildMode((v) => {
                  const next = !v;
                  // When turning Build mode on, surface the rail so the user
                  // can see what they're about to construct.
                  if (next) setRailPanel('build');
                  return next;
                });
              }}
              className={`px-2 py-1 rounded border ${
                buildMode
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-200'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
              title="Prepend the artifact preamble — agent writes files into workspace/artifacts/<thread>/"
            >
              {buildMode ? '🎨 Build mode: on' : '🎨 Build mode'}
            </button>
            {buildMode && currentThreadId && (
              <span className="text-[10px] font-mono text-slate-500 truncate">
                workspace/artifacts/
                {sessionIdFromThread(currentThreadId).slice(0, 8)}/
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right rail — panel selector + active panel */}
      <RightRail
        railPanel={railPanel}
        onChange={setRailPanel}
      />
      {railPanel && (
        <aside
          className={`${
            railPanel === 'build' ? 'w-[480px]' : 'w-[340px]'
          } border-l border-slate-800 bg-slate-950 flex flex-col min-h-0`}
        >
          {railPanel === 'files' && (
            <WorkspaceExplorer
              agentId={agent.id}
              onTeach={onTeach}
              openPath={workspaceFileToOpen}
              onClearOpenPath={() => setWorkspaceFileToOpen(null)}
            />
          )}
          {railPanel === 'todos' && (
            <TodosRail
              agentId={agent.id}
              onTeach={onTeach}
              refreshNonce={todoRefreshNonce}
            />
          )}
          {railPanel === 'memory' && (
            <WorkingMemoryView
              agentId={agent.id}
              resourceId={RESOURCE_ID}
              threadId={currentThreadId}
              onTeach={onTeach}
              refreshNonce={memoryRefreshNonce}
            />
          )}
          {railPanel === 'build' && currentThreadId && (
            <ArtifactRail
              agentId={agent.id}
              sessionId={sessionIdFromThread(currentThreadId)}
              messages={messages}
              refreshNonce={artifactRefreshNonce}
            />
          )}
          {railPanel === 'build' && !currentThreadId && (
            <div className="p-3 text-[11px] text-slate-500">
              Start or pick a thread to build artifacts in.
            </div>
          )}
        </aside>
      )}

      {catalogOpen && (
        <ToolCatalogDrawer
          agentId={agent.id}
          onTeach={onTeach}
          onClose={() => setCatalogOpen(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right-rail panel selector
//
// Three vertical icon tabs: Files / Todos / Memory. Clicking the active one
// closes the rail. Keeps the rail compact when the user just wants chat.
// ---------------------------------------------------------------------------

function RightRail({
  railPanel,
  onChange,
}: {
  railPanel: RailPanel;
  onChange: (p: RailPanel) => void;
}) {
  const tabs: Array<{ id: Exclude<RailPanel, null>; label: string; icon: string; title: string }> = [
    { id: 'build', label: 'Build', icon: '🎨', title: 'Artifact preview / files / terminal for this thread' },
    { id: 'files', label: 'Files', icon: '📁', title: "Browse the agent's workspace" },
    { id: 'todos', label: 'Todos', icon: '☑', title: 'workspace/todo.json' },
    { id: 'memory', label: 'Memory', icon: '🧠', title: 'What the agent remembers about you' },
  ];
  return (
    <div className="w-10 border-l border-slate-800 bg-slate-950/80 flex flex-col items-stretch shrink-0">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(railPanel === t.id ? null : t.id)}
          title={t.title}
          className={`h-10 flex flex-col items-center justify-center text-[9px] border-l-2 ${
            railPanel === t.id
              ? 'bg-slate-900 border-l-indigo-500 text-indigo-200'
              : 'border-l-transparent text-slate-500 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <span className="text-sm leading-none">{t.icon}</span>
          <span className="mt-0.5">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thread rail (unchanged)
// ---------------------------------------------------------------------------

function ThreadRail({
  threads,
  loading,
  currentThreadId,
  onSelect,
  onNew,
  onDelete,
  onDeleteAll,
  onRename,
  onCollapse,
  streaming,
}: {
  threads: MemoryThreadSummary[];
  loading: boolean;
  currentThreadId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onRename: (id: string, current: string | undefined) => void;
  onCollapse: () => void;
  streaming: boolean;
}) {
  return (
    <aside className="w-60 border-r border-slate-800 bg-slate-950/60 flex flex-col min-h-0">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-slate-800">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 flex-1">
          Threads {loading ? '…' : `(${threads.length})`}
        </div>
        <button
          onClick={onCollapse}
          className="text-slate-500 hover:text-slate-200 text-xs"
          title="Hide thread panel"
        >
          ⟨
        </button>
      </div>
      <div className="mx-3 mt-3 mb-1 flex gap-1">
        <button
          onClick={onNew}
          disabled={streaming}
          className="flex-1 px-2 py-1.5 text-xs rounded border border-indigo-500/40 text-indigo-200 hover:bg-indigo-500/10 disabled:opacity-40"
        >
          + New thread
        </button>
        <button
          onClick={onDeleteAll}
          disabled={streaming || threads.length === 0}
          title="Delete every thread for this agent"
          className="px-2 py-1.5 text-xs rounded border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Clear all
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto py-1">
        {threads.length === 0 && !loading && (
          <li className="px-3 py-4 text-[11px] text-slate-500">
            No prior threads. Send a message to start one.
          </li>
        )}
        {threads.map((t) => {
          const active = t.id === currentThreadId;
          const updated = t.updatedAt ?? t.createdAt;
          return (
            <li key={t.id} className="group relative">
              <button
                onClick={() => onSelect(t.id)}
                disabled={streaming && !active}
                className={`w-full text-left pl-3 pr-8 py-2 text-xs border-l-2 ${
                  active
                    ? 'bg-indigo-500/10 border-l-indigo-500'
                    : 'border-l-transparent hover:bg-slate-800/40'
                } disabled:opacity-40`}
              >
                <div className="font-medium text-slate-200 truncate">
                  {t.title || '(untitled)'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {t.id.slice(0, 18)}
                </div>
                {updated && (
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {formatRelative(updated)}
                  </div>
                )}
              </button>
              <div className="absolute top-1.5 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(t.id, t.title);
                  }}
                  disabled={streaming}
                  title="Rename this thread"
                  className="text-slate-500 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs px-1 py-0.5 rounded hover:bg-indigo-500/10"
                >
                  ✎
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(t.id);
                  }}
                  disabled={streaming}
                  title="Delete this thread"
                  className="text-slate-500 hover:text-rose-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs px-1 py-0.5 rounded hover:bg-rose-500/10"
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function formatRelative(iso: string): string {
  const t = Date.parse(iso);
  if (!t) return '';
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(t).toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Empty state (unchanged)
// ---------------------------------------------------------------------------

function EmptyState({
  agentId,
  onTeach,
}: {
  agentId: string;
  onTeach: (id: PrimitiveId) => void;
}) {
  const suggestions: Record<string, string[]> = {
    'mastraclaw-agent': [
      'Draft a 200-word intro for an AI-for-SMB landing page.',
      'Research the top 3 alternatives to Zapier for 2026.',
      'Add "follow up with Acme" to my todos, then list pending todos.',
      'Save the research into workspace/research/zapier/ and open it for me.',
    ],
    'news-agent': [
      'What are the top AI startup funding rounds this week?',
    ],
    'voice-agent': [
      'Say hello and tell me a short joke about frameworks.',
    ],
    'email-agent': [
      'List my AgentMail inboxes.',
    ],
  };
  const prompts = suggestions[agentId] ?? ['Hello!'];
  return (
    <div className="max-w-xl mx-auto mt-8 space-y-4">
      <div className="text-center text-slate-400 text-sm">
        Try one of these to see{' '}
        <button
          className="underline decoration-dotted hover:text-slate-200"
          onClick={() => onTeach('agent')}
        >
          how a Mastra agent
        </button>{' '}
        handles it:
      </div>
      <div className="space-y-2">
        {prompts.map((p) => (
          <div
            key={p}
            className="border border-slate-800 rounded p-3 text-sm text-slate-300 bg-slate-900/40"
          >
            {p}
          </div>
        ))}
      </div>
      <div className="text-[11px] text-slate-500 text-center pt-2">
        Pro tip: open the right-rail 📁 Files panel to watch the workspace as
        the agent writes to it.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thinking indicator (unchanged)
// ---------------------------------------------------------------------------

const THINKING_VERBS = [
  'Thinking',
  'Orchestrating',
  'Planning',
  'Reasoning',
  'Synthesizing',
  'Deliberating',
];

function ThinkingIndicator() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % THINKING_VERBS.length),
      1800,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="thinking-shimmer text-sm font-medium">
        {THINKING_VERBS[idx]}
      </span>
      <span aria-hidden>
        <span className="thinking-dot" />
        <span className="thinking-dot" />
        <span className="thinking-dot" />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------

function MessageBubble({
  message,
  agentId,
  modelId,
  onTeach,
  thinking,
  streaming,
  hasVoice,
  knownSubagents,
  knownWorkflows,
  onApprove,
  onDecline,
  onOpenFile,
  onRefreshTodos,
  evalNonce,
  onViewTrace,
}: {
  message: Message;
  agentId: string;
  modelId?: string;
  onTeach: (id: PrimitiveId) => void;
  thinking: boolean;
  streaming: boolean;
  hasVoice: boolean;
  knownSubagents: string[];
  knownWorkflows: string[];
  onApprove: (toolCallId: string) => void;
  onDecline: (toolCallId: string) => void;
  onOpenFile: (path: string) => void;
  onRefreshTodos: () => void;
  evalNonce: number;
  onViewTrace?: (runId: string) => void;
}) {
  const isUser = message.role === 'user';
  const [playing, setPlaying] = useState(false);

  async function play() {
    if (playing || !message.text.trim()) return;
    setPlaying(true);
    try {
      const blob = await speakText(agentId, message.text);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setPlaying(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      console.error(err);
      setPlaying(false);
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
          isUser
            ? 'bg-indigo-600/30 border border-indigo-500/30'
            : 'bg-slate-900 border border-slate-800'
        }`}
      >
        {!isUser && message.reasoning && (
          <details className="mb-2 text-xs text-slate-400">
            <summary className="cursor-pointer select-none">
              reasoning ({message.reasoning.length} chars)
            </summary>
            <pre className="mt-1 whitespace-pre-wrap font-mono text-[11px] bg-slate-950 p-2 rounded">
              {message.reasoning}
            </pre>
          </details>
        )}

        {thinking && !message.text ? (
          <ThinkingIndicator />
        ) : (
          <div className="prose-chat">
            <ReactMarkdown>{message.text || (isUser ? '' : '')}</ReactMarkdown>
          </div>
        )}

        {message.toolCalls.map((tc) => (
          <ToolCallRouter
            key={tc.toolCallId}
            tc={tc}
            agentId={agentId}
            onTeach={onTeach}
            onApprove={() => onApprove(tc.toolCallId)}
            onDecline={() => onDecline(tc.toolCallId)}
            canRespond={!streaming}
            knownSubagents={knownSubagents}
            knownWorkflows={knownWorkflows}
            onOpenFile={onOpenFile}
            onRefreshTodos={onRefreshTodos}
          />
        ))}

        {message.tripwire && (
          <div className="mt-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/30 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <PrimitiveBadge primitive="processor" onTeach={onTeach} compact />
              <span className="text-yellow-300 font-medium">
                tripwire — output blocked
              </span>
            </div>
            <div className="text-slate-300">{message.tripwire.reason}</div>
            {message.tripwire.rewritten && (
              <div className="mt-1">
                <div className="text-[10px] uppercase text-slate-500">
                  rewritten to
                </div>
                <pre className="bg-slate-950 p-1.5 rounded text-[11px] whitespace-pre-wrap break-all mt-0.5">
                  {message.tripwire.rewritten}
                </pre>
              </div>
            )}
            {message.tripwire.processorId && (
              <div className="text-slate-500 font-mono text-[10px] mt-1">
                processor: {message.tripwire.processorId}
              </div>
            )}
          </div>
        )}

        {!isUser && message.finished && (
          <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px] text-slate-500">
            {message.usage && <UsageChip usage={message.usage} modelId={modelId} />}
            <EvalBadges
              runId={message.runId}
              onTeach={onTeach}
              nonce={evalNonce}
            />
            {message.runId && onViewTrace && (
              <button
                onClick={() => onViewTrace(message.runId!)}
                className="text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
                title="Open this turn in the Observability tab"
              >
                view trace ↗
              </button>
            )}
            {hasVoice && message.text.trim() && (
              <button
                onClick={play}
                disabled={playing}
                className="ml-auto text-teal-300 hover:text-teal-200 disabled:opacity-40"
                title="Speak this message via the voice-agent route"
              >
                {playing ? '🔊 …' : '🔊 play'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Token usage + cost chips
//
// Per-message chip shows this turn's tokens and estimated $; session HUD
// shows the running total across every finished turn in the thread.
// ---------------------------------------------------------------------------

function UsageChip({
  usage,
  modelId,
}: {
  usage: TokenUsage;
  modelId?: string;
}) {
  const b = breakdownFromUsage(usage);
  if (b.totalTokens === 0) return null;
  const cost = computeCost(b, modelId);
  const extras: string[] = [];
  if (b.cachedTokens > 0) extras.push(`${formatTokens(b.cachedTokens)} cached`);
  if (b.reasoningTokens > 0) extras.push(`${formatTokens(b.reasoningTokens)} reasoning`);
  return (
    <span
      title={`input ${b.inputTokens.toLocaleString()} · output ${b.outputTokens.toLocaleString()}${
        extras.length ? ` · ${extras.join(' · ')}` : ''
      }${cost != null ? ` · ${formatCost(cost)}` : ''}`}
      className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-slate-300"
    >
      <span className="text-slate-500">tok</span>
      <span>
        <span className="text-slate-200">{formatTokens(b.inputTokens)}</span>
        <span className="text-slate-600 mx-0.5">→</span>
        <span className="text-slate-200">{formatTokens(b.outputTokens)}</span>
      </span>
      {cost != null && (
        <>
          <span className="text-slate-700">·</span>
          <span className="text-emerald-300">{formatCost(cost)}</span>
        </>
      )}
    </span>
  );
}

function SessionUsageHud({
  usage,
  cost,
  turns,
}: {
  usage: TokenBreakdown;
  cost: number | null;
  turns: number;
}) {
  return (
    <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px]">
      <span className="text-slate-500 uppercase tracking-wider">Session</span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 font-medium">
        {turns} turn{turns === 1 ? '' : 's'}
      </span>
      <span
        title={`input ${usage.inputTokens.toLocaleString()} · output ${usage.outputTokens.toLocaleString()}${
          usage.cachedTokens ? ` · ${usage.cachedTokens.toLocaleString()} cached` : ''
        }${usage.reasoningTokens ? ` · ${usage.reasoningTokens.toLocaleString()} reasoning` : ''}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200"
      >
        <span className="text-slate-500">tokens</span>
        <span>{formatTokens(usage.totalTokens)}</span>
        <span className="text-slate-600 ml-0.5">
          ({formatTokens(usage.inputTokens)}→{formatTokens(usage.outputTokens)})
        </span>
        {usage.cachedTokens > 0 && (
          <span className="text-slate-500">· {formatTokens(usage.cachedTokens)} cached</span>
        )}
      </span>
      <span
        title={cost == null ? 'No pricing data for this model' : undefined}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-200"
      >
        <span className="text-emerald-400/70">cost</span>
        <span className="font-medium">{formatCost(cost)}</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rehydrate stored memory messages into chat bubbles
// ---------------------------------------------------------------------------

function rehydrateMessages(raw: MemoryMessage[]): Message[] {
  const out: Message[] = [];
  for (const m of raw) {
    const role: 'user' | 'assistant' =
      m.role === 'user' ? 'user' : 'assistant';
    const { text, toolCalls } = extractContent(m.content);
    if (!text && toolCalls.length === 0) continue;
    out.push({
      id: m.id ?? crypto.randomUUID(),
      role,
      text,
      toolCalls,
      finished: true,
    });
  }
  return out;
}

function extractContent(content: unknown): {
  text: string;
  toolCalls: ToolCallState[];
} {
  if (typeof content === 'string') {
    return { text: content, toolCalls: [] };
  }
  if (!content || typeof content !== 'object') {
    return { text: '', toolCalls: [] };
  }
  const anyContent = content as any;
  const parts: any[] = Array.isArray(anyContent)
    ? anyContent
    : Array.isArray(anyContent.parts)
      ? anyContent.parts
      : [];
  let text = '';
  const toolCalls: ToolCallState[] = [];
  for (const p of parts) {
    if (!p || typeof p !== 'object') continue;
    if (p.type === 'text' && typeof p.text === 'string') {
      text += p.text;
    } else if (p.type === 'reasoning' && typeof p.text === 'string') {
      // drop
    } else if (
      p.type === 'tool-call' ||
      p.type === 'tool-invocation' ||
      p.type === 'tool-result'
    ) {
      const tcId = p.toolCallId ?? p.toolInvocation?.toolCallId ?? crypto.randomUUID();
      const existing = toolCalls.find((t) => t.toolCallId === tcId);
      if (existing) {
        if (p.result !== undefined) existing.result = p.result;
        if (p.type === 'tool-result') existing.status = 'done';
      } else {
        toolCalls.push({
          toolCallId: tcId,
          toolName:
            p.toolName ??
            p.toolInvocation?.toolName ??
            'tool',
          args: p.args ?? p.toolInvocation?.args,
          result: p.result ?? p.toolInvocation?.result,
          status: p.type === 'tool-result' ? 'done' : 'done',
        });
      }
    }
  }
  if (!text && typeof anyContent.text === 'string') {
    text = anyContent.text;
  }
  return { text, toolCalls };
}
