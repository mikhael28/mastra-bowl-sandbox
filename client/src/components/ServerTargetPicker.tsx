import { useState } from 'react';
import {
  DEFAULT_TARGET,
  LOCAL_URL,
  REMOTE_URL,
  STUDIO_URL,
  ServerTargetChoice,
  getActiveServerTarget,
  getActiveServerUrl,
  getServerTargetChoice,
  setServerTargetChoice,
} from '../lib/mastraClient';

/**
 * Topbar widget for switching the React client between localhost:4111 and
 * the deployed MASTRA_SERVER_URL at runtime. The "Default" option clears the
 * override so behavior follows the env var again — no .env edits needed.
 *
 * Switching reloads the page so cached agent/workflow/thread state is rebuilt
 * against the new server.
 */
export function ServerTargetPicker() {
  const [open, setOpen] = useState(false);
  const choice = getServerTargetChoice();
  const active = getActiveServerTarget();
  const activeUrl = getActiveServerUrl();

  const dot =
    active === 'remote'
      ? 'bg-sky-400'
      : active === 'studio'
        ? 'bg-violet-400'
        : 'bg-emerald-400';
  const label = active;
  const tag =
    choice === 'default' ? `default · ${DEFAULT_TARGET}` : `pinned · ${choice}`;

  function pick(c: ServerTargetChoice) {
    if (c === choice) {
      setOpen(false);
      return;
    }
    setServerTargetChoice(c);
    window.location.reload();
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
        title="Mastra server target"
      >
        <span className={`w-2 h-2 rounded-full ${dot}`} style={{ boxShadow: '0 0 4px currentColor' }} />
        <span>NODE: {label}</span>
        <span style={{ color: 'rgba(108, 230, 248, 0.6)' }}>▾</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-80 z-30 text-xs holo-frame"
          style={{
            background: 'rgba(2, 14, 20, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 24px rgba(108, 230, 248, 0.15)',
          }}
        >
          <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(108, 230, 248, 0.18)' }}>
            <div className="holo-eyebrow mb-1">// ACTIVE NODE</div>
            <div className="font-mono truncate glow-cyan" style={{ color: '#aaf6ff' }}>
              {activeUrl}
            </div>
            <div className="text-[10px] holo-readout mt-0.5" style={{ color: 'rgba(108, 230, 248, 0.5)' }}>
              &gt; {tag}
            </div>
          </div>
          <Option
            current={choice}
            value="default"
            label={`Default (env → ${DEFAULT_TARGET})`}
            hint="Follow MASTRA_SERVER_URL"
            onPick={pick}
          />
          <Option
            current={choice}
            value="local"
            label="Local"
            hint={LOCAL_URL}
            onPick={pick}
          />
          <Option
            current={choice}
            value="remote"
            label="Remote"
            hint={REMOTE_URL || 'MASTRA_SERVER_URL not set'}
            disabled={!REMOTE_URL}
            onPick={pick}
          />
          <Option
            current={choice}
            value="studio"
            label="Studio"
            hint={STUDIO_URL || 'MASTRA_STUDIO_URL not set'}
            disabled={!STUDIO_URL}
            onPick={pick}
          />
          <div className="px-3 py-2 text-[10px] holo-readout leading-relaxed" style={{ borderTop: '1px solid rgba(108, 230, 248, 0.18)', color: 'rgba(108, 230, 248, 0.5)' }}>
            // Switching reloads the page. Pick "DEFAULT" to follow the env var
            again.
          </div>
        </div>
      )}
    </div>
  );
}

function Option({
  current,
  value,
  label,
  hint,
  disabled,
  onPick,
}: {
  current: ServerTargetChoice;
  value: ServerTargetChoice;
  label: string;
  hint?: string;
  disabled?: boolean;
  onPick: (c: ServerTargetChoice) => void;
}) {
  const isCurrent = current === value;
  return (
    <button
      onClick={() => !disabled && onPick(value)}
      disabled={disabled}
      className={`w-full text-left px-3 py-2 border-b border-slate-800 last:border-b-0 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent ${
        isCurrent ? 'bg-slate-800/60' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-slate-200 flex-1">{label}</span>
        {isCurrent && (
          <span className="text-[10px] text-emerald-300">selected</span>
        )}
      </div>
      {hint && (
        <div className="text-[11px] text-slate-500 mt-0.5 truncate font-mono">
          {hint}
        </div>
      )}
    </button>
  );
}
