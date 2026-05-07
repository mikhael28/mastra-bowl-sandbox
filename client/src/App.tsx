import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import {
  AgentSummary,
  ToolSummary,
  WorkflowSummary,
  listAgents,
  listWorkflows,
  listTools,
  pingServer,
} from './lib/mastraClient';
import { PrimitiveId } from './lib/education';
import { Sidebar, Tab } from './components/Sidebar';
import { Chat } from './components/Chat';
import { WorkspacesPanel } from './components/WorkspacesPanel';
import { WorkflowPanel } from './components/WorkflowPanel';
import { ToolsPanel } from './components/ToolsPanel';
import { MemoryPanel } from './components/MemoryPanel';
import { BrowserMirrorPanel } from './components/BrowserMirrorPanel';
import { McpPanel } from './components/McpPanel';
import { ScorersPanel } from './components/ScorersPanel';
import { ObservabilityPanel } from './components/ObservabilityPanel';
import { EducationPanel } from './components/EducationPanel';
import { TriagePanel } from './components/triage/TriagePanel';
import { ModelStatusPicker } from './components/ModelStatusPicker';
import { ServerTargetPicker } from './components/ServerTargetPicker';
import { getActiveServerUrl } from './lib/mastraClient';
import {
  ErrorLogSidebar,
  ErrorLogToggleButton,
} from './components/ErrorLogSidebar';

export default function App() {
  const [tab, setTab] = useState<Tab>('chat');
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [tools, setTools] = useState<ToolSummary[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [teaching, setTeaching] = useState<PrimitiveId | null>(null);
  const [serverOnline, setServerOnline] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Shared across panels so a finished Chat turn refreshes the Observability
  // trace list, and "view trace" from Chat deep-links into the right trace.
  const [traceRefreshNonce, setTraceRefreshNonce] = useState(0);
  const [focusRunId, setFocusRunId] = useState<string | null>(null);
  const [errorLogOpen, setErrorLogOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      const online = await pingServer();
      if (!alive) return;
      setServerOnline(online);
      if (!online) {
        setLoadError(
          `Could not reach the Mastra server at ${getActiveServerUrl()}. Switch targets from the topbar, or start the local server with \`npm run dev\` in the project root.`,
        );
        return;
      }
      setLoadError(null);
      try {
        const [a, w, t] = await Promise.all([
          listAgents(),
          listWorkflows(),
          listTools(),
        ]);
        if (!alive) return;
        setAgents(a);
        setWorkflows(w);
        setTools(t);
        // Prefer MastraClaw as the default selection — it's the flagship.
        const preferred =
          a.find((x) => x.id === 'mastraclaw-agent') ?? a[0] ?? null;
        if (preferred) setSelectedAgentId(preferred.id);
      } catch (err: any) {
        setLoadError(String(err.message ?? err));
      }
    }
    load();
    const interval = setInterval(async () => {
      const online = await pingServer();
      setServerOnline(online);
    }, 10_000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);

  const selectedAgent =
    agents.find((a) => a.id === selectedAgentId) ?? null;

  const chatAgents = agents.filter((a) => a.id === 'mastraclaw-agent');

  return (
    <div className="h-screen flex flex-col">
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
      <TopBar
        onTeach={setTeaching}
        errorLogOpen={errorLogOpen}
        onToggleErrorLog={() => setErrorLogOpen((v) => !v)}
      />
      <ErrorLogSidebar
        open={errorLogOpen}
        onClose={() => setErrorLogOpen(false)}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          tab={tab}
          onChangeTab={setTab}
          agents={chatAgents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(id) => {
            setSelectedAgentId(id);
            setTab('chat');
          }}
          workflows={workflows}
          tools={tools}
          serverOnline={serverOnline}
          onTeach={setTeaching}
        />
        <main className="flex-1 flex overflow-hidden">
          {loadError && (
            <div className="flex-1 p-6 scan-lines">
              <div className="max-w-xl mx-auto mt-16 holo-panel-red holo-frame p-6 text-sm">
                <div className="holo-bracket-h text-[11px] mb-3 glow-red">
                  <span style={{ color: '#ff859a' }}>SIGNAL LOST</span>
                </div>
                <div className="font-display uppercase tracking-widest text-base mb-2 glow-red"
                     style={{ color: '#ff859a' }}>
                  Mastra Server Unavailable
                </div>
                <div className="text-slate-200">{loadError}</div>
                <div className="mt-4 text-xs holo-readout text-slate-400">
                  &gt; cd /Users/michael/Mastra/testing/mastra-bowl-sandbox &amp;&amp; npm run dev
                </div>
              </div>
            </div>
          )}
          {!loadError && tab === 'chat' && (
            <Chat
              agent={selectedAgent}
              onTeach={setTeaching}
              onTurnFinished={() => setTraceRefreshNonce((n) => n + 1)}
              onViewTrace={(runId) => {
                setFocusRunId(runId);
                setTab('observability');
              }}
            />
          )}
          {!loadError && tab === 'workspaces' && (
            <WorkspacesPanel
              agent={selectedAgent}
              onTeach={setTeaching}
            />
          )}
          {!loadError && tab === 'workflows' && (
            <WorkflowPanel
              workflows={workflows}
              onTeach={setTeaching}
              onRunFinished={() => setTraceRefreshNonce((n) => n + 1)}
              onViewTrace={(runId) => {
                setFocusRunId(runId);
                setTab('observability');
              }}
            />
          )}
          {!loadError && tab === 'tools' && (
            <ToolsPanel
              globalTools={tools}
              agents={agents}
              onTeach={setTeaching}
            />
          )}
          {!loadError && tab === 'memory' && (
            <MemoryPanel agents={agents} onTeach={setTeaching} />
          )}
          {!loadError && tab === 'browser' && (
            <BrowserMirrorPanel agent={selectedAgent} onTeach={setTeaching} />
          )}
          {!loadError && tab === 'mcp' && <McpPanel onTeach={setTeaching} />}
          {!loadError && tab === 'scorers' && (
            <ScorersPanel onTeach={setTeaching} />
          )}
          {!loadError && tab === 'observability' && (
            <ObservabilityPanel
              focusRunId={focusRunId}
              focusTraceId={null}
              onTeach={setTeaching}
              refreshNonce={traceRefreshNonce}
            />
          )}
          {!loadError && tab === 'triage' && <TriagePanel />}
          <EducationPanel
            primitiveId={teaching}
            onClose={() => setTeaching(null)}
          />
        </main>
      </div>
    </div>
  );
}

function TopBar({
  onTeach,
  errorLogOpen,
  onToggleErrorLog,
}: {
  onTeach: (id: PrimitiveId) => void;
  errorLogOpen: boolean;
  onToggleErrorLog: () => void;
}) {
  return (
    <header
      className="relative border-b px-4 h-14 flex items-center gap-4 text-sm scan-lines"
      style={{
        borderColor: 'rgba(108, 230, 248, 0.25)',
        background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.6) 0%, rgba(2, 14, 20, 0.4) 100%)',
        boxShadow: '0 1px 0 rgba(108, 230, 248, 0.15), 0 4px 18px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Top accent line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(108, 230, 248, 0.6) 20%, rgba(170, 246, 255, 0.9) 50%, rgba(108, 230, 248, 0.6) 80%, transparent 100%)' }}
      />
      <div className="flex items-center gap-3 relative z-10">
        <div
          className="w-9 h-9 flex items-center justify-center holo-frame-sm box-glow-cyan"
          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
        >
          <span className="font-display font-bold text-lg glow-cyan-strong" style={{ color: '#aaf6ff' }}>
            iD
          </span>
        </div>
        <div className="leading-tight">
          <div className="holo-title text-sm">MASTRACLAW</div>
          <div className="holo-eyebrow">// iDroid Sandbox v2.6</div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 relative z-10">
        <ErrorLogToggleButton
          onClick={onToggleErrorLog}
          active={errorLogOpen}
        />
        <ServerTargetPicker />
        <ModelStatusPicker />
        <span aria-hidden className="mx-1 text-cyan-700">|</span>
        <TopBarTeachLink label="OBS" onClick={() => onTeach('observability')} />
        <TopBarTeachLink label="WKSP" onClick={() => onTeach('workspace')} />
        <TopBarTeachLink label="BRWS" onClick={() => onTeach('browser')} />
        <TopBarTeachLink label="RAG" onClick={() => onTeach('rag')} />
      </div>
    </header>
  );
}

function TopBarTeachLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[10px] font-mono tracking-widest px-2 py-1 transition-all"
      style={{
        color: 'rgba(108, 230, 248, 0.7)',
        border: '1px solid rgba(108, 230, 248, 0.18)',
        background: 'rgba(108, 230, 248, 0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#aaf6ff';
        e.currentTarget.style.borderColor = 'rgba(108, 230, 248, 0.55)';
        e.currentTarget.style.boxShadow = '0 0 8px rgba(108, 230, 248, 0.3)';
        e.currentTarget.style.textShadow = '0 0 4px rgba(108, 230, 248, 0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'rgba(108, 230, 248, 0.7)';
        e.currentTarget.style.borderColor = 'rgba(108, 230, 248, 0.18)';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.textShadow = '';
      }}
    >
      ?{label}
    </button>
  );
}
