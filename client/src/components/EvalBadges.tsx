import { useEffect, useState } from 'react';
import { listScoresByRunId, ScoreRecord } from '../lib/mastraClient';
import { PrimitiveId } from '../lib/education';

/**
 * Shows the scorer results for a given `runId` as chips next to a finished
 * assistant message. Scores come from the Mastra evals pipeline
 * (answerRelevancy, toxicity, based) configured on openclaw-agent with
 * sampling rates of 10–20%. On most turns this returns [] — *that's a
 * teaching point*: evals don't run on every turn. When it does return data,
 * it's tangible proof that the agent's output is being independently judged.
 *
 * Endpoint: GET /api/scores/run/:runId
 */

interface Props {
  runId?: string;
  onTeach: (p: PrimitiveId) => void;
  /** Poll after stream finishes — scores are stored async, so give it a moment. */
  nonce?: number;
}

export function EvalBadges({ runId, onTeach, nonce = 0 }: Props) {
  const [scores, setScores] = useState<ScoreRecord[] | null>(null);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!runId) return;
    let alive = true;
    setAttempted(false);
    // Two-pass fetch: scores are written to storage after the stream finishes,
    // so give the server 1s before declaring "no samples this turn".
    const timers: number[] = [];
    async function fetchOnce() {
      const s = await listScoresByRunId(runId!);
      if (!alive) return;
      setScores(s);
      setAttempted(true);
    }
    fetchOnce();
    timers.push(window.setTimeout(() => void fetchOnce(), 1200));
    timers.push(window.setTimeout(() => void fetchOnce(), 3000));
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [runId, nonce]);

  if (!runId) return null;
  if (!attempted) return null;
  if (!scores || scores.length === 0) {
    return (
      <button
        onClick={() => onTeach('scorer')}
        className="text-[10px] text-slate-500 hover:text-slate-300 underline decoration-dotted"
        title="Scorers are sampled — most turns don't get scored. Click to learn."
      >
        no scorers sampled this turn
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {scores.map((s) => (
        <ScoreChip key={s.id} score={s} onTeach={onTeach} />
      ))}
    </div>
  );
}

function ScoreChip({
  score,
  onTeach,
}: {
  score: ScoreRecord;
  onTeach: (p: PrimitiveId) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const value = typeof score.score === 'number' ? score.score : null;
  const color =
    value == null
      ? 'bg-slate-800 text-slate-400 border-slate-700'
      : value >= 0.8 || value >= 8
        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
        : value >= 0.5 || value >= 5
          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          : 'bg-rose-500/15 text-rose-300 border-rose-500/30';

  const reason =
    score.generateReasonStepResult?.reason ??
    (score as any).reason ??
    (typeof (score as any).generateReasonStepResult === 'string'
      ? (score as any).generateReasonStepResult
      : null);

  const prettyValue =
    value == null ? '—' : value > 1 ? value.toFixed(1) : value.toFixed(2);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setExpanded((x) => !x)}
        className={`text-[10px] border rounded px-1.5 py-0.5 font-mono ${color} hover:brightness-125`}
        title={`${score.scorerId} — click for details`}
      >
        {score.scorerId.replace(/-scorer$/i, '')} {prettyValue}
      </button>
      {expanded && (
        <div className="absolute bottom-full mb-1 right-0 z-30 w-64 p-2 rounded border border-slate-700 bg-slate-950 shadow-xl text-[11px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-slate-200 truncate flex-1">
              {score.scorerId}
            </span>
            <span className={`font-mono ${color} border rounded px-1`}>
              {prettyValue}
            </span>
          </div>
          {reason && (
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {reason}
            </div>
          )}
          {!reason && (
            <div className="text-slate-500 italic">no reason recorded</div>
          )}
          <button
            onClick={() => onTeach('scorer')}
            className="mt-2 text-[10px] text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
          >
            what is a scorer?
          </button>
        </div>
      )}
    </div>
  );
}
