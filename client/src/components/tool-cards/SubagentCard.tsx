import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PrimitiveBadge } from '../PrimitiveBadge';
import { ToolCardProps, statusColor, unwrap, safeStringify } from './types';

/**
 * When MastraClaw calls one of its specialist agents (copywriter, editor,
 * research-planner, retrieval-evaluator, email-agent) the parent agent sees
 * the call as a tool invocation. The stream we receive here is the *parent's*
 * stream, so we don't get the subagent's inner text/reasoning chunks. What we
 * *do* get is the subagent's final text, usually with some structure
 * (messages, toolCalls, usage).
 *
 * This card renders that final reply as a nested bubble — styled to look like
 * a mini assistant message — so the "agent-as-tool" pattern is legible
 * instead of looking like a JSON blob. Teaches that subagents compose: each
 * has its own instructions, model, and tools, and they surface back a
 * structured response the parent can reason about.
 */
export function SubagentCard(props: ToolCardProps) {
  const { tc, onTeach } = props;
  const [showRaw, setShowRaw] = useState(false);
  const result = unwrap(tc.result) as any;

  const { text, toolCalls, usage } = extractSubagentResponse(result);
  const subagentLabel = humanize(tc.toolName);

  return (
    <div className={`mt-2 border p-2 text-xs ${statusColor(tc.status)}`}>
      <div className="flex items-center gap-2">
        <PrimitiveBadge primitive="agent-as-tool" onTeach={onTeach} compact />
        <span className="font-mono uppercase tracking-wider truncate text-cyan-100 text-[11px]">
          {tc.toolName}
        </span>
        <span className="holo-eyebrow">// SUBAGENT</span>
        <span className="ml-auto holo-eyebrow">[{tc.status.toUpperCase()}]</span>
      </div>

      {tc.status === 'calling' && !text && (
        <div className="mt-2 text-[10px] holo-readout italic" style={{ color: 'rgba(108, 230, 248, 0.6)' }}>
          // {subagentLabel.toUpperCase()} is working...
        </div>
      )}

      {text && (
        <div
          className="mt-2 p-3 relative"
          style={{
            background: 'rgba(2, 14, 20, 0.7)',
            border: '1px solid rgba(170, 246, 255, 0.25)',
            boxShadow: 'inset 0 0 18px rgba(170, 246, 255, 0.04)',
          }}
        >
          <div
            className="absolute -top-2 left-3 px-1.5 text-[9px] uppercase tracking-widest font-mono"
            style={{ background: 'rgba(2, 14, 20, 0.95)', color: '#aaf6ff' }}
          >
            // {subagentLabel}
          </div>
          <div className="prose-chat text-[12px] leading-relaxed">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
          {toolCalls.length > 0 && (
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(108, 230, 248, 0.18)' }}>
              <div className="holo-eyebrow mb-1">
                // INNER TOOLS [{toolCalls.length}]
              </div>
              <ul className="space-y-0.5">
                {toolCalls.map((t, i) => (
                  <li
                    key={i}
                    className="text-[10px] font-mono truncate"
                    style={{ color: 'rgba(170, 246, 255, 0.7)' }}
                  >
                    &gt; {t.toolName ?? 'tool'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {usage && (
            <div className="mt-2 pt-2 text-[10px] holo-readout" style={{ borderTop: '1px solid rgba(108, 230, 248, 0.18)', color: 'rgba(108, 230, 248, 0.55)' }}>
              TOK IN={usage.promptTokens ?? usage.inputTokens ?? '?'} OUT={usage.completionTokens ?? usage.outputTokens ?? '?'}
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-end">
        <button
          onClick={() => setShowRaw((r) => !r)}
          className="text-[10px] underline decoration-dotted uppercase tracking-widest"
          style={{ color: 'rgba(108, 230, 248, 0.6)' }}
        >
          {showRaw ? '◣ HIDE RAW' : '◣ RAW JSON'}
        </button>
      </div>
      {showRaw && (
        <pre
          className="mt-1 p-2 text-[10px] whitespace-pre-wrap break-all max-h-56 overflow-auto"
          style={{ background: 'rgba(2, 14, 20, 0.7)', border: '1px solid rgba(108, 230, 248, 0.18)', color: '#cdf2fb' }}
        >
          {safeStringify(result ?? tc.args)}
        </pre>
      )}

      <div
        className="mt-2 pt-2 flex items-start gap-2 text-[10px] holo-readout leading-relaxed"
        style={{ borderTop: '1px solid rgba(108, 230, 248, 0.15)', color: 'rgba(108, 230, 248, 0.55)' }}
      >
        <button
          onClick={() => onTeach('agent-as-tool')}
          className="shrink-0 underline decoration-dotted uppercase tracking-widest"
          style={{ color: '#88efff' }}
        >
          ▸ LEARN
        </button>
        <span>
          This whole bubble is the *reply* from {subagentLabel}. It ran its own
          agent loop — instructions, model, tools, memory — before coming back
          with this answer to MastraClaw.
        </span>
      </div>
    </div>
  );
}

function humanize(toolName: string): string {
  return toolName
    .replace(/Agent$/, '-agent')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .toLowerCase();
}

/**
 * Subagent results are returned in a few shapes depending on how the parent
 * agent invoked them. Try to extract `text`, inner `toolCalls`, and `usage`.
 */
function extractSubagentResponse(result: any): {
  text: string;
  toolCalls: Array<{ toolName?: string }>;
  usage: any | null;
} {
  if (result == null) return { text: '', toolCalls: [], usage: null };
  if (typeof result === 'string') return { text: result, toolCalls: [], usage: null };

  let text = '';
  if (typeof result.text === 'string') text = result.text;
  else if (typeof result.output === 'string') text = result.output;
  else if (Array.isArray(result.messages)) {
    const last = result.messages[result.messages.length - 1];
    if (last?.content) {
      text = typeof last.content === 'string'
        ? last.content
        : Array.isArray(last.content)
          ? last.content
              .filter((p: any) => p.type === 'text')
              .map((p: any) => p.text)
              .join('\n')
          : '';
    }
  } else if (Array.isArray(result.response?.messages)) {
    const msgs = result.response.messages;
    const last = msgs[msgs.length - 1];
    text = typeof last?.content === 'string' ? last.content : '';
  }

  const toolCalls: Array<{ toolName?: string }> =
    result.toolCalls ??
    result.tool_calls ??
    result.response?.toolCalls ??
    [];

  const usage = result.usage ?? result.response?.usage ?? null;

  return { text, toolCalls, usage };
}
