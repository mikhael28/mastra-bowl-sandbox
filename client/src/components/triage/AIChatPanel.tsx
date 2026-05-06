import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useFavorites, type FavoriteItem } from './FavoritesContext';
import type { GitHubPullRequest } from './types';
import { computeStaleness, getCommentCount, getReactionCount } from './utils';
import { streamAgent } from '../../lib/mastraClient';

const TRIAGE_AGENT_ID = 'triage-chat-agent';

interface Props {
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

const SUGGESTED_PROMPTS = [
  'Summarize these items and identify the most urgent ones',
  'What themes or patterns do you see across these issues/PRs?',
  'Which items should we prioritize in the next sprint and why?',
  'Draft a team update summarizing the status of these items',
  'Identify any items that might be related or duplicates',
  'What are the potential risks or blockers across these items?',
];

export function AIChatPanel({ onClose }: Props) {
  const { favorites } = useFavorites();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // The favorites payload is large enough that we don't want to paste it on
  // every turn. Send it as a header preamble on the first user message of
  // the session, then let the agent's tools (triage-lookup-item, etc.) take
  // over for follow-ups.
  function buildFirstTurnPayload(userText: string): string {
    if (favorites.length === 0) return userText;
    const ctx = buildItemContext(favorites);
    return `Here are the items I'm focused on right now:\n\n${ctx}\n\n---\n\nMy question:\n${userText}`;
  }

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || streaming) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);
    setError(null);

    const isFirstUserTurn = !messages.some((m) => m.role === 'user');
    const agentPrompt = isFirstUserTurn ? buildFirstTurnPayload(trimmed) : trimmed;

    const ctl = new AbortController();
    abortRef.current = ctl;

    setMessages((m) => [...m, { role: 'assistant', content: '' }]);

    try {
      const stream = streamAgent(
        TRIAGE_AGENT_ID,
        { messages: agentPrompt },
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="w-[900px] max-w-full bg-[#0d1117] border-l border-[#30363d] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bc8cff" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div>
              <h2 className="text-lg font-semibold text-white">Triage Chat</h2>
              <p className="text-xs text-[#8b949e]">
                Powered by{' '}
                <span className="font-mono text-[#bc8cff]">triage-chat-agent</span>
                {favorites.length > 0
                  ? ` · ${favorites.length} favorited item${favorites.length !== 1 ? 's' : ''} in scope`
                  : ' · talk about any issue or PR'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-white text-xl leading-none ml-2"
          >
            ×
          </button>
        </div>

        {favorites.length > 0 && (
          <div className="px-6 py-2 border-b border-[#21262d] bg-[#0d1117]">
            <div className="flex flex-wrap gap-1.5">
              {favorites.map((f) => (
                <span
                  key={`${f._kind}-${f.number}`}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full border ${
                    f._kind === 'pr'
                      ? 'border-[#58a6ff33] text-[#58a6ff] bg-[#58a6ff11]'
                      : 'border-[#3fb95033] text-[#3fb950] bg-[#3fb95011]'
                  }`}
                >
                  {f._kind === 'pr' ? '↗' : '●'} #{f.number}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#30363d"
                  strokeWidth="1"
                  className="mx-auto mb-3"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-[#8b949e] text-sm">
                  Ask the triage agent anything about the backlog
                </p>
                <p className="text-[#484f58] text-xs mt-1">
                  It can read the local triage bundle, look up specific issues/PRs, and refresh data
                  from GitHub.
                </p>
              </div>
              <div>
                <p className="text-xs text-[#8b949e] mb-2">Suggested prompts:</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-xs text-[#8b949e] p-3 bg-[#161b22] border border-[#21262d] rounded-lg hover:border-[#30363d] hover:text-[#e6edf3] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#58a6ff22] text-[#e6edf3] border border-[#58a6ff33]'
                    : 'bg-[#161b22] text-[#e6edf3] border border-[#21262d]'
                }`}
              >
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
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg px-4 py-3">
                <span className="thinking-shimmer text-sm">Thinking</span>
                <span className="thinking-dot" />
                <span className="thinking-dot" />
                <span className="thinking-dot" />
              </div>
            </div>
          )}

          {error && !streaming && (
            <div className="text-xs text-[#f85149] bg-[#f8514911] border border-[#f8514933] rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-6 py-4 border-t border-[#30363d] bg-[#161b22]">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the backlog..."
              disabled={streaming}
              rows={2}
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:border-[#58a6ff] focus:outline-none resize-none disabled:opacity-50"
            />
            {streaming ? (
              <button
                onClick={handleStop}
                className="self-end px-4 py-2.5 bg-[#f85149] text-white text-sm font-medium rounded-lg hover:bg-[#ff7b72] transition-colors"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="self-end px-4 py-2.5 bg-[#238636] text-white text-sm font-medium rounded-lg hover:bg-[#2ea043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            )}
          </div>
          <p className="text-[10px] text-[#484f58] mt-1.5">
            Enter to send, Shift+Enter for newline
          </p>
        </div>
      </div>
    </div>
  );
}
