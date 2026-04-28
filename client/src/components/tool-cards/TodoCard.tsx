import { useEffect, useRef } from 'react';
import { PrimitiveBadge } from '../PrimitiveBadge';
import { ToolCardProps, statusColor, unwrap } from './types';

/**
 * `todo-add`, `todo-list`, `todo-complete` — the three tools in
 * src/mastra/tools/todo-tools.ts that read/write `workspace/todo.json`.
 *
 * Teaching hook: this is the simplest possible "persistent, cross-session
 * state" pattern — a JSON file living in the workspace. No DB, no schema, no
 * ORM. It's a great example of how the workspace primitive replaces whole
 * layers of infrastructure for simple use cases.
 */
export function TodoCard(props: ToolCardProps & { onRefreshTodos?: () => void }) {
  const { tc, onTeach, onRefreshTodos } = props;
  const result = unwrap(tc.result) as any;

  let body: React.ReactNode = null;
  if (tc.toolName === 'todo-add') {
    const todo = result?.todo;
    body = todo ? (
      <div className="flex items-center gap-2 p-2 rounded bg-slate-900/40 border border-slate-800 text-[11px]">
        <span className="text-emerald-400">+</span>
        <span className="text-slate-200">{todo.text}</span>
        <span className="ml-auto text-[10px] text-slate-500 font-mono">
          total {result?.total}
        </span>
      </div>
    ) : (
      <div className="text-[11px] text-slate-500">adding todo…</div>
    );
  } else if (tc.toolName === 'todo-list') {
    const todos: any[] = result?.todos ?? [];
    const counts = result?.counts ?? {};
    body = (
      <div>
        <div className="text-[10px] text-slate-500 mb-1">
          {counts.pending ?? 0} pending · {counts.completed ?? 0} completed ·{' '}
          {counts.total ?? 0} total
        </div>
        <ul className="space-y-0.5">
          {todos.slice(0, 8).map((t: any) => (
            <li
              key={t.id}
              className="flex items-center gap-2 text-[11px] px-2 py-1 rounded bg-slate-900/40 border border-slate-800"
            >
              <span className={t.completed ? 'text-emerald-400' : 'text-slate-500'}>
                {t.completed ? '✓' : '○'}
              </span>
              <span
                className={
                  t.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                }
              >
                {t.text}
              </span>
            </li>
          ))}
          {todos.length === 0 && (
            <li className="text-[11px] text-slate-500 italic">no todos</li>
          )}
          {todos.length > 8 && (
            <li className="text-[10px] text-slate-500 italic pl-2">
              … {todos.length - 8} more
            </li>
          )}
        </ul>
      </div>
    );
  } else if (tc.toolName === 'todo-complete') {
    const todo = result?.todo;
    body = todo ? (
      <div className="flex items-center gap-2 p-2 rounded bg-slate-900/40 border border-slate-800 text-[11px]">
        <span className="text-emerald-400">✓</span>
        <span className="text-slate-200 line-through">{todo.text}</span>
        <span className="ml-auto text-[10px] text-slate-500 font-mono">
          done {formatTime(todo.completedAt)}
        </span>
      </div>
    ) : (
      <div className="text-[11px] text-slate-500">
        no todo with that id
      </div>
    );
  }

  // Any todo-tool call invalidates our local sidebar copy. Fire exactly once
  // on transition to done — not on every re-render.
  const firedRef = useRef(false);
  useEffect(() => {
    if (tc.status === 'done' && onRefreshTodos && !firedRef.current) {
      firedRef.current = true;
      onRefreshTodos();
    }
  }, [tc.status, onRefreshTodos]);

  return (
    <div className={`mt-2 border rounded p-2 text-xs ${statusColor(tc.status)}`}>
      <div className="flex items-center gap-2">
        <PrimitiveBadge primitive="workspace" onTeach={onTeach} compact />
        <span className="font-mono text-slate-200">{tc.toolName}</span>
        <span className="ml-auto text-[10px] text-slate-400">{tc.status}</span>
      </div>
      <div className="mt-2">{body}</div>
      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
        <button
          onClick={() => onTeach('workspace')}
          className="shrink-0 text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
        >
          learn →
        </button>
        <span>
          Persisted to <span className="font-mono">workspace/todo.json</span>.
          No DB — the workspace is the store.
        </span>
      </div>
    </div>
  );
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    return d.toLocaleString();
  } catch {
    return '';
  }
}
