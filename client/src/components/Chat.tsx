import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AgentSummary,
  streamAgent,
  resumeToolApproval,
  speakText,
  listMemoryThreads,
  getMemoryThreadMessages,
  MemoryThreadSummary,
  MemoryMessage,
  Chunk,
} from '../lib/mastraClient';
import { PrimitiveId, educationForChunk } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';
import { VoiceControls } from './VoiceControls';

type ToolCall = {
  toolCallId: string;
  toolName: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
  status: 'calling' | 'awaiting-approval' | 'declined' | 'done' | 'error';
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  reasoning?: string;
  toolCalls: ToolCall[];
  tripwire?: { reason: string; processorId?: string };
  finished?: boolean;
  usage?: { promptTokens?: number; completionTokens?: number };
  runId?: string;
};

interface Props {
  agent: AgentSummary | null;
  onTeach: (id: PrimitiveId) => void;
}

const RESOURCE_ID = 'mastra-bowl-demo-user';

export function Chat({ agent, onTeach }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [threads, setThreads] = useState<MemoryThreadSummary[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadPanelOpen, setThreadPanelOpen] = useState(true);
  const [pendingSpeak, setPendingSpeak] = useState<{ id: string; text: string } | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentAssistantIdRef = useRef<string | null>(null);

  // Load thread list and auto-open the most recently used one when agent changes.
  const refreshThreads = useCallback(async () => {
    if (!agent) return [] as MemoryThreadSummary[];
    setThreadsLoading(true);
    try {
      const list = await listMemoryThreads({
        resourceId: RESOURCE_ID,
        agentId: agent.id,
      });
      // Sort by updatedAt desc, fall back to createdAt, then stable.
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

  // On agent change: clear current thread, load threads, auto-open newest.
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

  // When the selected thread changes, rehydrate its messages.
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

  // Ensure we have a thread id to send with. Server will create server-side
  // memory rows lazily on first write, so a client-generated UUID is safe.
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

  async function consumeStream(
    stream: AsyncGenerator<Chunk, void, void>,
    assistantId: string,
  ): Promise<string> {
    let accumulated = '';
    for await (const chunk of stream) {
      // Capture runId from the first chunk that carries one — we need it to
      // approve/decline pending tool calls.
      if (chunk.runId) {
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
      applyChunkToMessage(chunk, assistantId, setMessages, onTeach);
    }
    return accumulated;
  }

  async function sendText(userText: string) {
    const trimmed = userText.trim();
    if (!trimmed || !agent || streaming) return;
    const threadId = ensureThreadId();
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
    setMessages((m) => [...m, userMsg, assistantMsg]);
    setStreaming(true);

    const ctl = new AbortController();
    abortRef.current = ctl;

    let finalText = '';
    try {
      const stream = streamAgent(
        agent.id,
        {
          messages: trimmed,
          memory: { thread: threadId, resource: RESOURCE_ID },
          runId,
        },
        ctl.signal,
      );
      finalText = await consumeStream(stream, assistantId);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // User hit stop; leave the partial reply intact. Don't auto-speak.
        finalText = '';
      } else {
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
      // Refresh thread list so a newly created thread shows up in the rail.
      refreshThreads();
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
    // Update the local tool call status so the buttons disappear immediately.
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
      deltaText = await consumeStream(stream, assistantId);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
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
    }
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }

  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Pick an agent on the left to start chatting.
      </div>
    );
  }

  const hasVoice = agent.id.includes('voice');
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  // Whether to show the thinking indicator inside the active assistant bubble.
  const thinkingId =
    streaming && lastAssistant && !lastAssistant.text && lastAssistant.toolCalls.length === 0
      ? lastAssistant.id
      : null;

  return (
    <div className="flex-1 flex min-w-0">
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
              {Object.keys(agent.agents ?? {}).length > 0 && (
                <PrimitiveBadge
                  primitive="agent-as-tool"
                  onTeach={onTeach}
                  compact
                />
              )}
              {Object.keys(agent.tools ?? {}).length > 0 && (
                <PrimitiveBadge primitive="tool" onTeach={onTeach} compact />
              )}
              {hasVoice && (
                <PrimitiveBadge primitive="voice" onTeach={onTeach} compact />
              )}
            </div>
            {agent.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {agent.description}
              </p>
            )}
            <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
              POST /api/agents/{agent.id}/stream · thread{' '}
              {currentThreadId ?? '(new)'}
            </div>
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
              onTeach={onTeach}
              thinking={thinkingId === m.id}
              streaming={streaming}
              onApprove={(tcId) =>
                m.runId &&
                decideApproval(m.id, m.runId, tcId, true)
              }
              onDecline={(tcId) =>
                m.runId &&
                decideApproval(m.id, m.runId, tcId, false)
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
                  // Enter (with no Shift) sends. Shift+Enter inserts a newline.
                  // Cmd/Ctrl+Enter also sends.
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder={`Message ${agent.name ?? agent.id}...  (Enter to send · Shift+Enter for newline)`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-indigo-500/60"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded text-sm font-medium"
              >
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thread rail
// ---------------------------------------------------------------------------

function ThreadRail({
  threads,
  loading,
  currentThreadId,
  onSelect,
  onNew,
  onCollapse,
  streaming,
}: {
  threads: MemoryThreadSummary[];
  loading: boolean;
  currentThreadId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
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
      <button
        onClick={onNew}
        disabled={streaming}
        className="mx-3 mt-3 mb-1 px-2 py-1.5 text-xs rounded border border-indigo-500/40 text-indigo-200 hover:bg-indigo-500/10 disabled:opacity-40"
      >
        + New thread
      </button>
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
            <li key={t.id}>
              <button
                onClick={() => onSelect(t.id)}
                disabled={streaming && !active}
                className={`w-full text-left px-3 py-2 text-xs border-l-2 ${
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
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({
  agentId,
  onTeach,
}: {
  agentId: string;
  onTeach: (id: PrimitiveId) => void;
}) {
  const suggestions: Record<string, string[]> = {
    'openclaw-agent': [
      'Draft a 200-word intro for an AI-for-SMB landing page.',
      'Research the top 3 alternatives to Zapier for 2026.',
      'Add "follow up with Acme" to my todos, then list pending todos.',
    ],
    'math-agent': [
      'What is 17 * 23 + 4^3?',
      "Compute the compound interest on $5,000 at 4.5% for 7 years.",
    ],
    'news-agent': [
      'What are the top AI startup funding rounds this week?',
    ],
    'publisher-agent': [
      'Write a short blog post about the rise of local-first software.',
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thinking indicator
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
  onTeach,
  thinking,
  streaming,
  onApprove,
  onDecline,
}: {
  message: Message;
  agentId: string;
  onTeach: (id: PrimitiveId) => void;
  thinking: boolean;
  streaming: boolean;
  onApprove: (toolCallId: string) => void;
  onDecline: (toolCallId: string) => void;
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
          <ToolCallView
            key={tc.toolCallId}
            tc={tc}
            onTeach={onTeach}
            onApprove={() => onApprove(tc.toolCallId)}
            onDecline={() => onDecline(tc.toolCallId)}
            canRespond={!streaming}
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
            {message.tripwire.processorId && (
              <div className="text-slate-500 font-mono text-[10px] mt-1">
                processor: {message.tripwire.processorId}
              </div>
            )}
          </div>
        )}

        {!isUser && message.finished && (
          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
            {message.usage && (
              <span>
                tokens in {message.usage.promptTokens ?? '?'} / out{' '}
                {message.usage.completionTokens ?? '?'}
              </span>
            )}
            {message.text.trim() && (
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
// Tool call view (with approval support)
// ---------------------------------------------------------------------------

function ToolCallView({
  tc,
  onTeach,
  onApprove,
  onDecline,
  canRespond,
}: {
  tc: ToolCall;
  onTeach: (id: PrimitiveId) => void;
  onApprove: () => void;
  onDecline: () => void;
  canRespond: boolean;
}) {
  const [open, setOpen] = useState(tc.status === 'awaiting-approval');

  const statusColor =
    tc.status === 'error'
      ? 'bg-rose-500/15 border-rose-500/30'
      : tc.status === 'awaiting-approval'
        ? 'bg-sky-500/10 border-sky-500/40'
        : tc.status === 'declined'
          ? 'bg-slate-700/30 border-slate-600/50'
          : tc.status === 'calling'
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30';

  const isAgentAsTool =
    /-agent$/i.test(tc.toolName) || tc.toolName.includes('Agent');
  const primitive: PrimitiveId = isAgentAsTool ? 'agent-as-tool' : 'tool';

  const statusText =
    tc.status === 'awaiting-approval'
      ? 'awaiting approval'
      : tc.status === 'declined'
        ? 'declined'
        : tc.status === 'calling'
          ? '…'
          : tc.status === 'error'
            ? 'errored'
            : 'done';

  return (
    <div className={`mt-2 border rounded p-2 text-xs ${statusColor}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <PrimitiveBadge primitive={primitive} onTeach={onTeach} compact />
          <span className="font-mono text-slate-200 truncate">
            {tc.toolName}
          </span>
          <span className="text-slate-400">{statusText}</span>
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

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2) ?? String(v);
  } catch {
    return String(v);
  }
}

// ---------------------------------------------------------------------------
// Stream chunk → message state
// ---------------------------------------------------------------------------

function applyChunkToMessage(
  chunk: Chunk,
  assistantId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  onTeach: (id: PrimitiveId) => void,
) {
  const type = chunk.type;
  const eduId = educationForChunk(type);
  if (eduId && (type === 'tool-call' || type === 'tripwire')) {
    void onTeach;
  }

  setMessages((msgs) =>
    msgs.map((msg) => {
      if (msg.id !== assistantId) return msg;

      switch (type) {
        case 'text-delta': {
          const delta = chunk.payload?.text ?? '';
          return { ...msg, text: msg.text + delta };
        }
        case 'reasoning-delta': {
          const delta = chunk.payload?.text ?? '';
          return { ...msg, reasoning: (msg.reasoning ?? '') + delta };
        }
        case 'tool-call': {
          const existing = msg.toolCalls.find(
            (t) => t.toolCallId === chunk.payload?.toolCallId,
          );
          if (existing) return msg;
          return {
            ...msg,
            toolCalls: [
              ...msg.toolCalls,
              {
                toolCallId: chunk.payload?.toolCallId ?? crypto.randomUUID(),
                toolName: chunk.payload?.toolName ?? 'unknown',
                args: chunk.payload?.args,
                status: 'calling',
              },
            ],
          };
        }
        case 'tool-call-approval':
        case 'data-tool-call-approval': {
          const toolCallId = chunk.payload?.toolCallId ?? chunk.data?.toolCallId;
          const toolName =
            chunk.payload?.toolName ?? chunk.data?.toolName ?? 'unknown';
          const args = chunk.payload?.args ?? chunk.data?.args;
          const existing = msg.toolCalls.find(
            (t) => t.toolCallId === toolCallId,
          );
          if (existing) {
            return {
              ...msg,
              toolCalls: msg.toolCalls.map((t) =>
                t.toolCallId === toolCallId
                  ? { ...t, status: 'awaiting-approval', args: t.args ?? args }
                  : t,
              ),
            };
          }
          return {
            ...msg,
            toolCalls: [
              ...msg.toolCalls,
              {
                toolCallId: toolCallId ?? crypto.randomUUID(),
                toolName,
                args,
                status: 'awaiting-approval',
              },
            ],
          };
        }
        case 'tool-result': {
          return {
            ...msg,
            toolCalls: msg.toolCalls.map((t) =>
              t.toolCallId === chunk.payload?.toolCallId
                ? {
                    ...t,
                    result: chunk.payload?.result,
                    isError: chunk.payload?.isError,
                    status: chunk.payload?.isError ? 'error' : 'done',
                  }
                : t,
            ),
          };
        }
        case 'tool-error': {
          return {
            ...msg,
            toolCalls: msg.toolCalls.map((t) =>
              t.toolCallId === chunk.payload?.toolCallId
                ? { ...t, result: chunk.payload?.error, status: 'error' }
                : t,
            ),
          };
        }
        case 'tripwire': {
          return {
            ...msg,
            tripwire: {
              reason: chunk.payload?.reason ?? 'blocked',
              processorId: chunk.payload?.processorId,
            },
          };
        }
        case 'finish': {
          const usage = chunk.payload?.output?.usage;
          return {
            ...msg,
            finished: true,
            usage: usage
              ? {
                  promptTokens: usage.promptTokens ?? usage.inputTokens,
                  completionTokens:
                    usage.completionTokens ?? usage.outputTokens,
                }
              : undefined,
          };
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
    // Skip empty system-ish messages that sometimes come back.
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
  toolCalls: ToolCall[];
} {
  if (typeof content === 'string') {
    return { text: content, toolCalls: [] };
  }
  if (!content || typeof content !== 'object') {
    return { text: '', toolCalls: [] };
  }
  // AI SDK v5 shape: { parts: [{type, text | toolName, args, ...}] }
  const anyContent = content as any;
  const parts: any[] = Array.isArray(anyContent)
    ? anyContent
    : Array.isArray(anyContent.parts)
      ? anyContent.parts
      : [];
  let text = '';
  const toolCalls: ToolCall[] = [];
  for (const p of parts) {
    if (!p || typeof p !== 'object') continue;
    if (p.type === 'text' && typeof p.text === 'string') {
      text += p.text;
    } else if (p.type === 'reasoning' && typeof p.text === 'string') {
      // Drop reasoning when rehydrating to keep bubbles clean.
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
