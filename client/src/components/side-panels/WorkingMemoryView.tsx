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
      <div className="p-3 border-b border-slate-800 flex items-center gap-2">
        <PrimitiveBadge primitive="working-memory" onTeach={onTeach} compact />
        <div className="text-xs font-semibold text-slate-100">
          Working memory
        </div>
        {wm?.scope && (
          <span className="text-[10px] font-mono text-cyan-300/80 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
            scope: {wm.scope}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            User / resource
          </div>
          <div className="font-mono text-slate-300 text-[11px]">
            {resourceId}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            What MastraClaw remembers
          </div>
          {loading ? (
            <div className="text-slate-500 italic">loading…</div>
          ) : current ? (
            <div className="prose-chat text-[12px] p-2 rounded border border-cyan-500/20 bg-slate-900/60">
              <ReactMarkdown>{current}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-slate-500 italic p-2 rounded border border-slate-800 bg-slate-900/40">
              {wm?.error ??
                'Empty. The agent has not learned anything about this user yet — send a message with identifying info (role, tone, project) and ask it to remember.'}
            </div>
          )}
          {wm?.updatedAt && (
            <div className="mt-1 text-[10px] text-slate-500">
              last updated {formatRelative(wm.updatedAt)}
            </div>
          )}
        </div>

        {template && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Template
            </div>
            <pre className="p-2 rounded border border-slate-800 bg-slate-950 text-[11px] whitespace-pre-wrap break-all font-mono text-slate-300">
              {template}
            </pre>
            <div className="mt-1 text-[10px] text-slate-500 leading-relaxed">
              The agent writes into this markdown template when it learns new
              things. Fields it hasn't learned yet stay blank — instructions
              forbid inventing values.
            </div>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-slate-800 text-[10px] text-slate-500 leading-snug">
        Served by{' '}
        <span className="font-mono text-slate-300">
          GET /working-memory/{agentId}
        </span>{' '}
        (custom route in src/mastra/routes/).
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
