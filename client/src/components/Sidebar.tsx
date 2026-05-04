import { AgentSummary, WorkflowSummary, ToolSummary } from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';

export type Tab =
  | 'chat'
  | 'workspaces'
  | 'workflows'
  | 'tools'
  | 'memory'
  | 'browser'
  | 'mcp'
  | 'scorers'
  | 'observability';

interface Props {
  tab: Tab;
  onChangeTab: (t: Tab) => void;
  agents: AgentSummary[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  workflows: WorkflowSummary[];
  tools: ToolSummary[];
  serverOnline: boolean;
  onTeach: (id: PrimitiveId) => void;
}

const TABS: Array<{ id: Tab; label: string; primitive: PrimitiveId }> = [
  { id: 'chat', label: 'Chat', primitive: 'agent' },
  { id: 'workspaces', label: 'Workspaces', primitive: 'workspace' },
  { id: 'workflows', label: 'Workflows', primitive: 'workflow' },
  { id: 'tools', label: 'Tools', primitive: 'tool' },
  { id: 'memory', label: 'Memory', primitive: 'memory' },
  { id: 'browser', label: 'Browser', primitive: 'browser' },
  { id: 'mcp', label: 'MCP', primitive: 'mcp' },
  { id: 'scorers', label: 'Scorers', primitive: 'scorer' },
  { id: 'observability', label: 'Observability', primitive: 'observability' },
];

export function Sidebar({
  tab,
  onChangeTab,
  agents,
  selectedAgentId,
  onSelectAgent,
  workflows,
  tools,
  serverOnline,
  onTeach,
}: Props) {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold">
            M
          </div>
          <div>
            <div className="text-sm font-semibold">MastraClaw</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              serverOnline ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-400">
            {serverOnline ? 'server online' : 'waiting for :4111'}
          </span>
        </div>
      </div>

      <nav className="p-2 border-b border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onChangeTab(t.id)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-sm mb-0.5 ${
              tab === t.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <span>{t.label}</span>
            {/* asStatic — avoid <button> inside <button>. The tab row is the
                click target; the badge is pure decoration. */}
            <PrimitiveBadge
              primitive={t.primitive}
              onTeach={onTeach}
              compact
              asStatic
            />
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'chat' && (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 px-1">
              Agents ({agents.length})
            </div>
            <ul className="space-y-1">
              {agents.map((a) => {
                const subAgentCount = Object.keys(a.agents ?? {}).length;
                return (
                  <li key={a.id}>
                    <button
                      onClick={() => onSelectAgent(a.id)}
                      className={`w-full text-left px-3 py-2 rounded ${
                        selectedAgentId === a.id
                          ? 'bg-indigo-500/15 border border-indigo-500/30'
                          : 'hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="text-sm font-medium text-slate-100">
                        {a.name ?? a.id}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {a.id}
                      </div>
                      {subAgentCount > 0 && (
                        <div className="mt-1">
                          <PrimitiveBadge
                            primitive="agent-as-tool"
                            onTeach={onTeach}
                            compact
                          />
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
              {agents.length === 0 && (
                <li className="text-xs text-slate-500 px-2">No agents yet.</li>
              )}
            </ul>
          </>
        )}

        {tab === 'workflows' && (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 px-1">
              Workflows ({workflows.length})
            </div>
            <ul className="space-y-1">
              {workflows.map((w) => (
                <li
                  key={w.id}
                  className="px-3 py-2 rounded hover:bg-slate-800/40 border border-transparent"
                >
                  <div className="text-sm font-medium">{w.id}</div>
                  {w.description && (
                    <div className="text-[11px] text-slate-500">
                      {w.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === 'tools' && (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 px-1">
              Global tools ({tools.length})
            </div>
            <ul className="space-y-1 text-xs">
              {tools.map((t) => (
                <li
                  key={t.id}
                  className="px-3 py-1.5 rounded hover:bg-slate-800/40 font-mono text-slate-300 truncate"
                  title={t.description ?? t.id}
                >
                  {t.id}
                </li>
              ))}
              {tools.length === 0 && (
                <li className="text-slate-500">
                  No tools registered at the root level; most tools attach to
                  agents directly.
                </li>
              )}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
