import { useEffect, useMemo, useState } from 'react';
import {
  ToolSummary,
  AgentSummary,
  listAgentTools,
  executeTool,
  executeAgentTool,
} from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';

interface Props {
  globalTools: ToolSummary[];
  agents: AgentSummary[];
  onTeach: (id: PrimitiveId) => void;
}

export function ToolsPanel({ globalTools, agents, onTeach }: Props) {
  const [agentId, setAgentId] = useState<string>('mastraclaw-agent');
  const [agentTools, setAgentTools] = useState<ToolSummary[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [dataJson, setDataJson] = useState('{}');
  const [result, setResult] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!agentId) return;
    listAgentTools(agentId).then(setAgentTools);
  }, [agentId]);

  const selected = useMemo(
    () =>
      [...globalTools, ...agentTools].find((t) => t.id === selectedToolId) ??
      null,
    [globalTools, agentTools, selectedToolId],
  );

  async function run() {
    if (!selected) return;
    setRunning(true);
    setErr(null);
    setResult(null);
    let data: unknown = {};
    try {
      data = JSON.parse(dataJson || '{}');
    } catch (e: any) {
      setErr(`Bad JSON: ${e.message}`);
      setRunning(false);
      return;
    }
    try {
      const isGlobal = globalTools.some((t) => t.id === selected.id);
      const res = isGlobal
        ? await executeTool(selected.id, data)
        : await executeAgentTool(agentId, selected.id, data);
      setResult(res);
    } catch (e: any) {
      setErr(String(e.message ?? e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="border-b border-slate-800 p-4 flex items-center gap-3">
        <h2 className="font-semibold">Tools</h2>
        <PrimitiveBadge primitive="tool" onTeach={onTeach} compact />
        <div className="text-xs text-slate-400">
          Call any tool directly — same endpoint the agent uses.
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-slate-800 overflow-y-auto">
          <div className="p-3 border-b border-slate-800">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
              Agent context
            </div>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id}
                </option>
              ))}
            </select>
          </div>
          <div className="p-3">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
              Agent tools ({agentTools.length})
            </div>
            <ul className="space-y-0.5">
              {agentTools.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedToolId(t.id)}
                    className={`w-full text-left px-2 py-1 rounded text-xs font-mono truncate ${
                      selectedToolId === t.id
                        ? 'bg-emerald-500/15 border border-emerald-500/30'
                        : 'hover:bg-slate-800/60'
                    }`}
                    title={t.description ?? t.id}
                  >
                    {t.id}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs uppercase tracking-wider text-slate-500 mb-1">
              Global tools ({globalTools.length})
            </div>
            <ul className="space-y-0.5">
              {globalTools.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedToolId(t.id)}
                    className={`w-full text-left px-2 py-1 rounded text-xs font-mono truncate ${
                      selectedToolId === t.id
                        ? 'bg-emerald-500/15 border border-emerald-500/30'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    {t.id}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {!selected && (
            <div className="text-slate-500 text-sm">Pick a tool on the left.</div>
          )}
          {selected && (
            <>
              <div className="text-sm font-mono text-slate-100">{selected.id}</div>
              {selected.description && (
                <div className="text-xs text-slate-400 mt-1">
                  {selected.description}
                </div>
              )}
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                  Input (JSON)
                </div>
                <textarea
                  value={dataJson}
                  onChange={(e) => setDataJson(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono"
                />
                <button
                  onClick={run}
                  disabled={running}
                  className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm rounded"
                >
                  {running ? 'Running…' : 'Execute'}
                </button>
              </div>
              {err && (
                <pre className="mt-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded p-2 whitespace-pre-wrap">
                  {err}
                </pre>
              )}
              {result !== null && (
                <div className="mt-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                    Result
                  </div>
                  <pre className="bg-slate-950 border border-slate-800 rounded p-2 text-[11px] whitespace-pre-wrap break-all max-h-96 overflow-auto">
                    {safe(result)}
                  </pre>
                </div>
              )}
              <div className="mt-6 text-[10px] text-slate-500 font-mono">
                POST /api/agents/{agentId}/tools/{selected.id}/execute
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function safe(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
