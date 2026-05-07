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
      <div className="p-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}>
        <PrimitiveBadge primitive="workspace" onTeach={onTeach} compact />
        <div className="holo-title text-xs">TODOS</div>
        <button
          onClick={refresh}
          className="ml-auto text-[10px] holo-readout underline decoration-dotted uppercase tracking-widest"
          style={{ color: 'rgba(108, 230, 248, 0.6)' }}
        >
          {loading ? '◌ SYNC' : '↻ REFRESH'}
        </button>
      </div>

      <div className="p-2 flex gap-1 text-[10px]" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}>
        {(['pending', 'all', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-2 py-0.5 font-mono uppercase tracking-widest"
            style={
              filter === f
                ? {
                    background: 'rgba(108, 230, 248, 0.15)',
                    color: '#aaf6ff',
                    border: '1px solid rgba(108, 230, 248, 0.55)',
                    textShadow: '0 0 4px rgba(108, 230, 248, 0.5)',
                  }
                : {
                    background: 'rgba(2, 14, 20, 0.55)',
                    color: 'rgba(108, 230, 248, 0.6)',
                    border: '1px solid rgba(108, 230, 248, 0.18)',
                  }
            }
          >
            {f} [
            {f === 'all'
              ? counts.total
              : f === 'pending'
                ? counts.pending
                : counts.completed}
            ]
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {error && (
          <div className="text-[11px] glow-red" style={{ color: '#ff859a' }}>⚠ {error}</div>
        )}
        {!loading && todos.length === 0 && (
          <div className="text-[10px] holo-readout italic p-2" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
            // No {filter === 'all' ? '' : filter} todos. Ask the agent to
            "remember to…" and one will appear here.
          </div>
        )}
        {todos.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-2 p-2 text-[11px]"
            style={{
              border: '1px solid rgba(108, 230, 248, 0.15)',
              background: 'rgba(4, 30, 38, 0.4)',
            }}
          >
            <button
              onClick={() => !t.completed && handleComplete(t.id)}
              disabled={t.completed}
              className="w-4 h-4 shrink-0 mt-0.5 font-mono text-[10px] flex items-center justify-center"
              style={
                t.completed
                  ? {
                      background: 'rgba(54, 227, 168, 0.25)',
                      color: '#66f5c2',
                      border: '1px solid rgba(54, 227, 168, 0.6)',
                      boxShadow: '0 0 4px rgba(54, 227, 168, 0.4)',
                    }
                  : {
                      border: '1px solid rgba(108, 230, 248, 0.45)',
                      background: 'transparent',
                    }
              }
              aria-label="Complete todo"
              title={t.completed ? 'Already completed' : 'Mark complete'}
            >
              {t.completed ? '✓' : ''}
            </button>
            <div className="min-w-0 flex-1">
              <div style={{ color: t.completed ? 'rgba(108, 230, 248, 0.5)' : '#cdf2fb', textDecoration: t.completed ? 'line-through' : 'none' }}>
                {t.text}
              </div>
              <div className="text-[9px] font-mono truncate" style={{ color: 'rgba(108, 230, 248, 0.4)' }}>
                {new Date(t.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 text-[10px] holo-readout leading-snug" style={{ borderTop: '1px solid rgba(108, 230, 248, 0.22)', color: 'rgba(108, 230, 248, 0.55)' }}>
        // Backed by{' '}
        <span className="font-mono" style={{ color: '#aaf6ff' }}>workspace/todo.json</span>.
        The workspace IS the database.
      </div>
    </div>
  );
}
