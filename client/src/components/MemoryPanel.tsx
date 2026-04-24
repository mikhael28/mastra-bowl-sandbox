import { useEffect, useState } from 'react';
import {
  AgentSummary,
  MemoryMessage,
  MemoryThreadSummary,
  getMemoryThreadMessages,
  listMemoryThreads,
} from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';

interface Props {
  agents: AgentSummary[];
  onTeach: (id: PrimitiveId) => void;
}

export function MemoryPanel({ agents, onTeach }: Props) {
  const [agentId, setAgentId] = useState<string>('mastraclaw-agent');
  const [resourceId, setResourceId] = useState<string>('mastra-bowl-demo-user');
  const [threads, setThreads] = useState<MemoryThreadSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<MemoryMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const t = await listMemoryThreads({ resourceId, agentId });
      setThreads(t);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [agentId, resourceId]);

  useEffect(() => {
    if (!selected) return;
    getMemoryThreadMessages(selected, { agentId }).then(setMessages);
  }, [selected, agentId]);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="border-b border-slate-800 p-4 flex items-center gap-3 flex-wrap">
        <h2 className="font-semibold">Memory</h2>
        <PrimitiveBadge primitive="memory" onTeach={onTeach} compact />
        <PrimitiveBadge primitive="working-memory" onTeach={onTeach} compact />
        <select
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs"
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.id}
            </option>
          ))}
        </select>
        <input
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono"
          placeholder="resourceId"
        />
        <button
          onClick={refresh}
          className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700"
        >
          {loading ? '…' : 'Refresh'}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r border-slate-800 overflow-y-auto">
          <div className="p-3 text-xs uppercase tracking-wider text-slate-500">
            Threads ({threads.length})
          </div>
          <ul>
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setSelected(t.id)}
                  className={`w-full text-left px-3 py-2 text-xs border-b border-slate-800 ${
                    selected === t.id
                      ? 'bg-sky-500/10 border-l-2 border-l-sky-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-medium truncate">
                    {t.title || t.id}
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 truncate">
                    {t.id}
                  </div>
                </button>
              </li>
            ))}
            {threads.length === 0 && !loading && (
              <li className="px-3 py-2 text-xs text-slate-500">
                No threads. Send a message in chat to create one.
              </li>
            )}
          </ul>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!selected && (
            <div className="text-slate-500 text-sm">
              Select a thread to see stored messages.
            </div>
          )}
          <ul className="space-y-2">
            {messages.map((m) => (
              <li
                key={m.id}
                className="border border-slate-800 rounded p-2 text-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="font-mono">{m.role}</span>
                  <span>{m.createdAt}</span>
                </div>
                <pre className="whitespace-pre-wrap break-all">
                  {typeof m.content === 'string'
                    ? m.content
                    : safe(m.content)}
                </pre>
              </li>
            ))}
          </ul>
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
