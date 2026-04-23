import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AgentSummary,
  streamAgent,
  speakText,
  Chunk,
} from '../lib/mastraClient';
import { PrimitiveId, educationForChunk } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';

type ToolCall = {
  toolCallId: string;
  toolName: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
  status: 'calling' | 'done' | 'error';
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
};

interface Props {
  agent: AgentSummary | null;
  onTeach: (id: PrimitiveId) => void;
}

export function Chat({ agent, onTeach }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Thread/resource for memory — stable per agent so working memory sticks.
  const resourceId = useMemo(() => 'mastra-bowl-demo-user', []);
  const threadId = useMemo(
    () => (agent ? `demo-thread-${agent.id}` : 'demo-thread'),
    [agent?.id],
  );

  // Reset when agent changes.
  useEffect(() => {
    setMessages([]);
  }, [agent?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  async function send() {
    if (!input.trim() || !agent || streaming) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input.trim(),
      toolCalls: [],
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      text: '',
      toolCalls: [],
    };
    setMessages((m) => [...m, userMsg, assistantMsg]);
    setInput('');
    setStreaming(true);

    const ctl = new AbortController();
    abortRef.current = ctl;

    try {
      const stream = streamAgent(
        agent.id,
        {
          messages: userMsg.text,
          // OpenClaw's ObservationalMemory processor is scoped to 'thread', so a
          // valid thread+resource must be in the memory object here. Top-level
          // threadId/resourceId is a legacy shape the processor doesn't read.
          memory: { thread: threadId, resource: resourceId },
        },
        ctl.signal,
      );

      for await (const chunk of stream) {
        applyChunkToMessage(chunk, assistantId, setMessages, onTeach);
      }
    } catch (err: any) {
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
    } finally {
      setStreaming(false);
      abortRef.current = null;
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

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="border-b border-slate-800 p-4 bg-slate-900/40 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
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
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            POST /api/agents/{agent.id}/stream · thread {threadId}
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <EmptyState agentId={agent.id} onTeach={onTeach} />
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            agentId={agent.id}
            onTeach={onTeach}
          />
        ))}
      </div>

      <div className="border-t border-slate-800 p-3 bg-slate-900/40">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder={`Message ${agent.name ?? agent.id}...  (⌘/Ctrl + Enter to send)`}
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
  );
}

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

function MessageBubble({
  message,
  agentId,
  onTeach,
}: {
  message: Message;
  agentId: string;
  onTeach: (id: PrimitiveId) => void;
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
        <div className="prose-chat">
          <ReactMarkdown>{message.text || (isUser ? '' : '…')}</ReactMarkdown>
        </div>

        {message.toolCalls.map((tc) => (
          <ToolCallView key={tc.toolCallId} tc={tc} onTeach={onTeach} />
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

function ToolCallView({
  tc,
  onTeach,
}: {
  tc: ToolCall;
  onTeach: (id: PrimitiveId) => void;
}) {
  const [open, setOpen] = useState(false);
  const statusColor =
    tc.status === 'error'
      ? 'bg-rose-500/15 border-rose-500/30'
      : tc.status === 'calling'
        ? 'bg-amber-500/10 border-amber-500/30'
        : 'bg-emerald-500/10 border-emerald-500/30';

  // If the tool is actually another agent being called, badge accordingly.
  const isAgentAsTool = /-agent$/i.test(tc.toolName) || tc.toolName.includes('Agent');
  const primitive: PrimitiveId = isAgentAsTool ? 'agent-as-tool' : 'tool';

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
          <span className="text-slate-400">
            {tc.status === 'calling'
              ? '…'
              : tc.status === 'error'
                ? 'errored'
                : 'done'}
          </span>
        </div>
        <span className="text-slate-500">{open ? '▲' : '▼'}</span>
      </button>
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

function applyChunkToMessage(
  chunk: Chunk,
  assistantId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  onTeach: (id: PrimitiveId) => void,
) {
  const type = chunk.type;

  // Soft-open education panel the first time a tool is called.
  const eduId = educationForChunk(type);
  if (eduId && (type === 'tool-call' || type === 'tripwire')) {
    // Only nudge open, don't force — we don't want to steal focus repeatedly.
    // Handled by caller via the callback set up per-message below.
    // No-op here (we'd rather be polite).
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
