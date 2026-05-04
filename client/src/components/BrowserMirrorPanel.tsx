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
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Pick an agent to mirror its browser.
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
    <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
      <header className="border-b border-slate-800 p-3 flex items-center gap-3 flex-wrap">
        <h2 className="font-semibold text-sm">Browser mirror</h2>
        <PrimitiveBadge primitive="browser" onTeach={onTeach} compact />
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          {status === 'live' && (
            <span>
              live • {frameCount} frame{frameCount === 1 ? '' : 's'}
              {frame?.viewport &&
                ` • ${frame.viewport.width}×${frame.viewport.height}`}
            </span>
          )}
          {status === 'connecting' && <span>connecting…</span>}
          {status === 'inactive' && (
            <span>
              browser idle — frames will stream when the agent uses Stagehand
            </span>
          )}
          {status === 'error' && <span>error: {errMsg ?? 'unknown'}</span>}
          {status === 'closed' && <span>connection closed</span>}
        </div>
        {currentUrl && (
          <div className="ml-auto text-[11px] font-mono text-slate-500 truncate max-w-[40%]">
            {currentUrl}
          </div>
        )}
      </header>

      <div className="flex-1 min-h-0 overflow-auto p-4 flex items-start justify-center">
        {status === 'live' && frame ? (
          <img
            alt="browser mirror"
            src={`data:image/jpeg;base64,${frame.data}`}
            className="max-w-full max-h-full rounded shadow-lg border border-slate-800"
            style={{ imageRendering: 'auto' }}
          />
        ) : (
          <div className="text-slate-500 text-sm max-w-md text-center mt-16">
            <div className="text-slate-300 mb-2">
              {status === 'inactive'
                ? 'No active browser session yet.'
                : status === 'connecting'
                  ? 'Connecting…'
                  : status === 'error'
                    ? 'Connection failed.'
                    : 'Stream closed.'}
            </div>
            {status === 'inactive' && (
              <div className="text-xs">
                Ask the agent to open a page in the chat, e.g.
                <span className="block mt-2 font-mono text-slate-400">
                  "open mastra.ai and tell me what's on the homepage"
                </span>
              </div>
            )}
            {errMsg && (
              <pre className="text-xs text-rose-300 mt-3 whitespace-pre-wrap">
                {errMsg}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
