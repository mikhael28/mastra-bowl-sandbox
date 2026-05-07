import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import ReactMarkdown from 'react-markdown';
import { useFavorites, type FavoriteItem } from './FavoritesContext';
import type { GitHubPullRequest } from './types';
import { computeStaleness, getCommentCount, getReactionCount } from './utils';
import { streamAgent } from '../../lib/mastraClient';

// ---------------------------------------------------------------------------
// Right-docked maintainer copilot. Workflow cards in the parent fire a
// templated prompt by calling the imperative `runPrompt(text)` method exposed
// via ref — that mirrors the user typing it in and hitting Send, so tool calls
// stream the same way as a normal turn.
// ---------------------------------------------------------------------------

// Mastraclaw is the dashboard's copilot now. It has the triage tools wired up
// (read-bundle, lookup-item, fetch-issues/prs, assign-developers, triageWorkflow)
// alongside everything else it can do — research, RAG, todos. That makes the
// dashboard's copilot the same brain the user has in the main Chat tab.
const COPILOT_AGENT_ID = 'mastraclaw-agent';
// Matches the resource id used by the main Chat tab (Chat.tsx). Working memory
// is resource-scoped on this agent, so sharing the resource lets the dashboard
// and the chat tab see the same persistent profile block.
const RESOURCE_ID = 'mastra-bowl-demo-user';
// One thread per dashboard mount (persisted across refreshes). The agent has
// observationalMemory enabled with thread scope, so a threadId is required —
// without it the input processor pipeline fails before any tool runs.
const THREAD_KEY = 'mastra-triage-copilot-thread';

function ensureThreadId(): string {
  try {
    const cached = localStorage.getItem(THREAD_KEY);
    if (cached) return cached;
    const id = `t-${crypto.randomUUID()}`;
    localStorage.setItem(THREAD_KEY, id);
    return id;
  } catch {
    return `t-${crypto.randomUUID()}`;
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  // Tag the message with the workflow that produced it — gives visual continuity
  // between the workflow card the user clicked and the assistant turn.
  workflowId?: string;
  workflowTitle?: string;
  workflowAccent?: 'blue' | 'orange' | 'purple' | 'green' | 'pink' | 'yellow' | 'cyan';
}

const ACCENT_BADGE: Record<NonNullable<ChatMessage['workflowAccent']>, string> = {
  blue: 'bg-[#aaf6ff22] text-[#aaf6ff] border-[#aaf6ff44]',
  orange: 'bg-[#ffb84d22] text-[#ffb84d] border-[#ffb84d44]',
  purple: 'bg-[#ec88f522] text-[#ec88f5] border-[#ec88f544]',
  green: 'bg-[#36e3a822] text-[#36e3a8] border-[#36e3a844]',
  pink: 'bg-[#ec88f522] text-[#ec88f5] border-[#ec88f544]',
  yellow: 'bg-[#ffc04d22] text-[#ffc04d] border-[#ffc04d44]',
  cyan: 'bg-[#36d4ec22] text-[#36d4ec] border-[#36d4ec44]',
};

function buildItemContext(items: FavoriteItem[]): string {
  return items
    .map((item) => {
      const kind = item._kind === 'pr' ? 'Pull Request' : 'Issue';
      const pr = item._kind === 'pr' ? (item as GitHubPullRequest) : null;
      const staleness = computeStaleness(item);
      const comments = getCommentCount(item);
      const reactions = getReactionCount(item);

      let ctx = `## ${kind} #${item.number}: ${item.title}\n`;
      ctx += `- Author: @${item.author.login}\n`;
      ctx += `- State: ${item.state}\n`;
      ctx += `- Created: ${item.createdAt}\n`;
      ctx += `- Updated: ${item.updatedAt}\n`;
      ctx += `- Staleness: ${staleness}/100\n`;
      ctx += `- Comments: ${comments}\n`;
      ctx += `- Reactions: ${reactions}\n`;
      ctx += `- Labels: ${item.labels.map((l) => l.name).join(', ') || 'none'}\n`;
      ctx += `- Assignees: ${item.assignees.map((a) => `@${a.login}`).join(', ') || 'none'}\n`;
      if (pr) {
        ctx += `- Branch: ${pr.headRefName} → ${pr.baseRefName}\n`;
        ctx += `- Changes: +${pr.additions} -${pr.deletions} (${pr.changedFiles} files)\n`;
        ctx += `- Review: ${pr.reviewDecision || 'Pending'}\n`;
        ctx += `- Mergeable: ${pr.mergeable || 'Unknown'}\n`;
        ctx += `- Draft: ${pr.isDraft ? 'Yes' : 'No'}\n`;
      }
      ctx += `- URL: ${item.url}\n`;
      ctx += `\n### Description\n${item.body || 'No description.'}\n`;

      if (item.comments && item.comments.length > 0) {
        ctx += `\n### Comments\n`;
        for (const c of item.comments.slice(0, 10)) {
          ctx += `- @${c.author?.login || 'unknown'} (${c.createdAt}): ${c.body?.slice(0, 300)}\n`;
        }
      }

      return ctx;
    })
    .join('\n---\n\n');
}

export interface CopilotSidebarHandle {
  runPrompt: (
    text: string,
    meta?: { workflowId?: string; workflowTitle?: string; accent?: ChatMessage['workflowAccent'] },
  ) => void;
  reset: () => void;
}

interface Props {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export const CopilotSidebar = forwardRef<CopilotSidebarHandle, Props>(
  function CopilotSidebar({ collapsed, onToggleCollapsed }, ref) {
    const { favorites } = useFavorites();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    // Track first-turn-ness in a ref so the runPrompt closure (called from the
    // parent's workflow trigger) sees the latest value without re-renders.
    const hasUserTurnRef = useRef(false);
    const threadIdRef = useRef<string>(ensureThreadId());

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function buildFirstTurnPayload(userText: string): string {
      if (favorites.length === 0) return userText;
      const ctx = buildItemContext(favorites);
      return `Here are the items I'm focused on right now:\n\n${ctx}\n\n---\n\nMy question:\n${userText}`;
    }

    const send = async (
      content: string,
      meta?: {
        workflowId?: string;
        workflowTitle?: string;
        accent?: ChatMessage['workflowAccent'];
      },
    ) => {
      const trimmed = content.trim();
      if (!trimmed || streaming) return;

      const userMsg: ChatMessage = {
        role: 'user',
        content: trimmed,
        workflowId: meta?.workflowId,
        workflowTitle: meta?.workflowTitle,
        workflowAccent: meta?.accent,
      };
      setMessages((m) => [...m, userMsg]);
      setInput('');
      setStreaming(true);
      setError(null);

      const isFirstUserTurn = !hasUserTurnRef.current;
      hasUserTurnRef.current = true;
      const agentPrompt = isFirstUserTurn ? buildFirstTurnPayload(trimmed) : trimmed;

      const ctl = new AbortController();
      abortRef.current = ctl;

      setMessages((m) => [...m, { role: 'assistant', content: '' }]);

      try {
        const stream = streamAgent(
          COPILOT_AGENT_ID,
          {
            messages: agentPrompt,
            memory: {
              thread: threadIdRef.current,
              resource: RESOURCE_ID,
            },
          },
          ctl.signal,
        );
        let acc = '';
        for await (const chunk of stream) {
          if (chunk.type === 'text-delta') {
            acc += chunk.payload?.text ?? '';
            setMessages((m) => {
              const last = m[m.length - 1];
              if (!last || last.role !== 'assistant') return m;
              return [...m.slice(0, -1), { ...last, content: acc }];
            });
          }
        }
        if (!acc) {
          setMessages((m) => {
            const last = m[m.length - 1];
            if (!last || last.role !== 'assistant') return m;
            return [...m.slice(0, -1), { ...last, content: '_(no response)_' }];
          });
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError(String(err?.message ?? err));
          setMessages((m) => {
            const last = m[m.length - 1];
            if (!last || last.role !== 'assistant') return m;
            return [
              ...m.slice(0, -1),
              { ...last, content: `_Error: ${String(err?.message ?? err)}_` },
            ];
          });
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        runPrompt: (text, meta) => {
          // If the sidebar is collapsed when a workflow is fired, expand it so
          // the user can see the response.
          if (collapsed) onToggleCollapsed();
          send(text, meta);
        },
        reset: () => {
          abortRef.current?.abort();
          setMessages([]);
          setInput('');
          setError(null);
          hasUserTurnRef.current = false;
          const fresh = `t-${crypto.randomUUID()}`;
          try {
            localStorage.setItem(THREAD_KEY, fresh);
          } catch {
            /* private mode */
          }
          threadIdRef.current = fresh;
        },
      }),
      [collapsed, onToggleCollapsed],
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send(input);
      }
    };

    const handleStop = () => abortRef.current?.abort();

    if (collapsed) {
      return (
        <div className="w-12 flex-shrink-0 border-l border-[#143a48] bg-[#04141a] flex flex-col items-center py-4 gap-3">
          <button
            onClick={onToggleCollapsed}
            className="p-2 rounded-md border border-[#143a48] hover:border-[#ec88f5] text-[#ec88f5] transition-colors"
            title="Expand copilot"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          {messages.length > 0 && (
            <div className="text-[10px] text-[#5395a8] -rotate-90 origin-center mt-12 whitespace-nowrap">
              {messages.filter((m) => m.role === 'assistant').length} replies
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-[440px] flex-shrink-0 border-l border-[#143a48] bg-[#020a0d] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#143a48] bg-[#04141a]">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ec88f5"
                strokeWidth="1.8"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span
                className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                  streaming ? 'bg-[#36e3a8] animate-pulse' : 'bg-[#36e3a8]'
                }`}
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-white leading-tight">
                Triage Copilot
              </div>
              <div className="text-[10px] text-[#5395a8] font-mono leading-tight">
                mastraclaw-agent
                {favorites.length > 0
                  ? ` · ${favorites.length} in scope`
                  : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  hasUserTurnRef.current = false;
                  const fresh = `t-${crypto.randomUUID()}`;
                  try {
                    localStorage.setItem(THREAD_KEY, fresh);
                  } catch {
                    /* private mode */
                  }
                  threadIdRef.current = fresh;
                }}
                className="text-[10px] text-[#5395a8] hover:text-white px-2 py-1 rounded hover:bg-[#0a2b37]"
                title="Start a fresh conversation thread"
              >
                clear
              </button>
            )}
            <button
              onClick={onToggleCollapsed}
              className="text-[#5395a8] hover:text-white p-1 rounded hover:bg-[#0a2b37]"
              title="Collapse"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="px-4 py-2 border-b border-[#0a2b37] bg-[#020a0d]">
            <div className="flex flex-wrap gap-1.5">
              {favorites.slice(0, 12).map((f) => (
                <span
                  key={`${f._kind}-${f.number}`}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full border ${
                    f._kind === 'pr'
                      ? 'border-[#aaf6ff33] text-[#aaf6ff] bg-[#aaf6ff11]'
                      : 'border-[#36e3a833] text-[#36e3a8] bg-[#36e3a811]'
                  }`}
                  title={f.title}
                >
                  {f._kind === 'pr' ? '↗' : '●'} #{f.number}
                </span>
              ))}
              {favorites.length > 12 && (
                <span className="text-[10px] text-[#5395a8]">
                  +{favorites.length - 12} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="text-center pt-4 pb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ec88f515] border border-[#ec88f533] mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec88f5" strokeWidth="1.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div className="text-sm text-[#cdf2fb] font-medium">
                  Your maintainer copilot
                </div>
                <p className="text-xs text-[#5395a8] mt-1 px-4 leading-relaxed">
                  Click any workflow card on the left, ask about a specific
                  issue ("what's #1234?"), or paste a question.
                </p>
              </div>
              <div className="bg-[#04141a] border border-[#0a2b37] rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-wider text-[#5395a8] mb-2">
                  What I can do
                </div>
                <ul className="text-[11px] text-[#cdf2fb] space-y-1 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-[#36e3a8]">●</span>
                    Read & summarize the local triage bundle
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#aaf6ff]">●</span>
                    Look up specific issues / PRs by number
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ec88f5]">●</span>
                    Run the full triage workflow against GitHub
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ffb84d]">●</span>
                    Re-run developer assignment on AI-suggested labels
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#ec88f5]">●</span>
                    Draft pings, close-as-stale notes, and PR review nudges
                  </li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[92%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#aaf6ff15] text-[#cdf2fb] border border-[#aaf6ff33]'
                    : 'bg-[#04141a] text-[#cdf2fb] border border-[#0a2b37]'
                }`}
              >
                {msg.role === 'user' && msg.workflowTitle && (
                  <div
                    className={`inline-flex items-center gap-1 mb-1.5 px-1.5 py-0.5 text-[9px] rounded-full border ${
                      msg.workflowAccent
                        ? ACCENT_BADGE[msg.workflowAccent]
                        : 'bg-[#ec88f522] text-[#ec88f5] border-[#ec88f544]'
                    }`}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    {msg.workflowTitle}
                  </div>
                )}
                {msg.role === 'assistant' ? (
                  <div className="prose-chat max-w-none">
                    <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {streaming && (
            <div className="flex justify-start">
              <div className="bg-[#04141a] border border-[#0a2b37] rounded-lg px-3 py-2">
                <span className="thinking-shimmer text-xs">Thinking</span>
                <span className="thinking-dot" />
                <span className="thinking-dot" />
                <span className="thinking-dot" />
              </div>
            </div>
          )}

          {error && !streaming && (
            <div className="text-[11px] text-[#ff5874] bg-[#ff587411] border border-[#ff587433] rounded-md px-2.5 py-2">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-[#143a48] bg-[#04141a]">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the copilot..."
              disabled={streaming}
              rows={2}
              className="flex-1 bg-[#020a0d] border border-[#143a48] rounded-lg px-3 py-2 text-[13px] text-[#cdf2fb] placeholder-[#235e6f] focus:border-[#ec88f5] focus:outline-none resize-none disabled:opacity-50"
            />
            {streaming ? (
              <button
                onClick={handleStop}
                className="self-end px-3 py-2 bg-[#ff5874] text-white text-xs font-medium rounded-lg hover:bg-[#ff859a] transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="self-end px-3 py-2 bg-[#ec88f5] text-[#020a0d] text-xs font-semibold rounded-lg hover:bg-[#ec88f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            )}
          </div>
          <p className="text-[10px] text-[#235e6f] mt-1.5">
            Enter to send · Shift+Enter newline
          </p>
        </div>
      </div>
    );
  },
);
