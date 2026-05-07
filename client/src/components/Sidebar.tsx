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
  | 'observability'
  | 'triage';

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

const TABS: Array<{ id: Tab; label: string; primitive: PrimitiveId; code: string }> = [
  { id: 'chat',          label: 'CHAT',         primitive: 'agent',         code: '01' },
  { id: 'workspaces',    label: 'WORKSPACE',    primitive: 'workspace',     code: '02' },
  { id: 'workflows',     label: 'WORKFLOW',     primitive: 'workflow',      code: '03' },
  { id: 'tools',         label: 'TOOLS',        primitive: 'tool',          code: '04' },
  { id: 'memory',        label: 'MEMORY',       primitive: 'memory',        code: '05' },
  { id: 'browser',       label: 'BROWSER',      primitive: 'browser',       code: '06' },
  { id: 'mcp',           label: 'MCP',          primitive: 'mcp',           code: '07' },
  { id: 'scorers',       label: 'SCORERS',      primitive: 'scorer',        code: '08' },
  { id: 'observability', label: 'TELEMETRY',    primitive: 'observability', code: '09' },
  { id: 'triage',        label: 'TRIAGE',       primitive: 'workflow',      code: '10' },
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
    <aside
      className="w-64 flex flex-col scan-lines"
      style={{
        borderRight: '1px solid rgba(108, 230, 248, 0.22)',
        background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.55) 0%, rgba(2, 14, 20, 0.35) 100%)',
      }}
    >
      <div
        className="p-4 relative"
        style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}
      >
        <div className="holo-eyebrow mb-2">// COMMAND_LINK</div>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center holo-frame-sm box-glow-cyan"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <span className="holo-title text-base glow-cyan-strong">M</span>
          </div>
          <div className="leading-tight">
            <div className="holo-title text-sm">MASTRACLAW</div>
            <div className="holo-readout text-[10px]" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
              UNIT // 0x4111
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 holo-readout text-[10px]">
          <span
            className="holo-dot"
            style={{ color: serverOnline ? '#36e3a8' : '#ff5874' }}
          />
          <span style={{ color: serverOnline ? '#88efff' : '#ff859a' }}>
            {serverOnline ? 'LINK ESTABLISHED' : 'AWAITING LINK :4111'}
          </span>
        </div>
      </div>

      <nav
        className="p-2 relative"
        style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}
      >
        <div className="holo-eyebrow px-2 mb-1.5">// MODULES</div>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChangeTab(t.id)}
              className="group w-full flex items-center justify-between px-2 py-1.5 text-xs font-mono tracking-widest mb-px transition-all relative"
              style={{
                borderLeft: active
                  ? '2px solid #aaf6ff'
                  : '2px solid transparent',
                background: active
                  ? 'linear-gradient(90deg, rgba(108, 230, 248, 0.18) 0%, rgba(108, 230, 248, 0.02) 100%)'
                  : 'transparent',
                color: active ? '#aaf6ff' : 'rgba(125, 195, 212, 0.85)',
                textShadow: active
                  ? '0 0 6px rgba(170, 246, 255, 0.6)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(108, 230, 248, 0.06)';
                  e.currentTarget.style.color = '#aaf6ff';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(125, 195, 212, 0.85)';
                }
              }}
            >
              <span className="flex items-center gap-2">
                <span style={{ color: active ? '#aaf6ff' : 'rgba(108, 230, 248, 0.55)' }}>
                  {active ? '◆' : '◇'}
                </span>
                <span style={{ opacity: 0.55 }}>{t.code}</span>
                <span>{t.label}</span>
              </span>
              <PrimitiveBadge
                primitive={t.primitive}
                onTeach={onTeach}
                compact
                asStatic
              />
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'chat' && (
          <>
            <div className="holo-eyebrow mb-2 px-1">
              // AGENTS [{agents.length.toString().padStart(2, '0')}]
            </div>
            <ul className="space-y-1.5">
              {agents.map((a) => {
                const subAgentCount = Object.keys(a.agents ?? {}).length;
                const active = selectedAgentId === a.id;
                return (
                  <li key={a.id}>
                    <button
                      onClick={() => onSelectAgent(a.id)}
                      className="w-full text-left px-3 py-2 transition-all"
                      style={{
                        border: active
                          ? '1px solid rgba(108, 230, 248, 0.55)'
                          : '1px solid rgba(108, 230, 248, 0.12)',
                        background: active
                          ? 'linear-gradient(135deg, rgba(108, 230, 248, 0.14), rgba(108, 230, 248, 0.04))'
                          : 'rgba(4, 30, 38, 0.3)',
                        boxShadow: active
                          ? '0 0 12px rgba(108, 230, 248, 0.25), inset 0 0 12px rgba(108, 230, 248, 0.04)'
                          : 'none',
                      }}
                    >
                      <div
                        className="text-sm font-medium font-display tracking-wider uppercase"
                        style={{
                          color: active ? '#aaf6ff' : '#cdf2fb',
                          textShadow: active ? '0 0 6px rgba(108, 230, 248, 0.5)' : 'none',
                        }}
                      >
                        {a.name ?? a.id}
                      </div>
                      <div className="text-[10px] holo-readout" style={{ color: 'rgba(108, 230, 248, 0.5)' }}>
                        &gt; {a.id}
                      </div>
                      {subAgentCount > 0 && (
                        <div className="mt-1.5">
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
                <li className="text-[11px] font-mono px-2" style={{ color: 'rgba(108, 230, 248, 0.4)' }}>
                  // NO AGENTS DETECTED
                </li>
              )}
            </ul>
          </>
        )}

        {tab === 'workflows' && (
          <>
            <div className="holo-eyebrow mb-2 px-1">
              // WORKFLOWS [{workflows.length.toString().padStart(2, '0')}]
            </div>
            <ul className="space-y-1.5">
              {workflows.map((w) => (
                <li
                  key={w.id}
                  className="px-3 py-2 transition-all"
                  style={{
                    border: '1px solid rgba(108, 230, 248, 0.12)',
                    background: 'rgba(4, 30, 38, 0.3)',
                  }}
                >
                  <div
                    className="text-xs font-display uppercase tracking-wider"
                    style={{ color: '#cdf2fb' }}
                  >
                    {w.id}
                  </div>
                  {w.description && (
                    <div className="text-[10px] mt-0.5" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
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
            <div className="holo-eyebrow mb-2 px-1">
              // GLOBAL TOOLS [{tools.length.toString().padStart(2, '0')}]
            </div>
            <ul className="space-y-px text-[11px]">
              {tools.map((t) => (
                <li
                  key={t.id}
                  className="px-2 py-1 holo-readout truncate"
                  style={{ color: 'rgba(125, 195, 212, 0.9)' }}
                  title={t.description ?? t.id}
                >
                  &gt; {t.id}
                </li>
              ))}
              {tools.length === 0 && (
                <li className="text-[10px] font-mono" style={{ color: 'rgba(108, 230, 248, 0.4)' }}>
                  // No tools registered at root level. Most tools attach to
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
