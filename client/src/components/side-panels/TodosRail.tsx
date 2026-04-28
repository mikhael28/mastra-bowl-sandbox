import { useCallback, useEffect, useState } from 'react';
import { completeTodo, listTodos, TodoItem } from '../../lib/mastraClient';
import { PrimitiveBadge } from '../PrimitiveBadge';
import { PrimitiveId } from '../../lib/education';

/**
 * Workspace todo list, rendered as a right-rail sidebar. Reads through the
 * `todo-list` tool (which reads workspace/todo.json) and writes via
 * `todo-complete`. Refreshable.
 *
 * Why it's here: MastraClaw's prompt tells it to use todos for cross-session
 * follow-ups. Without a UI, the user never saw them. Now they do, and the
 * "workspace-as-store" pattern becomes tangible.
 */
interface Props {
  agentId: string;
  onTeach: (p: PrimitiveId) => void;
  refreshNonce: number;
}

export function TodosRail({ agentId, onTeach, refreshNonce }: Props) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, completed: 0 });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listTodos(agentId, filter);
      setTodos(res.todos);
      setCounts(res.counts);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setLoading(false);
    }
  }, [agentId, filter]);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshNonce]);

  async function handleComplete(id: string) {
    await completeTodo(agentId, id);
    await refresh();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-800 flex items-center gap-2">
        <PrimitiveBadge primitive="workspace" onTeach={onTeach} compact />
        <div className="text-xs font-semibold text-slate-100">Todos</div>
        <button
          onClick={refresh}
          className="ml-auto text-[10px] text-slate-500 hover:text-slate-200 underline decoration-dotted"
        >
          {loading ? '…' : 'refresh'}
        </button>
      </div>

      <div className="p-2 border-b border-slate-800 flex gap-1 text-[10px]">
        {(['pending', 'all', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 rounded ${
              filter === f
                ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600'
            }`}
          >
            {f} (
            {f === 'all'
              ? counts.total
              : f === 'pending'
                ? counts.pending
                : counts.completed}
            )
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {error && (
          <div className="text-[11px] text-rose-300">{error}</div>
        )}
        {!loading && todos.length === 0 && (
          <div className="text-[11px] text-slate-500 italic p-2">
            No {filter === 'all' ? '' : filter} todos. Ask the agent to
            "remember to…" and one will appear here.
          </div>
        )}
        {todos.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-2 p-2 rounded border border-slate-800 bg-slate-900/40 text-[11px]"
          >
            <button
              onClick={() => !t.completed && handleComplete(t.id)}
              disabled={t.completed}
              className={`w-4 h-4 rounded border shrink-0 mt-0.5 ${
                t.completed
                  ? 'bg-emerald-500/30 border-emerald-500/60 text-emerald-200'
                  : 'border-slate-600 hover:border-emerald-400'
              }`}
              aria-label="Complete todo"
              title={t.completed ? 'Already completed' : 'Mark complete'}
            >
              {t.completed ? '✓' : ''}
            </button>
            <div className="min-w-0 flex-1">
              <div
                className={
                  t.completed
                    ? 'text-slate-500 line-through'
                    : 'text-slate-200'
                }
              >
                {t.text}
              </div>
              <div className="text-[9px] text-slate-600 font-mono truncate">
                {new Date(t.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-slate-800 text-[10px] text-slate-500 leading-snug">
        Backed by{' '}
        <span className="font-mono text-slate-300">workspace/todo.json</span>.
        The workspace IS the database for this primitive.
      </div>
    </div>
  );
}
