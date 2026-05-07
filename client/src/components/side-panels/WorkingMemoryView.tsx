import { useEffect, useState } from 'react';
import { getWorkingMemory, WorkingMemory } from '../../lib/mastraClient';
import { PrimitiveBadge } from '../PrimitiveBadge';
import { PrimitiveId } from '../../lib/education';
import ReactMarkdown from 'react-markdown';

/**
 * Read-only view of the agent's resource-scoped working memory. Working
 * memory is one of the most important Mastra memory primitives but also the
 * hardest to visualize — it's the *structured profile the agent maintains
 * about you*, independent of chat history.
 *
 * Teaches:
 *   • Working memory is persisted markdown, not a vector store or a DB row.
 *   • scope=resource means all threads for this user share the same profile.
 *   • The template is the schema. When fields are blank, the agent hasn't
 *     learned them yet (instructions forbid invention).
 */
interface Props {
  agentId: string;
  resourceId: string;
  threadId?: string | null;
  onTeach: (p: PrimitiveId) => void;
  refreshNonce?: number;
}

export function WorkingMemoryView({
  agentId,
  resourceId,
  threadId,
  onTeach,
  refreshNonce = 0,
}: Props) {
  const [wm, setWm] = useState<WorkingMemory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getWorkingMemory(agentId, { resourceId, threadId: threadId ?? undefined })
      .then((data) => {
        if (alive) setWm(data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [agentId, resourceId, threadId, refreshNonce]);

  const current = (wm?.workingMemory ?? '').trim();
  const template = (wm?.template ?? '').trim();

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}>
        <PrimitiveBadge primitive="working-memory" onTeach={onTeach} compact />
        <div className="holo-title text-xs">WORKING MEMORY</div>
        {wm?.scope && (
          <span
            className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5"
            style={{
              background: 'rgba(54, 212, 236, 0.10)',
              border: '1px solid rgba(54, 212, 236, 0.45)',
              color: '#36d4ec',
            }}
          >
            SCOPE: {wm.scope}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        <div>
          <div className="holo-eyebrow mb-1">// USER / RESOURCE</div>
          <div className="font-mono text-[11px]" style={{ color: '#aaf6ff' }}>
            {resourceId}
          </div>
        </div>

        <div>
          <div className="holo-eyebrow mb-1">// WHAT MASTRACLAW REMEMBERS</div>
          {loading ? (
            <div className="italic holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>// loading...</div>
          ) : current ? (
            <div
              className="prose-chat text-[12px] p-2"
              style={{ border: '1px solid rgba(54, 212, 236, 0.35)', background: 'rgba(2, 14, 20, 0.7)' }}
            >
              <ReactMarkdown>{current}</ReactMarkdown>
            </div>
          ) : (
            <div
              className="italic p-2 holo-readout"
              style={{ border: '1px solid rgba(108, 230, 248, 0.18)', background: 'rgba(4, 30, 38, 0.4)', color: 'rgba(108, 230, 248, 0.6)' }}
            >
              // {wm?.error ?? 'Empty. The agent has not learned anything about this user yet.'}
            </div>
          )}
          {wm?.updatedAt && (
            <div className="mt-1 text-[10px] holo-readout" style={{ color: 'rgba(108, 230, 248, 0.5)' }}>
              // last updated {formatRelative(wm.updatedAt)}
            </div>
          )}
        </div>

        {template && (
          <div>
            <div className="holo-eyebrow mb-1">// TEMPLATE</div>
            <pre
              className="p-2 text-[11px] whitespace-pre-wrap break-all font-mono"
              style={{ border: '1px solid rgba(108, 230, 248, 0.18)', background: 'rgba(2, 14, 20, 0.85)', color: '#cdf2fb' }}
            >
              {template}
            </pre>
            <div className="mt-1 text-[10px] holo-readout leading-relaxed" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
              // The agent writes into this markdown template when it learns
              new things. Fields it hasn't learned yet stay blank.
            </div>
          </div>
        )}
      </div>

      <div className="p-2 text-[10px] holo-readout leading-snug" style={{ borderTop: '1px solid rgba(108, 230, 248, 0.22)', color: 'rgba(108, 230, 248, 0.55)' }}>
        // Served by{' '}
        <span className="font-mono" style={{ color: '#aaf6ff' }}>
          GET /working-memory/{agentId}
        </span>
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const t = Date.parse(iso);
  if (!t) return iso;
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(t).toLocaleString();
}
