import { useEffect, useMemo, useState } from 'react';
import { listAgentTools, ToolSummary } from '../../lib/mastraClient';
import { PrimitiveBadge } from '../PrimitiveBadge';
import { PrimitiveId, classifyTool, toolProvenance } from '../../lib/education';

/**
 * Tool Catalog — the drawer that shows *every* tool the current agent can
 * call, grouped by provenance (Workspace / Browser / RAG / Search / Subagent
 * / Composio / Arcade / MCP / ...). This is the piece that makes "what is
 * this agent?" legible: an agent is its *tools*, plus instructions.
 *
 * Teaching hooks:
 *   • Tool sources: static Mastra, workspace, Composio/Arcade (dynamic,
 *     per-user), MCP (remote), subagents (agent-as-tool).
 *   • Names are stable identifiers — the catalog is what the LLM actually sees.
 */

interface Props {
  agentId: string;
  onTeach: (p: PrimitiveId) => void;
  onClose: () => void;
}

const GROUP_ORDER = [
  'Workspace',
  'Browser',
  'RAG',
  'Search API',
  'Research',
  'BD',
  'Subagent',
  'Composio',
  'Arcade',
  'MCP',
  'Tool',
];

export function ToolCatalogDrawer({ agentId, onTeach, onClose }: Props) {
  const [tools, setTools] = useState<ToolSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listAgentTools(agentId)
      .then((ts) => {
        if (alive) setTools(ts);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [agentId]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? tools.filter(
          (t) =>
            t.id.toLowerCase().includes(q) ||
            (t.description ?? '').toLowerCase().includes(q),
        )
      : tools;
    const byGroup = new Map<string, ToolSummary[]>();
    for (const t of filtered) {
      const { source } = toolProvenance(t.id);
      const arr = byGroup.get(source) ?? [];
      arr.push(t);
      byGroup.set(source, arr);
    }
    return Array.from(byGroup.entries()).sort(
      ([a], [b]) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b),
    );
  }, [tools, query]);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-slate-950 border-l border-slate-800 z-50 flex flex-col shadow-2xl">
      <div className="p-3 border-b border-slate-800 flex items-center gap-2">
        <PrimitiveBadge primitive="tool" onTeach={onTeach} compact />
        <div className="text-sm font-semibold text-slate-100">Tool catalog</div>
        <span className="text-[10px] text-slate-500 ml-auto">
          {tools.length} tools
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-100 text-lg leading-none ml-2"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="p-2 border-b border-slate-800">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="filter tools…"
          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500/60"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-3 text-xs">
        {loading && <div className="text-slate-500 italic p-2">loading…</div>}
        {grouped.map(([source, list]) => (
          <section key={source}>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 px-1 mb-1 flex items-center gap-2">
              <span>{source}</span>
              <span className="text-slate-700">({list.length})</span>
            </div>
            <ul className="space-y-1">
              {list.map((t) => (
                <ToolRow key={t.id} tool={t} onTeach={onTeach} />
              ))}
            </ul>
          </section>
        ))}
        {!loading && grouped.length === 0 && (
          <div className="text-slate-500 italic p-2">no tools</div>
        )}
      </div>
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 leading-snug">
        Catalog is live — it reflects what the model actually sees on its next
        turn. Dynamic (Composio/Arcade) tools are scoped per user.
      </div>
    </div>
  );
}

function ToolRow({
  tool,
  onTeach,
}: {
  tool: ToolSummary;
  onTeach: (p: PrimitiveId) => void;
}) {
  const [open, setOpen] = useState(false);
  const kind = classifyTool(tool.id);
  return (
    <li className="border border-slate-800 rounded bg-slate-900/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-2 flex items-start gap-2"
      >
        <span className="font-mono text-slate-200 text-[11px] truncate flex-1">
          {tool.id}
        </span>
        <span className="text-[9px] font-mono text-slate-500">{kind}</span>
      </button>
      {open && (
        <div className="px-2 pb-2 space-y-1 text-[11px]">
          {tool.description && (
            <div className="text-slate-300 leading-relaxed">
              {tool.description}
            </div>
          )}
          {tool.inputSchema != null && (
            <details>
              <summary className="text-[10px] text-slate-500 cursor-pointer">
                input schema
              </summary>
              <pre className="bg-slate-950 p-2 rounded text-[10px] whitespace-pre-wrap break-all max-h-40 overflow-auto font-mono">
                {JSON.stringify(tool.inputSchema, null, 2) ?? ''}
              </pre>
            </details>
          )}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onTeach('tool')}
              className="text-[10px] text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
            >
              learn about tools →
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
