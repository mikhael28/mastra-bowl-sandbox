import { useEffect, useState } from 'react';
import { LocalModelStatus, getLocalModelStatus } from '../lib/mastraClient';

/**
 * Topbar widget: shows the model the agent is actually using, indicates
 * whether LM Studio is detected, and lets the user pick an alternative. The
 * agent's `model` field is bound at process start, so picking writes the
 * intent to localStorage and shows a copy-pastable env override the user
 * sets before the next `npm run dev`. Honest about the constraint instead of
 * pretending we can hot-swap models.
 */
export function ModelStatusPicker() {
  const [status, setStatus] = useState<LocalModelStatus | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getLocalModelStatus().then(setStatus);
    const t = setInterval(() => getLocalModelStatus().then(setStatus), 15_000);
    return () => clearInterval(t);
  }, []);

  if (!status) return null;

  const dot =
    status.source === 'local'
      ? 'bg-emerald-400'
      : status.source === 'override'
        ? 'bg-sky-400'
        : 'bg-slate-500';

  const options: Array<{ id: string; label: string; hint?: string }> = [
    { id: status.cloudDefault, label: status.cloudDefault, hint: 'cloud default' },
    ...status.lmStudio.models.map((m) => ({
      id: `lmstudio/${m}`,
      label: `lmstudio/${m}`,
      hint: 'local',
    })),
  ];
  // Dedupe in case override matches one of the above
  if (
    status.override &&
    !options.find((o) => o.id === status.override)
  ) {
    options.unshift({ id: status.override, label: status.override, hint: 'override' });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase px-2 py-1 transition-all"
        style={{
          border: '1px solid rgba(108, 230, 248, 0.25)',
          color: 'rgba(170, 246, 255, 0.85)',
          background: 'rgba(108, 230, 248, 0.04)',
        }}
        title="Model selection"
      >
        <span className={`w-2 h-2 rounded-full ${dot}`} style={{ boxShadow: '0 0 4px currentColor' }} />
        <span className="truncate max-w-[26ch]" style={{ letterSpacing: '0.04em', textTransform: 'none' }}>
          {status.selected}
        </span>
        <span style={{ color: 'rgba(108, 230, 248, 0.6)' }}>▾</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-96 z-30 text-xs holo-frame"
          style={{
            background: 'rgba(2, 14, 20, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 24px rgba(108, 230, 248, 0.15)',
          }}
        >
          <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.18)' }}>
            <div className="holo-eyebrow mb-1">// ACTIVE MODEL</div>
            <div className="font-mono truncate glow-cyan" style={{ color: '#aaf6ff' }}>
              {status.selected}
            </div>
            <div className="text-[10px] holo-readout mt-0.5" style={{ color: 'rgba(108, 230, 248, 0.5)' }}>
              src: {status.source}
            </div>
          </div>
          <div className="px-3 py-2 border-b border-slate-800">
            <div className="text-slate-300 font-semibold mb-1">LM Studio</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${status.lmStudio.running ? 'bg-emerald-400' : 'bg-slate-500'}`}
              />
              {status.lmStudio.running
                ? `running at ${status.lmStudio.baseUrl}`
                : `not detected at ${status.lmStudio.baseUrl}`}
            </div>
            {status.lmStudio.running && status.lmStudio.models.length > 0 && (
              <div className="text-[11px] text-slate-500 mt-1">
                {status.lmStudio.models.length} model
                {status.lmStudio.models.length === 1 ? '' : 's'} loaded
              </div>
            )}
            {!status.lmStudio.running && (
              <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Start LM Studio's local server (Developer → Start Server),
                load a model, then refresh. Recommended:
                <span className="font-mono text-slate-300 block mt-1">
                  Qwen3-4B-Instruct-2507 (~2.5 GB Q4_K_M)
                </span>
              </div>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {options.map((o) => (
              <button
                key={o.id}
                onClick={() => copyOverride(o.id)}
                className={`w-full text-left px-3 py-2 border-b border-slate-800 last:border-b-0 hover:bg-slate-800 ${
                  o.id === status.selected ? 'bg-slate-800/60' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-200 truncate flex-1">
                    {o.label}
                  </span>
                  {o.hint && (
                    <span className="text-[10px] text-slate-500">
                      {o.hint}
                    </span>
                  )}
                </div>
                {o.id === status.selected && (
                  <div className="text-[10px] text-emerald-300 mt-0.5">
                    in use
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            To switch, click a model — we'll copy the env override to your
            clipboard. Set it before the next{' '}
            <span className="font-mono text-slate-300">npm run dev</span>:
            <pre className="mt-1 font-mono text-[10px] text-slate-300 bg-slate-950 border border-slate-800 rounded p-1.5 whitespace-pre-wrap">
              MASTRA_PREFERRED_MODEL={status.selected}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

async function copyOverride(modelId: string) {
  const text = `MASTRA_PREFERRED_MODEL=${modelId}`;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard might be blocked — silently no-op */
  }
}
