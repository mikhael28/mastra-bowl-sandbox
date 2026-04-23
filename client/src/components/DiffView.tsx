import { useEffect, useMemo, useState } from 'react';
import { readWorkspaceFile } from '../lib/mastraClient';

/**
 * Tiny line-oriented diff renderer. Not a full `diff-match-patch` — this is a
 * first-approximation that lines up by hash and marks adds/removes. Good
 * enough to *visualize* what an agent is about to write so the human reviewer
 * can judge the approval button. Teaches that diff-before-approve is the
 * point of the `requireApproval` gate.
 */
interface Props {
  path: string;
  oldContent?: string;
  newContent: string;
  agentId?: string;
  /** If no oldContent was provided, try to fetch it from the workspace. */
  fetchOriginalIfMissing?: boolean;
  maxLines?: number;
}

type Line = {
  kind: 'context' | 'add' | 'remove';
  text: string;
  oldNo?: number;
  newNo?: number;
};

export function DiffView({
  path,
  oldContent,
  newContent,
  agentId,
  fetchOriginalIfMissing,
  maxLines = 80,
}: Props) {
  const [resolvedOld, setResolvedOld] = useState<string | undefined>(oldContent);
  const [loadingOriginal, setLoadingOriginal] = useState(false);

  useEffect(() => {
    if (!fetchOriginalIfMissing || oldContent !== undefined || !agentId) return;
    let alive = true;
    setLoadingOriginal(true);
    readWorkspaceFile(agentId, path).then((file) => {
      if (!alive) return;
      setResolvedOld(file?.content ?? '');
      setLoadingOriginal(false);
    });
    return () => {
      alive = false;
    };
  }, [agentId, path, fetchOriginalIfMissing, oldContent]);

  const lines = useMemo(
    () => computeDiff(resolvedOld ?? '', newContent ?? ''),
    [resolvedOld, newContent],
  );

  const limited = lines.slice(0, maxLines);
  const truncated = lines.length - limited.length;
  const totalAdd = lines.filter((l) => l.kind === 'add').length;
  const totalRm = lines.filter((l) => l.kind === 'remove').length;

  if (resolvedOld === undefined && loadingOriginal) {
    return <div className="text-[11px] text-slate-500 italic">resolving original…</div>;
  }

  const isNewFile = !resolvedOld;

  return (
    <div className="rounded border border-slate-800 overflow-hidden">
      <div className="px-2 py-1 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-400 truncate">{path}</span>
        <span className="flex items-center gap-2 shrink-0">
          {isNewFile && (
            <span className="text-indigo-300">new file</span>
          )}
          <span className="text-emerald-400">+{totalAdd}</span>
          <span className="text-rose-400">−{totalRm}</span>
        </span>
      </div>
      <pre className="bg-slate-950 text-[11px] leading-relaxed font-mono overflow-auto max-h-72">
        {limited.map((l, i) => (
          <div
            key={i}
            className={
              l.kind === 'add'
                ? 'bg-emerald-900/30 text-emerald-200'
                : l.kind === 'remove'
                  ? 'bg-rose-900/30 text-rose-200'
                  : 'text-slate-400'
            }
          >
            <span className="inline-block w-10 pr-1 text-right text-slate-600 select-none">
              {l.oldNo ?? ''}
            </span>
            <span className="inline-block w-10 pr-1 text-right text-slate-600 select-none">
              {l.newNo ?? ''}
            </span>
            <span className="inline-block w-4 text-slate-500 select-none">
              {l.kind === 'add' ? '+' : l.kind === 'remove' ? '−' : ' '}
            </span>
            <span>{l.text || ' '}</span>
          </div>
        ))}
        {truncated > 0 && (
          <div className="text-slate-500 italic px-3 py-1">
            … {truncated} more lines
          </div>
        )}
      </pre>
    </div>
  );
}

/**
 * Myers-lite LCS-based line diff. Runs in O(n·m) which is fine for the small
 * files workspace edits typically produce (≲ a few hundred lines).
 */
function computeDiff(oldText: string, newText: string): Line[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const m = oldLines.length;
  const n = newLines.length;

  // LCS DP table.
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (oldLines[i] === newLines[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out: Line[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (oldLines[i] === newLines[j]) {
      out.push({
        kind: 'context',
        text: oldLines[i],
        oldNo: i + 1,
        newNo: j + 1,
      });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: 'remove', text: oldLines[i], oldNo: i + 1 });
      i++;
    } else {
      out.push({ kind: 'add', text: newLines[j], newNo: j + 1 });
      j++;
    }
  }
  while (i < m) {
    out.push({ kind: 'remove', text: oldLines[i], oldNo: i + 1 });
    i++;
  }
  while (j < n) {
    out.push({ kind: 'add', text: newLines[j], newNo: j + 1 });
    j++;
  }
  return out;
}
