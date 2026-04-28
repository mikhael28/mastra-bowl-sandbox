import { useEffect, useState } from 'react';
import { EDUCATION, PrimitiveId } from '../lib/education';

interface Props {
  primitiveId: PrimitiveId | null;
  onClose: () => void;
}

const COLLAPSED_KEY = 'mastra-bowl:education-panel-collapsed';

export function EducationPanel({ primitiveId, onClose }: Props) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  // If a user clicks a primitive badge while the panel is collapsed, open it.
  useEffect(() => {
    if (primitiveId && collapsed) setCollapsed(false);
  }, [primitiveId]);

  if (collapsed) {
    return (
      <aside className="hidden lg:flex flex-col w-8 border-l border-slate-800 bg-slate-900/40 items-center pt-3">
        <button
          onClick={() => setCollapsed(false)}
          className="text-slate-400 hover:text-slate-100 text-xs px-1.5 py-2 rounded hover:bg-slate-800/60"
          title="Show learning panel"
          aria-label="Show learning panel"
        >
          <span className="block leading-none">‹</span>
          <span
            className="block mt-2 text-[10px] tracking-widest text-slate-500"
            style={{ writingMode: 'vertical-rl' }}
          >
            LEARN
          </span>
        </button>
      </aside>
    );
  }

  if (!primitiveId) {
    return (
      <aside className="hidden lg:flex flex-col w-80 border-l border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-slate-500">
            Learning panel
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-500 hover:text-slate-200 text-xs px-1.5 rounded hover:bg-slate-800/60"
            title="Hide learning panel"
            aria-label="Hide learning panel"
          >
            ›
          </button>
        </div>
        <p className="leading-relaxed">
          Click any{' '}
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono">
            primitive
          </span>{' '}
          badge in the app — on an agent card, a tool result, a workflow step —
          and this panel explains what it is, why it exists, and how this
          sandbox wires it up.
        </p>
        <div className="mt-6">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
            Primitives in this project
          </div>
          <ul className="space-y-1">
            {Object.values(EDUCATION).map((e) => (
              <li
                key={e.id}
                className="text-slate-300 text-xs flex items-baseline gap-2"
              >
                <span className="inline-block w-1 h-1 rounded-full bg-indigo-400" />
                <span className="font-medium">{e.title}</span>
                <span className="text-slate-500 truncate">{e.tagline}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    );
  }

  const entry = EDUCATION[primitiveId];

  return (
    <aside className="hidden lg:flex flex-col w-80 border-l border-slate-800 bg-slate-900/40 overflow-y-auto">
      <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-indigo-400">
            Mastra primitive
          </div>
          <h2 className="text-lg font-semibold mt-0.5">{entry.title}</h2>
          <p className="text-sm text-slate-400 mt-1 leading-snug">
            {entry.tagline}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 text-lg leading-none px-1"
            aria-label="Close primitive detail"
            title="Close this primitive"
          >
            ×
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-500 hover:text-slate-200 text-sm leading-none px-1"
            aria-label="Hide learning panel"
            title="Hide learning panel"
          >
            ›
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 text-sm">
        <section>
          <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-1.5">
            Why it matters
          </h3>
          <p className="text-slate-300 leading-relaxed">{entry.why}</p>
        </section>

        <section>
          <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-1.5">
            In this sandbox
          </h3>
          <ul className="space-y-1.5">
            {entry.howHere.map((line, i) => (
              <li
                key={i}
                className="text-slate-300 leading-relaxed text-xs pl-3 border-l-2 border-indigo-500/40"
              >
                {line}
              </li>
            ))}
          </ul>
        </section>

        {entry.endpoint && (
          <section>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-1.5">
              HTTP endpoint
            </h3>
            <code className="block bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-emerald-300 font-mono break-all">
              {entry.endpoint}
            </code>
          </section>
        )}

        {entry.docs && (
          <section>
            <a
              href={entry.docs}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-300 hover:text-indigo-200 text-xs underline decoration-dotted"
            >
              Read the docs →
            </a>
          </section>
        )}
      </div>
    </aside>
  );
}
