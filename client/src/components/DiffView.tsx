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
    <div className="overflow-hidden" style={{ border: '1px solid rgba(108, 230, 248, 0.22)' }}>
      <div
        className="px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest"
        style={{ background: 'rgba(2, 14, 20, 0.85)', borderBottom: '1px solid rgba(108, 230, 248, 0.18)' }}
      >
        <span className="truncate" style={{ color: '#aaf6ff' }}>&gt; {path}</span>
        <span className="flex items-center gap-2 shrink-0">
          {isNewFile && (
            <span style={{ color: '#aaf6ff' }}>NEW FILE</span>
          )}
          <span style={{ color: '#66f5c2' }}>+{totalAdd}</span>
          <span style={{ color: '#ff859a' }}>−{totalRm}</span>
        </span>
      </div>
      <pre
        className="text-[11px] leading-relaxed font-mono overflow-auto max-h-72"
        style={{ background: 'rgba(2, 14, 20, 0.85)' }}
      >
        {limited.map((l, i) => (
          <div
            key={i}
            style={{
              background:
                l.kind === 'add'
                  ? 'rgba(54, 227, 168, 0.18)'
                  : l.kind === 'remove'
                    ? 'rgba(255, 88, 116, 0.18)'
                    : 'transparent',
              color:
                l.kind === 'add'
                  ? '#a8ffe0'
                  : l.kind === 'remove'
                    ? '#ffb8c5'
                    : 'rgba(170, 246, 255, 0.7)',
            }}
          >
            <span className="inline-block w-10 pr-1 text-right select-none" style={{ color: 'rgba(108, 230, 248, 0.4)' }}>
              {l.oldNo ?? ''}
            </span>
            <span className="inline-block w-10 pr-1 text-right select-none" style={{ color: 'rgba(108, 230, 248, 0.4)' }}>
              {l.newNo ?? ''}
            </span>
            <span className="inline-block w-4 select-none" style={{ color: 'rgba(108, 230, 248, 0.55)' }}>
              {l.kind === 'add' ? '+' : l.kind === 'remove' ? '−' : ' '}
            </span>
            <span>{l.text || ' '}</span>
          </div>
        ))}
        {truncated > 0 && (
          <div className="italic px-3 py-1 holo-readout" style={{ color: 'rgba(108, 230, 248, 0.5)' }}>
            // ... {truncated} more lines
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
