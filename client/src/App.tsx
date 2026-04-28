import { useEffect, useState } from 'react';
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
import { ArtifactPanel } from './components/ArtifactPanel';
import { WorkspacesPanel } from './components/WorkspacesPanel';
import { WorkflowPanel } from './components/WorkflowPanel';
import { ToolsPanel } from './components/ToolsPanel';
import { MemoryPanel } from './components/MemoryPanel';
import { McpPanel } from './components/McpPanel';
import { ScorersPanel } from './components/ScorersPanel';
import { ObservabilityPanel } from './components/ObservabilityPanel';
import { EducationPanel } from './components/EducationPanel';

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

  useEffect(() => {
    let alive = true;
    async function load() {
      const online = await pingServer();
      if (!alive) return;
      setServerOnline(online);
      if (!online) {
        setLoadError(
          'Could not reach the Mastra dev server on :4111. Start it with `npm run dev` in the project root.',
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

  return (
    <div className="h-screen flex flex-col">
      <TopBar onTeach={setTeaching} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          tab={tab}
          onChangeTab={setTab}
          agents={agents}
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
            <div className="flex-1 p-6">
              <div className="max-w-xl mx-auto mt-16 p-6 rounded-lg bg-rose-500/10 border border-rose-500/30 text-sm text-rose-200">
                <div className="font-medium mb-2">Mastra server unavailable</div>
                <div className="text-rose-100/80">{loadError}</div>
                <div className="mt-4 text-xs text-slate-400 font-mono">
                  cd /Users/michael/Mastra/testing/mastra-bowl-sandbox && npm run dev
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
          {!loadError && tab === 'artifact' && (
            <ArtifactPanel
              agent={selectedAgent}
              onTeach={setTeaching}
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
          <EducationPanel
            primitiveId={teaching}
            onClose={() => setTeaching(null)}
          />
        </main>
      </div>
    </div>
  );
}

function TopBar({ onTeach }: { onTeach: (id: PrimitiveId) => void }) {
  return (
    <header className="border-b border-slate-800 bg-slate-950 px-4 h-12 flex items-center gap-4 text-sm">
      <div className="font-semibold">
        MastraClaw Sandbox
        <span className="text-slate-500 ml-2 text-xs font-normal">
          built with Mastra primitives
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => onTeach('observability')}
          className="text-xs text-slate-400 hover:text-slate-200 underline decoration-dotted"
        >
          what is observability?
        </button>
        <button
          onClick={() => onTeach('workspace')}
          className="text-xs text-slate-400 hover:text-slate-200 underline decoration-dotted"
        >
          workspace
        </button>
        <button
          onClick={() => onTeach('browser')}
          className="text-xs text-slate-400 hover:text-slate-200 underline decoration-dotted"
        >
          browser
        </button>
        <button
          onClick={() => onTeach('rag')}
          className="text-xs text-slate-400 hover:text-slate-200 underline decoration-dotted"
        >
          RAG
        </button>
      </div>
    </header>
  );
}
