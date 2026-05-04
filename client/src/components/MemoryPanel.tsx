import { useEffect, useState } from 'react';
import {
  AgentSummary,
  MemoryMessage,
  MemoryThreadSummary,
  WorkingMemory,
  deleteMemoryThread,
  getMemoryThreadMessages,
  getWorkingMemory,
  listMemoryThreads,
  updateWorkingMemory,
} from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';

interface Props {
  agents: AgentSummary[];
  onTeach: (id: PrimitiveId) => void;
}

type Tab = 'threads' | 'working-memory';

export function MemoryPanel({ agents, onTeach }: Props) {
  const [agentId, setAgentId] = useState<string>('mastraclaw-agent');
  const [resourceId, setResourceId] = useState<string>('mastra-bowl-demo-user');
  const [tab, setTab] = useState<Tab>('threads');

  const [threads, setThreads] = useState<MemoryThreadSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<MemoryMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Working-memory editor state
  const [wm, setWm] = useState<WorkingMemory | null>(null);
  const [wmDraft, setWmDraft] = useState<string>('');
  const [wmSaving, setWmSaving] = useState(false);
  const [wmBanner, setWmBanner] = useState<string | null>(null);
  const [wmLoading, setWmLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const t = await listMemoryThreads({ resourceId, agentId });
      setThreads(t);
    } finally {
      setLoading(false);
    }
  }

  async function refreshWorkingMemory() {
    setWmLoading(true);
    setWmBanner(null);
    try {
      const r = await getWorkingMemory(agentId, { resourceId });
      setWm(r);
      setWmDraft(r?.workingMemory ?? r?.template ?? '');
    } finally {
      setWmLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    refreshWorkingMemory();
  }, [agentId, resourceId]);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    getMemoryThreadMessages(selected, { agentId }).then(setMessages);
  }, [selected, agentId]);

  async function onDelete(threadId: string) {
    if (!window.confirm(`Delete thread ${threadId.slice(0, 16)}…? This cannot be undone.`))
      return;
    setDeleting(threadId);
    try {
      const ok = await deleteMemoryThread(threadId);
      if (!ok) {
        window.alert('Delete failed');
        return;
      }
      if (selected === threadId) {
        setSelected(null);
        setMessages([]);
      }
      refresh();
    } finally {
      setDeleting(null);
    }
  }

  async function onSaveWorkingMemory() {
    setWmSaving(true);
    setWmBanner(null);
    try {
      const res = await updateWorkingMemory(agentId, {
        resourceId,
        workingMemory: wmDraft,
      });
      if (res.ok) {
        setWmBanner('saved');
        await refreshWorkingMemory();
        window.setTimeout(() => setWmBanner(null), 1500);
      } else {
        setWmBanner(`error: ${res.error ?? 'unknown'}`);
      }
    } finally {
      setWmSaving(false);
    }
  }

  function onResetWorkingMemoryDraft() {
    setWmDraft(wm?.workingMemory ?? wm?.template ?? '');
    setWmBanner(null);
  }

  const filtered = threads.filter((t) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      (t.title ?? '').toLowerCase().includes(q)
    );
  });

  const wmDirty = wmDraft !== (wm?.workingMemory ?? wm?.template ?? '');

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
          onClick={() => {
            refresh();
            refreshWorkingMemory();
          }}
          className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700"
        >
          {loading || wmLoading ? '…' : 'Refresh'}
        </button>
        <div className="ml-auto flex items-center gap-0 text-[11px] rounded border border-slate-700 overflow-hidden">
          {(['threads', 'working-memory'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 ${t === 'working-memory' ? 'border-l border-slate-700' : ''} ${
                tab === t
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              {t === 'threads' ? 'Threads' : 'Working memory'}
            </button>
          ))}
        </div>
      </header>

      {tab === 'threads' && (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-slate-800 overflow-y-auto flex flex-col">
            <div className="p-3 border-b border-slate-800 flex items-center gap-2">
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="filter…"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs"
              />
              <span className="text-[10px] text-slate-500">
                {filtered.length}/{threads.length}
              </span>
            </div>
            <ul className="flex-1">
              {filtered.map((t) => (
                <li key={t.id}>
                  <div
                    className={`flex items-center gap-1 border-b border-slate-800 ${
                      selected === t.id
                        ? 'bg-sky-500/10 border-l-2 border-l-sky-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <button
                      onClick={() => setSelected(t.id)}
                      className="flex-1 text-left px-3 py-2 text-xs"
                    >
                      <div className="font-medium truncate">
                        {t.title || t.id}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 truncate">
                        {t.id}
                      </div>
                      {t.updatedAt && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(t.updatedAt).toLocaleString()}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      disabled={deleting === t.id}
                      className="px-2 text-[11px] text-slate-500 hover:text-rose-300 disabled:opacity-40"
                      title="Delete this thread (forget)"
                    >
                      {deleting === t.id ? '…' : '✕'}
                    </button>
                  </div>
                </li>
              ))}
              {filtered.length === 0 && !loading && (
                <li className="px-3 py-2 text-xs text-slate-500">
                  No threads.
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
      )}

      {tab === 'working-memory' && (
        <div className="flex-1 overflow-auto p-4 space-y-3">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              scope: <span className="text-slate-200">{wm?.scope ?? '—'}</span>
            </span>
            <span>
              enabled:{' '}
              <span className="text-slate-200">
                {wm?.enabled === false ? 'no' : 'yes'}
              </span>
            </span>
            {wm?.updatedAt && (
              <span>
                updated:{' '}
                <span className="text-slate-200">
                  {new Date(wm.updatedAt).toLocaleString()}
                </span>
              </span>
            )}
          </div>

          {wm?.error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded p-2">
              {wm.error}
            </div>
          )}

          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
              Stored block (markdown)
            </div>
            <textarea
              value={wmDraft}
              onChange={(e) => setWmDraft(e.target.value)}
              spellCheck={false}
              rows={20}
              className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
              placeholder="(empty)"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={onSaveWorkingMemory}
                disabled={wmSaving || !wmDirty}
                className="px-3 py-1 text-xs rounded bg-emerald-600 text-white disabled:opacity-30 hover:bg-emerald-500"
              >
                {wmSaving ? 'saving…' : 'Save'}
              </button>
              <button
                onClick={onResetWorkingMemoryDraft}
                disabled={!wmDirty || wmSaving}
                className="px-3 py-1 text-xs rounded border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
              >
                Reset
              </button>
              {wmBanner && (
                <span className="text-[11px] text-slate-400">{wmBanner}</span>
              )}
            </div>
          </div>

          {wm?.template && (
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer text-slate-300">
                template
              </summary>
              <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] bg-slate-950 border border-slate-800 rounded p-2">
                {wm.template}
              </pre>
            </details>
          )}
        </div>
      )}
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
