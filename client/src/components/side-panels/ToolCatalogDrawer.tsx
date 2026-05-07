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
    <div
      className="fixed right-0 top-0 bottom-0 w-[420px] z-50 flex flex-col scan-lines"
      style={{
        borderLeft: '1px solid rgba(108, 230, 248, 0.35)',
        background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.95), rgba(2, 14, 20, 0.95))',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 0 30px rgba(108, 230, 248, 0.2), -4px 0 24px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div className="p-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}>
        <PrimitiveBadge primitive="tool" onTeach={onTeach} compact />
        <div className="holo-title text-sm">TOOL CATALOG</div>
        <span className="text-[10px] holo-readout ml-auto" style={{ color: 'rgba(108, 230, 248, 0.6)' }}>
          [{tools.length.toString().padStart(3, '0')}]
        </span>
        <button
          onClick={onClose}
          className="text-lg leading-none ml-2 transition-colors"
          style={{ color: 'rgba(108, 230, 248, 0.6)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#aaf6ff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(108, 230, 248, 0.6)')}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="p-2" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder=">  filter tools..."
          className="w-full px-2 py-1 text-xs focus:outline-none"
          style={{
            background: 'rgba(2, 14, 20, 0.7)',
            border: '1px solid rgba(108, 230, 248, 0.25)',
            color: '#cdf2fb',
            fontFamily: 'var(--font-mono)',
          }}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-3 text-xs">
        {loading && <div className="italic p-2 holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>// loading...</div>}
        {grouped.map(([source, list]) => (
          <section key={source}>
            <div className="holo-eyebrow px-1 mb-1 flex items-center gap-2">
              <span>// {source.toUpperCase()}</span>
              <span style={{ color: 'rgba(108, 230, 248, 0.4)' }}>[{list.length}]</span>
            </div>
            <ul className="space-y-1">
              {list.map((t) => (
                <ToolRow key={t.id} tool={t} onTeach={onTeach} />
              ))}
            </ul>
          </section>
        ))}
        {!loading && grouped.length === 0 && (
          <div className="italic p-2 holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>// no tools</div>
        )}
      </div>
      <div className="p-3 text-[10px] holo-readout leading-snug" style={{ borderTop: '1px solid rgba(108, 230, 248, 0.22)', color: 'rgba(108, 230, 248, 0.55)' }}>
        // Catalog is live — reflects what the model sees on its next turn.
        Dynamic (Composio/Arcade) tools are scoped per user.
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
    <li style={{ border: '1px solid rgba(108, 230, 248, 0.18)', background: 'rgba(4, 30, 38, 0.4)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-2 flex items-start gap-2"
      >
        <span className="font-mono text-[11px] truncate flex-1" style={{ color: '#cdf2fb' }}>
          &gt; {tool.id}
        </span>
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>{kind}</span>
      </button>
      {open && (
        <div className="px-2 pb-2 space-y-1 text-[11px]">
          {tool.description && (
            <div className="leading-relaxed" style={{ color: '#a8e0ec' }}>
              {tool.description}
            </div>
          )}
          {tool.inputSchema != null && (
            <details>
              <summary className="text-[10px] cursor-pointer holo-readout" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
                // INPUT SCHEMA
              </summary>
              <pre
                className="p-2 text-[10px] whitespace-pre-wrap break-all max-h-40 overflow-auto font-mono"
                style={{ background: 'rgba(2, 14, 20, 0.85)', border: '1px solid rgba(108, 230, 248, 0.18)', color: '#cdf2fb' }}
              >
                {JSON.stringify(tool.inputSchema, null, 2) ?? ''}
              </pre>
            </details>
          )}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onTeach('tool')}
              className="text-[10px] underline decoration-dotted uppercase tracking-widest"
              style={{ color: '#88efff' }}
            >
              ▸ LEARN ABOUT TOOLS
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
