import { useEffect, useRef, useState } from 'react';
import { AgentSummary, apiUrl } from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';
import { PrimitiveBadge } from './PrimitiveBadge';

interface Props {
  agent: AgentSummary | null;
  onTeach: (id: PrimitiveId) => void;
}

type MirrorStatus = 'connecting' | 'inactive' | 'live' | 'error' | 'closed';

type Frame = {
  data: string; // base64 jpeg
  viewport?: { width: number; height: number };
  timestamp?: number;
};

/**
 * Live mirror of the agent's StagehandBrowser via the /browser-mirror SSE
 * route. The server attaches a CDP screencast and forwards each jpeg frame.
 * Frames stop when the browser is idle — we surface that as an "inactive"
 * placeholder rather than blanking out, so it's clear the connection is up
 * and waiting.
 */
export function BrowserMirrorPanel({ agent, onTeach }: Props) {
  const [status, setStatus] = useState<MirrorStatus>('connecting');
  const [frame, setFrame] = useState<Frame | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const lastFrameAtRef = useRef<number>(0);

  useEffect(() => {
    if (!agent) return;
    setStatus('connecting');
    setFrame(null);
    setCurrentUrl(null);
    setErrMsg(null);
    setFrameCount(0);

    const es = new EventSource(apiUrl(`/browser-mirror/${agent.id}`));

    es.onopen = () => {
      setStatus((s) => (s === 'connecting' ? 'inactive' : s));
    };

    es.onmessage = (ev) => {
      let payload: any;
      try {
        payload = JSON.parse(ev.data);
      } catch {
        return;
      }
      switch (payload.type) {
        case 'open':
          // initial ack — keep "connecting" until we know if browser is live
          break;
        case 'attached':
          setStatus('live');
          break;
        case 'inactive':
          setStatus('inactive');
          break;
        case 'frame':
          lastFrameAtRef.current = Date.now();
          setStatus('live');
          setFrame({
            data: payload.data,
            viewport: payload.viewport,
            timestamp: payload.timestamp,
          });
          setFrameCount((n) => n + 1);
          break;
        case 'url':
          setCurrentUrl(payload.url ?? null);
          break;
        case 'error':
          setErrMsg(String(payload.message ?? 'unknown'));
          setStatus('error');
          break;
        default:
          break;
      }
    };

    es.onerror = () => {
      setStatus((s) => (s === 'live' ? 'closed' : 'error'));
    };

    return () => {
      es.close();
      setStatus('closed');
    };
  }, [agent?.id]);

  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center scan-lines">
        <div className="holo-frame px-8 py-6 holo-corners">
          <div className="holo-eyebrow mb-2">// AWAITING SELECTION</div>
          <div className="holo-title text-base">Select an agent</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(108, 230, 248, 0.6)' }}>
            Pick an agent to mirror its browser.
          </div>
        </div>
      </div>
    );
  }

  const dot =
    status === 'live'
      ? 'bg-emerald-400 animate-pulse'
      : status === 'connecting'
        ? 'bg-amber-400 animate-pulse'
        : status === 'error'
          ? 'bg-rose-400'
          : status === 'closed'
            ? 'bg-slate-500'
            : 'bg-slate-500';

  return (
    <div className="flex-1 flex flex-col min-w-0 scan-lines">
      <header
        className="p-3 flex items-center gap-3 flex-wrap"
        style={{
          borderBottom: '1px solid rgba(108, 230, 248, 0.22)',
          background: 'linear-gradient(180deg, rgba(4, 30, 38, 0.5), rgba(2, 14, 20, 0.25))',
        }}
      >
        <div>
          <div className="holo-eyebrow">// MODULE 06</div>
          <h2 className="holo-title text-base mt-0.5">BROWSER MIRROR</h2>
        </div>
        <PrimitiveBadge primitive="browser" onTeach={onTeach} compact />
        <div className="flex items-center gap-2 text-xs holo-readout" style={{ color: 'rgba(170, 246, 255, 0.7)' }}>
          <span className={`w-2 h-2 rounded-full ${dot}`} style={{ boxShadow: '0 0 4px currentColor' }} />
          {status === 'live' && (
            <span className="uppercase tracking-widest">
              ▸ LIVE · {frameCount} FRAME{frameCount === 1 ? '' : 'S'}
              {frame?.viewport &&
                ` · ${frame.viewport.width}×${frame.viewport.height}`}
            </span>
          )}
          {status === 'connecting' && <span className="uppercase tracking-widest">◌ CONNECTING...</span>}
          {status === 'inactive' && (
            <span className="uppercase tracking-widest">
              ◇ IDLE — frames stream when agent uses Stagehand
            </span>
          )}
          {status === 'error' && <span className="uppercase tracking-widest glow-red" style={{ color: '#ff859a' }}>⚠ ERROR: {errMsg ?? 'unknown'}</span>}
          {status === 'closed' && <span className="uppercase tracking-widest">◼ CONNECTION CLOSED</span>}
        </div>
        {currentUrl && (
          <div className="ml-auto text-[11px] font-mono truncate max-w-[40%]" style={{ color: '#aaf6ff' }}>
            &gt; {currentUrl}
          </div>
        )}
      </header>

      <div className="flex-1 min-h-0 overflow-auto p-4 flex items-start justify-center">
        {status === 'live' && frame ? (
          <img
            alt="browser mirror"
            src={`data:image/jpeg;base64,${frame.data}`}
            className="max-w-full max-h-full"
            style={{
              imageRendering: 'auto',
              border: '1px solid rgba(108, 230, 248, 0.4)',
              boxShadow: '0 0 24px rgba(108, 230, 248, 0.18)',
            }}
          />
        ) : (
          <div className="text-sm max-w-md text-center mt-16">
            <div className="holo-title text-base mb-2">
              {status === 'inactive'
                ? '◇ NO ACTIVE SESSION'
                : status === 'connecting'
                  ? '◌ CONNECTING'
                  : status === 'error'
                    ? '⚠ CONNECTION FAILED'
                    : '◼ STREAM CLOSED'}
            </div>
            {status === 'inactive' && (
              <div className="text-xs holo-readout" style={{ color: 'rgba(108, 230, 248, 0.7)' }}>
                // Ask the agent to open a page, e.g.
                <span className="block mt-2 font-mono" style={{ color: '#aaf6ff' }}>
                  "open mastra.ai and tell me what's on the homepage"
                </span>
              </div>
            )}
            {errMsg && (
              <pre className="text-xs glow-red mt-3 whitespace-pre-wrap" style={{ color: '#ff859a' }}>
                {errMsg}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
