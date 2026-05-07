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
      <div className="flex-1 flex items-center justify-center scan-lines">
        <div className="holo-frame px-8 py-6 holo-corners">
          <div className="holo-eyebrow mb-2">// AWAITING SELECTION</div>
          <div className="holo-title text-base">Select an agent</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(108, 230, 248, 0.6)' }}>
            Pick an agent on the left panel to begin transmission.
          </div>
        </div>
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
        <header
          className="p-4 flex items-start justify-between gap-4 relative scan-lines"
          style={{
            borderBottom: '1px solid rgba(108, 230, 248, 0.22)',
            background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.5), rgba(2, 14, 20, 0.25))',
          }}
        >
          <div className="min-w-0 flex-1">
            <div className="holo-eyebrow mb-1">// ACTIVE LINK</div>
            <div className="flex items-center gap-2 flex-wrap">
              {!threadPanelOpen && (
                <button
                  onClick={() => setThreadPanelOpen(true)}
                  className="text-[10px] font-mono tracking-widest px-2 py-0.5 transition-all"
                  style={{
                    border: '1px solid rgba(108, 230, 248, 0.35)',
                    color: 'rgba(108, 230, 248, 0.8)',
                    background: 'rgba(108, 230, 248, 0.04)',
                  }}
                  title="Show thread history"
                >
                  ▤ THREADS
                </button>
              )}
              <h2 className="holo-title text-base truncate">
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
                className="ml-auto text-[10px] font-mono tracking-widest px-2 py-1 transition-all"
                style={{
                  border: '1px solid rgba(108, 230, 248, 0.35)',
                  color: '#88efff',
                  background: 'rgba(108, 230, 248, 0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(108, 230, 248, 0.18)';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(108, 230, 248, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(108, 230, 248, 0.06)';
                  e.currentTarget.style.boxShadow = '';
                }}
                title="Browse every tool this agent can call"
              >
                ▤ TOOL CATALOG
              </button>
            </div>
            {agent.description && (
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'rgba(170, 246, 255, 0.7)' }}>
                {agent.description}
              </p>
            )}
            <div className="text-[10px] holo-readout mt-1 truncate" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
              &gt; POST /api/agents/{agent.id}/stream · THR={' '}
              {currentThreadId ?? '(new)'}
              {agent.modelId && (
                <>
                  {' · MDL='}
                  <span style={{ color: '#88efff' }}>{agent.modelId}</span>
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

        <div
          className="p-3 space-y-2 relative"
          style={{
            borderTop: '1px solid rgba(108, 230, 248, 0.22)',
            background: 'linear-gradient(0deg, rgba(4, 30, 38, 0.55), rgba(2, 14, 20, 0.3))',
          }}
        >
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
          <div className="flex gap-2 relative">
            <div className="flex-1 relative">
              <span
                aria-hidden
                className="absolute left-2 top-2 text-[10px] holo-readout pointer-events-none"
                style={{ color: 'rgba(108, 230, 248, 0.45)' }}
              >
                {buildMode ? '$ build_artifact >' : '$ tx >'}
              </span>
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
                placeholder={
                  buildMode
                    ? 'BUILD MODE :: describe an artifact... (↵ send · ⇧↵ newline)'
                    : `TRANSMIT to ${(agent.name ?? agent.id).toUpperCase()}... (↵ send · ⇧↵ newline)`
                }
                className="w-full bg-transparent text-sm resize-none focus:outline-none px-3 py-2 pl-16"
                style={{
                  background: 'rgba(2, 14, 20, 0.7)',
                  border: buildMode
                    ? '1px solid rgba(217, 108, 224, 0.6)'
                    : '1px solid rgba(108, 230, 248, 0.35)',
                  color: '#cdf2fb',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  boxShadow: buildMode
                    ? 'inset 0 0 12px rgba(217, 108, 224, 0.05), 0 0 8px rgba(217, 108, 224, 0.2)'
                    : 'inset 0 0 12px rgba(108, 230, 248, 0.05), 0 0 8px rgba(108, 230, 248, 0.15)',
                }}
              />
            </div>
            {streaming ? (
              <button
                onClick={stop}
                className="holo-button holo-button-red"
              >
                ◼ ABORT
              </button>
            ) : (
              <button
                onClick={send}
                disabled={!input.trim()}
                className={buildMode ? 'holo-button' : 'holo-button'}
                style={
                  buildMode
                    ? {
                        background: 'rgba(217, 108, 224, 0.10)',
                        borderColor: 'rgba(217, 108, 224, 0.55)',
                        color: '#ec88f5',
                      }
                    : undefined
                }
              >
                {buildMode ? '▸ BUILD' : '▸ TRANSMIT'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <button
              onClick={() => {
                setBuildMode((v) => {
                  const next = !v;
                  if (next) setRailPanel('build');
                  return next;
                });
              }}
              className="text-[10px] font-mono tracking-widest px-2 py-1 transition-all"
              style={
                buildMode
                  ? {
                      background: 'rgba(217, 108, 224, 0.12)',
                      border: '1px solid rgba(217, 108, 224, 0.55)',
                      color: '#ec88f5',
                      textShadow: '0 0 5px rgba(217, 108, 224, 0.5)',
                      boxShadow: '0 0 8px rgba(217, 108, 224, 0.25)',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid rgba(108, 230, 248, 0.25)',
                      color: 'rgba(108, 230, 248, 0.7)',
                    }
              }
              title="Prepend the artifact preamble — agent writes files into workspace/artifacts/<thread>/"
            >
              {buildMode ? '◆ BUILD MODE: ON' : '◇ BUILD MODE'}
            </button>
            {buildMode && currentThreadId && (
              <span className="text-[10px] holo-readout truncate" style={{ color: 'rgba(217, 108, 224, 0.6)' }}>
                &gt; workspace/artifacts/
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
          } flex flex-col min-h-0 scan-lines`}
          style={{
            borderLeft: '1px solid rgba(108, 230, 248, 0.22)',
            background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.5), rgba(2, 14, 20, 0.3))',
          }}
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
            <div className="p-3 text-[11px] holo-readout" style={{ color: 'rgba(108, 230, 248, 0.6)' }}>
              // Start or pick a thread to build artifacts in.
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
    { id: 'build',  label: 'BLD',  icon: '◇', title: 'Artifact preview / files / terminal for this thread' },
    { id: 'files',  label: 'FIL',  icon: '▤', title: "Browse the agent's workspace" },
    { id: 'todos',  label: 'TDO',  icon: '☑', title: 'workspace/todo.json' },
    { id: 'memory', label: 'MEM',  icon: '◉', title: 'What the agent remembers about you' },
  ];
  return (
    <div
      className="w-10 flex flex-col items-stretch shrink-0"
      style={{
        borderLeft: '1px solid rgba(108, 230, 248, 0.22)',
        background: 'rgba(2, 14, 20, 0.7)',
      }}
    >
      {tabs.map((t) => {
        const active = railPanel === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(active ? null : t.id)}
            title={t.title}
            className="h-10 flex flex-col items-center justify-center text-[9px] font-mono tracking-widest transition-all"
            style={{
              borderLeft: active ? '2px solid #aaf6ff' : '2px solid transparent',
              background: active ? 'rgba(108, 230, 248, 0.12)' : 'transparent',
              color: active ? '#aaf6ff' : 'rgba(108, 230, 248, 0.5)',
              textShadow: active ? '0 0 4px rgba(108, 230, 248, 0.6)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.color = '#88efff';
                e.currentTarget.style.background = 'rgba(108, 230, 248, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.color = 'rgba(108, 230, 248, 0.5)';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span className="text-sm leading-none">{t.icon}</span>
            <span className="mt-0.5">{t.label}</span>
          </button>
        );
      })}
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
    <aside
      className="w-60 flex flex-col min-h-0 scan-lines"
      style={{
        borderRight: '1px solid rgba(108, 230, 248, 0.22)',
        background: 'rgba(2, 14, 20, 0.55)',
      }}
    >
      <div
        className="px-3 py-2.5 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}
      >
        <div className="holo-eyebrow flex-1">
          // THREADS [{loading ? '...' : threads.length.toString().padStart(2, '0')}]
        </div>
        <button
          onClick={onCollapse}
          className="text-xs transition-colors"
          style={{ color: 'rgba(108, 230, 248, 0.55)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#aaf6ff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(108, 230, 248, 0.55)')}
          title="Hide thread panel"
        >
          ◀
        </button>
      </div>
      <div className="mx-3 mt-3 mb-1 flex gap-1">
        <button
          onClick={onNew}
          disabled={streaming}
          className="holo-button flex-1 justify-center disabled:opacity-40"
        >
          + NEW
        </button>
        <button
          onClick={onDeleteAll}
          disabled={streaming || threads.length === 0}
          title="Delete every thread for this agent"
          className="holo-button holo-button-red disabled:opacity-30"
        >
          ✕ CLR
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto py-1">
        {threads.length === 0 && !loading && (
          <li className="px-3 py-4 text-[10px] holo-readout" style={{ color: 'rgba(108, 230, 248, 0.45)' }}>
            // No prior threads.
            <br />
            // Transmit to begin.
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
                className="w-full text-left pl-3 pr-8 py-2 text-xs transition-all disabled:opacity-40"
                style={{
                  borderLeft: active ? '2px solid #aaf6ff' : '2px solid transparent',
                  background: active
                    ? 'linear-gradient(90deg, rgba(108, 230, 248, 0.14), transparent 90%)'
                    : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'rgba(108, 230, 248, 0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div
                  className="font-display font-semibold tracking-wider uppercase truncate text-[12px]"
                  style={{
                    color: active ? '#aaf6ff' : '#cdf2fb',
                    textShadow: active ? '0 0 5px rgba(108, 230, 248, 0.5)' : 'none',
                  }}
                >
                  {t.title || '(UNTITLED)'}
                </div>
                <div className="text-[10px] holo-readout truncate" style={{ color: 'rgba(108, 230, 248, 0.5)' }}>
                  {t.id.slice(0, 18)}
                </div>
                {updated && (
                  <div className="text-[10px] holo-readout mt-0.5" style={{ color: 'rgba(108, 230, 248, 0.4)' }}>
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
                  className="text-xs px-1 py-0.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: 'rgba(108, 230, 248, 0.55)' }}
                  onMouseEnter={(e) => !streaming && (e.currentTarget.style.color = '#aaf6ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(108, 230, 248, 0.55)')}
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
                  className="text-xs px-1 py-0.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: 'rgba(108, 230, 248, 0.55)' }}
                  onMouseEnter={(e) => !streaming && (e.currentTarget.style.color = '#ff859a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(108, 230, 248, 0.55)')}
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
      <div className="text-center" style={{ color: 'rgba(170, 246, 255, 0.7)' }}>
        <div className="holo-eyebrow mb-2">// SUGGESTED COMMANDS</div>
        <div className="text-sm">
          Try one of these to see{' '}
          <button
            className="underline decoration-dotted transition-colors"
            style={{ color: '#aaf6ff' }}
            onClick={() => onTeach('agent')}
            onMouseEnter={(e) => (e.currentTarget.style.textShadow = '0 0 5px rgba(108, 230, 248, 0.6)')}
            onMouseLeave={(e) => (e.currentTarget.style.textShadow = '')}
          >
            how a Mastra agent
          </button>{' '}
          handles it:
        </div>
      </div>
      <div className="space-y-2">
        {prompts.map((p, i) => (
          <div
            key={p}
            className="p-3 text-sm relative"
            style={{
              border: '1px solid rgba(108, 230, 248, 0.18)',
              background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.5), rgba(2, 14, 20, 0.3))',
              color: '#cdf2fb',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.03em',
            }}
          >
            <span
              className="holo-eyebrow mr-2"
              style={{ color: 'rgba(108, 230, 248, 0.55)' }}
            >
              [{(i + 1).toString().padStart(2, '0')}]
            </span>
            {p}
          </div>
        ))}
      </div>
      <div className="text-[10px] holo-readout text-center pt-2" style={{ color: 'rgba(108, 230, 248, 0.5)' }}>
        // Open the right-rail FIL panel to watch the workspace live.
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
        className="max-w-[85%] px-4 py-3 text-sm relative"
        style={
          isUser
            ? {
                border: '1px solid rgba(108, 230, 248, 0.45)',
                background: 'linear-gradient(135deg, rgba(108, 230, 248, 0.14), rgba(108, 230, 248, 0.04))',
                boxShadow: '0 0 12px rgba(108, 230, 248, 0.18), inset 0 0 12px rgba(108, 230, 248, 0.04)',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
              }
            : {
                border: '1px solid rgba(108, 230, 248, 0.18)',
                background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.6), rgba(2, 14, 20, 0.4))',
                boxShadow: 'inset 0 0 18px rgba(108, 230, 248, 0.04)',
              }
        }
      >
        {!isUser && (
          <div
            aria-hidden
            className="holo-eyebrow absolute -top-2 left-3 px-1"
            style={{
              background: 'rgba(2, 14, 20, 0.95)',
              color: '#88efff',
              fontSize: '8px',
            }}
          >
            // {agentId.toUpperCase().replace(/-/g, '_')}
          </div>
        )}
        {!isUser && message.reasoning && (
          <details className="mb-2 text-xs" style={{ color: 'rgba(108, 230, 248, 0.65)' }}>
            <summary className="cursor-pointer select-none holo-eyebrow">
              [REASONING / {message.reasoning.length}b]
            </summary>
            <pre
              className="mt-1 whitespace-pre-wrap font-mono text-[11px] p-2"
              style={{
                background: 'rgba(2, 14, 20, 0.7)',
                border: '1px solid rgba(108, 230, 248, 0.15)',
                color: 'rgba(170, 246, 255, 0.85)',
              }}
            >
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
          <div className="mt-2 p-2 holo-panel-amber text-xs">
            <div className="flex items-center gap-2 mb-1">
              <PrimitiveBadge primitive="processor" onTeach={onTeach} compact />
              <span className="font-display tracking-widest uppercase glow-amber" style={{ color: '#ffd082' }}>
                ▲ TRIPWIRE — OUTPUT BLOCKED
              </span>
            </div>
            <div style={{ color: '#ffecb3' }}>{message.tripwire.reason}</div>
            {message.tripwire.rewritten && (
              <div className="mt-1">
                <div className="holo-eyebrow" style={{ color: 'rgba(255, 184, 77, 0.7)' }}>
                  // REWRITTEN TO
                </div>
                <pre
                  className="p-1.5 text-[11px] whitespace-pre-wrap break-all mt-0.5"
                  style={{
                    background: 'rgba(2, 14, 20, 0.7)',
                    border: '1px solid rgba(255, 184, 77, 0.25)',
                    color: '#ffecb3',
                  }}
                >
                  {message.tripwire.rewritten}
                </pre>
              </div>
            )}
            {message.tripwire.processorId && (
              <div className="font-mono text-[10px] mt-1" style={{ color: 'rgba(255, 184, 77, 0.65)' }}>
                &gt; processor: {message.tripwire.processorId}
              </div>
            )}
          </div>
        )}

        {!isUser && message.finished && (
          <div
            className="mt-2 flex items-center gap-2 flex-wrap text-[10px] holo-readout"
            style={{ color: 'rgba(108, 230, 248, 0.6)' }}
          >
            {message.usage && <UsageChip usage={message.usage} modelId={modelId} />}
            <EvalBadges
              runId={message.runId}
              onTeach={onTeach}
              nonce={evalNonce}
            />
            {message.runId && onViewTrace && (
              <button
                onClick={() => onViewTrace(message.runId!)}
                className="underline decoration-dotted transition-colors"
                style={{ color: '#88efff' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#aaf6ff';
                  e.currentTarget.style.textShadow = '0 0 5px rgba(108, 230, 248, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#88efff';
                  e.currentTarget.style.textShadow = '';
                }}
                title="Open this turn in the Observability tab"
              >
                ▸ VIEW TRACE
              </button>
            )}
            {hasVoice && message.text.trim() && (
              <button
                onClick={play}
                disabled={playing}
                className="ml-auto disabled:opacity-40 transition-colors"
                style={{ color: '#36e3a8' }}
                title="Speak this message via the voice-agent route"
              >
                {playing ? '◉ TX...' : '◉ PLAY'}
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
      className="inline-flex items-center gap-1.5 px-1.5 py-0.5 holo-readout text-[10px]"
      style={{
        background: 'rgba(2, 14, 20, 0.7)',
        border: '1px solid rgba(108, 230, 248, 0.22)',
        color: '#a8e0ec',
      }}
    >
      <span style={{ color: 'rgba(108, 230, 248, 0.55)' }}>TOK</span>
      <span>
        <span style={{ color: '#cdf2fb' }}>{formatTokens(b.inputTokens)}</span>
        <span style={{ color: 'rgba(108, 230, 248, 0.45)' }} className="mx-0.5">→</span>
        <span style={{ color: '#cdf2fb' }}>{formatTokens(b.outputTokens)}</span>
      </span>
      {cost != null && (
        <>
          <span style={{ color: 'rgba(108, 230, 248, 0.35)' }}>·</span>
          <span style={{ color: '#36e3a8' }}>{formatCost(cost)}</span>
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
    <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px] holo-readout">
      <span className="holo-eyebrow">// SESSION</span>
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5"
        style={{
          background: 'rgba(108, 230, 248, 0.08)',
          border: '1px solid rgba(108, 230, 248, 0.45)',
          color: '#aaf6ff',
        }}
      >
        T={turns.toString().padStart(2, '0')}
      </span>
      <span
        title={`input ${usage.inputTokens.toLocaleString()} · output ${usage.outputTokens.toLocaleString()}${
          usage.cachedTokens ? ` · ${usage.cachedTokens.toLocaleString()} cached` : ''
        }${usage.reasoningTokens ? ` · ${usage.reasoningTokens.toLocaleString()} reasoning` : ''}`}
        className="inline-flex items-center gap-1 px-2 py-0.5"
        style={{
          background: 'rgba(2, 14, 20, 0.7)',
          border: '1px solid rgba(108, 230, 248, 0.25)',
          color: '#cdf2fb',
        }}
      >
        <span style={{ color: 'rgba(108, 230, 248, 0.55)' }}>TOK</span>
        <span>{formatTokens(usage.totalTokens)}</span>
        <span style={{ color: 'rgba(108, 230, 248, 0.4)' }} className="ml-0.5">
          ({formatTokens(usage.inputTokens)}→{formatTokens(usage.outputTokens)})
        </span>
        {usage.cachedTokens > 0 && (
          <span style={{ color: 'rgba(108, 230, 248, 0.55)' }}>· {formatTokens(usage.cachedTokens)} cache</span>
        )}
      </span>
      <span
        title={cost == null ? 'No pricing data for this model' : undefined}
        className="inline-flex items-center gap-1 px-2 py-0.5"
        style={{
          background: 'rgba(54, 227, 168, 0.08)',
          border: '1px solid rgba(54, 227, 168, 0.4)',
          color: '#66f5c2',
        }}
      >
        <span style={{ color: 'rgba(54, 227, 168, 0.6)' }}>COST</span>
        <span className="font-bold">{formatCost(cost)}</span>
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
