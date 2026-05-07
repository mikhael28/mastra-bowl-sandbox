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
      <aside
        className="hidden lg:flex flex-col w-8 items-center pt-3 scan-lines"
        style={{
          borderLeft: '1px solid rgba(108, 230, 248, 0.22)',
          background: 'rgba(4, 30, 38, 0.35)',
        }}
      >
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs px-1.5 py-2 transition-colors"
          style={{ color: 'rgba(108, 230, 248, 0.6)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#aaf6ff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(108, 230, 248, 0.6)')}
          title="Show learning panel"
          aria-label="Show learning panel"
        >
          <span className="block leading-none">◀</span>
          <span
            className="block mt-2 text-[10px] tracking-widest holo-eyebrow"
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
      <aside
        className="hidden lg:flex flex-col w-80 p-4 text-sm overflow-y-auto scan-lines"
        style={{
          borderLeft: '1px solid rgba(108, 230, 248, 0.22)',
          background: 'rgba(4, 30, 38, 0.35)',
          color: 'rgba(170, 246, 255, 0.7)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="holo-eyebrow">// LEARNING PANEL</div>
          <button
            onClick={() => setCollapsed(true)}
            className="text-xs px-1.5"
            style={{ color: 'rgba(108, 230, 248, 0.6)' }}
            title="Hide learning panel"
            aria-label="Hide learning panel"
          >
            ▶
          </button>
        </div>
        <p className="leading-relaxed">
          // Click any{' '}
          <span
            className="px-1.5 py-0.5 text-xs font-mono uppercase tracking-widest"
            style={{
              background: 'rgba(108, 230, 248, 0.15)',
              border: '1px solid rgba(108, 230, 248, 0.45)',
              color: '#aaf6ff',
            }}
          >
            primitive
          </span>{' '}
          badge in the app — on an agent card, a tool result, a workflow step —
          and this panel explains what it is, why it exists, and how this
          sandbox wires it up.
        </p>
        <div className="mt-6">
          <div className="holo-eyebrow mb-2">// PRIMITIVES</div>
          <ul className="space-y-1.5">
            {Object.values(EDUCATION).map((e) => (
              <li
                key={e.id}
                className="text-xs flex items-baseline gap-2"
                style={{ color: '#cdf2fb' }}
              >
                <span className="inline-block w-1 h-1 rounded-full" style={{ background: '#aaf6ff', boxShadow: '0 0 3px #aaf6ff' }} />
                <span className="font-medium uppercase tracking-wider font-display">{e.title}</span>
                <span className="truncate" style={{ color: 'rgba(108, 230, 248, 0.6)' }}>
                  {e.tagline}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    );
  }

  const entry = EDUCATION[primitiveId];

  return (
    <aside
      className="hidden lg:flex flex-col w-80 overflow-y-auto scan-lines"
      style={{
        borderLeft: '1px solid rgba(108, 230, 248, 0.22)',
        background: 'rgba(4, 30, 38, 0.35)',
      }}
    >
      <div className="p-4 flex items-start justify-between gap-2" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.22)' }}>
        <div className="min-w-0">
          <div className="holo-eyebrow">// MASTRA PRIMITIVE</div>
          <h2 className="holo-title text-lg mt-1">{entry.title}</h2>
          <p className="text-sm mt-1 leading-snug" style={{ color: 'rgba(170, 246, 255, 0.75)' }}>
            {entry.tagline}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onClose}
            className="text-lg leading-none px-1"
            style={{ color: 'rgba(108, 230, 248, 0.6)' }}
            aria-label="Close primitive detail"
            title="Close this primitive"
          >
            ✕
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="text-sm leading-none px-1"
            style={{ color: 'rgba(108, 230, 248, 0.6)' }}
            aria-label="Hide learning panel"
            title="Hide learning panel"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 text-sm">
        <section>
          <h3 className="holo-eyebrow mb-1.5">// WHY IT MATTERS</h3>
          <p className="leading-relaxed" style={{ color: '#cdf2fb' }}>{entry.why}</p>
        </section>

        <section>
          <h3 className="holo-eyebrow mb-1.5">// IN THIS SANDBOX</h3>
          <ul className="space-y-1.5">
            {entry.howHere.map((line, i) => (
              <li
                key={i}
                className="leading-relaxed text-xs pl-3"
                style={{ color: '#cdf2fb', borderLeft: '2px solid rgba(108, 230, 248, 0.45)' }}
              >
                {line}
              </li>
            ))}
          </ul>
        </section>

        {entry.endpoint && (
          <section>
            <h3 className="holo-eyebrow mb-1.5">// HTTP ENDPOINT</h3>
            <code
              className="block px-2 py-1.5 text-xs font-mono break-all"
              style={{
                background: 'rgba(2, 14, 20, 0.85)',
                border: '1px solid rgba(108, 230, 248, 0.25)',
                color: '#66f5c2',
              }}
            >
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
              className="text-xs underline decoration-dotted uppercase tracking-widest"
              style={{ color: '#88efff' }}
            >
              ▸ READ THE DOCS
            </a>
          </section>
        )}
      </div>
    </aside>
  );
}
