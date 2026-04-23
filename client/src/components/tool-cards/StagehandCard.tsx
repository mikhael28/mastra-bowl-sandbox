import { useState } from 'react';
import { PrimitiveBadge } from '../PrimitiveBadge';
import { ToolCardProps, statusColor, unwrap, safeStringify } from './types';

/**
 * Stagehand browser cards — one look for each of navigate / observe / act /
 * extract / close. Stagehand is the Mastra primitive for natural-language
 * browser automation, so the cards lean into *intent* (what the agent asked
 * for) rather than low-level DOM details.
 *
 * Teaching:
 *   • Stagehand verbs are English, not CSS selectors.
 *   • `observe` → candidates, `act` → action, `extract` → structured data.
 *   • Cloud mode (Browserbase) vs local headless is a one-flag switch.
 */
export function StagehandCard(props: ToolCardProps) {
  const { tc, onTeach } = props;
  const args = (tc.args ?? {}) as any;
  const result = unwrap(tc.result) as any;

  let body: React.ReactNode = null;
  let subtitle = '';

  switch (tc.toolName) {
    case 'stagehand_navigate': {
      const url = args.url ?? args.href ?? '?';
      subtitle = url;
      body = (
        <div className="flex items-center gap-2 p-2 rounded bg-slate-950/80 border border-slate-800">
          <span className="text-lime-300">🌐</span>
          <a
            href={typeof url === 'string' ? url : undefined}
            target="_blank"
            rel="noreferrer"
            className="text-lime-200 hover:text-lime-100 underline decoration-dotted font-mono text-xs truncate"
          >
            {url}
          </a>
          {result?.title && (
            <span className="ml-auto text-[10px] text-slate-400 truncate max-w-xs">
              {result.title}
            </span>
          )}
        </div>
      );
      break;
    }
    case 'stagehand_observe': {
      const instruction = args.instruction ?? args.query ?? '';
      subtitle = instruction;
      const candidates: Array<any> = Array.isArray(result)
        ? result
        : Array.isArray(result?.observations)
          ? result.observations
          : Array.isArray(result?.candidates)
            ? result.candidates
            : [];
      body = (
        <div>
          {instruction && (
            <div className="text-[11px] text-slate-300 italic mb-1">
              “{instruction}”
            </div>
          )}
          {candidates.length === 0 ? (
            <div className="text-[11px] text-slate-500">
              {tc.status === 'done' ? 'no candidate actions found' : 'observing…'}
            </div>
          ) : (
            <ul className="space-y-1">
              {candidates.slice(0, 8).map((c: any, i: number) => (
                <li
                  key={i}
                  className="p-1.5 rounded border border-slate-800 bg-slate-900/40 text-[11px]"
                >
                  <div className="font-mono text-lime-300 truncate">
                    {c.description ?? c.action ?? c.text ?? safeStringify(c)}
                  </div>
                  {c.selector && (
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {c.selector}
                    </div>
                  )}
                </li>
              ))}
              {candidates.length > 8 && (
                <li className="text-[10px] text-slate-500 italic">
                  … {candidates.length - 8} more
                </li>
              )}
            </ul>
          )}
        </div>
      );
      break;
    }
    case 'stagehand_act': {
      const instruction = args.instruction ?? args.action ?? '';
      subtitle = instruction;
      body = (
        <div>
          <div className="text-[11px] text-slate-300 italic">
            → {instruction}
          </div>
          {result?.success !== undefined && (
            <div
              className={`mt-1 text-[11px] ${
                result.success ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {result.success ? 'acted successfully' : 'act failed'}
              {result?.message && (
                <span className="text-slate-400 ml-2">— {result.message}</span>
              )}
            </div>
          )}
        </div>
      );
      break;
    }
    case 'stagehand_extract': {
      const instruction = args.instruction ?? args.query ?? '';
      subtitle = instruction;
      body = <ExtractView instruction={instruction} result={result} />;
      break;
    }
    case 'stagehand_close': {
      subtitle = 'close session';
      body = (
        <div className="text-[11px] text-slate-500 italic">
          Browser session closed.
        </div>
      );
      break;
    }
    default:
      subtitle = tc.toolName.replace('stagehand_', '');
      body = (
        <pre className="bg-slate-950 rounded p-2 text-[11px] whitespace-pre-wrap break-all max-h-40 overflow-auto">
          {safeStringify(result ?? tc.args)}
        </pre>
      );
  }

  return (
    <div className={`mt-2 border rounded p-2 text-xs ${statusColor(tc.status)}`}>
      <div className="flex items-center gap-2">
        <PrimitiveBadge primitive="browser" onTeach={onTeach} compact />
        <span className="font-mono text-slate-200">{tc.toolName}</span>
        <span className="ml-auto text-[10px] text-slate-400">{tc.status}</span>
      </div>
      {subtitle && (
        <div className="text-[11px] text-slate-400 font-mono truncate mt-1">
          {subtitle}
        </div>
      )}
      <div className="mt-2">{body}</div>
      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-start gap-2 text-[10px] text-slate-500 leading-relaxed">
        <button
          onClick={() => onTeach('browser')}
          className="shrink-0 text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
        >
          learn →
        </button>
        <span>
          Stagehand verbs are plain English: navigate, observe (enumerate),
          act (do), extract (structured data). Always{' '}
          <span className="font-mono">stagehand_close</span> when done.
        </span>
      </div>
    </div>
  );
}

function ExtractView({
  instruction,
  result,
}: {
  instruction: string;
  result: any;
}) {
  const [raw, setRaw] = useState(false);
  if (!result) {
    return (
      <div className="text-[11px] text-slate-500 italic">extracting…</div>
    );
  }
  const data = result?.data ?? result;

  // Arrays → render as rows; objects → key/value table.
  let pretty: React.ReactNode = null;
  if (Array.isArray(data)) {
    pretty = (
      <div className="space-y-1">
        {data.slice(0, 10).map((item, i) => (
          <div
            key={i}
            className="p-1.5 rounded border border-slate-800 bg-slate-900/40 text-[11px]"
          >
            {typeof item === 'object' ? (
              <ObjectTable obj={item} />
            ) : (
              <span className="text-slate-200">{String(item)}</span>
            )}
          </div>
        ))}
        {data.length > 10 && (
          <div className="text-[10px] text-slate-500 italic">
            … {data.length - 10} more rows
          </div>
        )}
      </div>
    );
  } else if (data && typeof data === 'object') {
    pretty = <ObjectTable obj={data} />;
  } else {
    pretty = <div className="text-[11px] text-slate-200">{String(data)}</div>;
  }

  return (
    <div>
      {instruction && (
        <div className="text-[11px] text-slate-300 italic mb-1">
          “{instruction}”
        </div>
      )}
      <div className="flex items-center justify-end mb-1">
        <button
          onClick={() => setRaw((r) => !r)}
          className="text-[10px] text-slate-500 hover:text-slate-300 underline decoration-dotted"
        >
          {raw ? 'pretty' : 'raw JSON'}
        </button>
      </div>
      {raw ? (
        <pre className="bg-slate-950 rounded p-2 text-[11px] whitespace-pre-wrap break-all max-h-48 overflow-auto">
          {safeStringify(data)}
        </pre>
      ) : (
        pretty
      )}
    </div>
  );
}

function ObjectTable({ obj }: { obj: any }) {
  const entries = Object.entries(obj).slice(0, 8);
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
      {entries.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-slate-500 font-mono">{k}</dt>
          <dd className="text-slate-200 truncate">
            {typeof v === 'object' ? safeStringify(v) : String(v)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
