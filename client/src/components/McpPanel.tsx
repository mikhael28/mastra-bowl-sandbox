import { useEffect, useState } from 'react';
import {
  McpServerSummary,
  McpToolSummary,
  listMcpServers,
  listMcpServerTools,
} from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';

interface Props {
  onTeach: (id: PrimitiveId) => void;
}

export function McpPanel({ onTeach }: Props) {
  const [servers, setServers] = useState<McpServerSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tools, setTools] = useState<McpToolSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listMcpServers().then(setServers);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    listMcpServerTools(selectedId)
      .then(setTools)
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <div className="flex-1 flex flex-col min-w-0 scan-lines">
      <header
        className="p-4 flex items-center gap-3"
        style={{
          borderBottom: '1px solid rgba(108, 230, 248, 0.22)',
          background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.5), rgba(2, 14, 20, 0.25))',
        }}
      >
        <div>
          <div className="holo-eyebrow">// MODULE 07</div>
          <h2 className="holo-title text-base mt-0.5">MCP SERVERS</h2>
        </div>
        <PrimitiveBadge primitive="mcp" onTeach={onTeach} compact />
        <div className="text-xs holo-readout" style={{ color: 'rgba(108, 230, 248, 0.6)' }}>
          // This Mastra instance both hosts and consumes MCP.
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-slate-800 overflow-y-auto p-2">
          <div className="text-xs uppercase tracking-wider text-slate-500 px-2 mb-1">
            Servers ({servers.length})
          </div>
          <ul>
            {servers.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left px-2 py-2 rounded text-xs ${
                    selectedId === s.id
                      ? 'bg-fuchsia-500/10 border border-fuchsia-500/30'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-medium">{s.name ?? s.id}</div>
                  <div className="font-mono text-[10px] text-slate-500">
                    {s.id} · v{s.version ?? '?'}
                  </div>
                </button>
              </li>
            ))}
            {servers.length === 0 && (
              <li className="text-xs text-slate-500 px-2 py-2">
                No MCP servers exposed.
              </li>
            )}
          </ul>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedId && (
            <div className="text-slate-500 text-sm">
              Pick a server to inspect its tools.
            </div>
          )}
          {selectedId && (
            <>
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                Exposed tools ({tools.length})
              </div>
              {loading && <div className="text-slate-500 text-xs">Loading…</div>}
              <ul className="space-y-2">
                {tools.map((t) => (
                  <li
                    key={t.id}
                    className="p-2 rounded border border-slate-800 bg-slate-900/40 text-xs"
                  >
                    <div className="font-mono text-slate-100">{t.id}</div>
                    {t.description && (
                      <div className="text-slate-400 mt-1 leading-snug">
                        {t.description}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-[10px] font-mono text-slate-500">
                GET /api/mcp/servers/{selectedId}/tools
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
