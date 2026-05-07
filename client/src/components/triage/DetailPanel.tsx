import { useRef, useCallback, useState } from 'react';
import type {
  GitHubIssue,
  GitHubPullRequest,
  AnalysisResult,
  TriageResult,
} from './types';
import {
  formatDate,
  timeAgo,
  computeStaleness,
  getCommentCount,
  getReactionCount,
  labelColor,
} from './utils';
import { useFavorites } from './FavoritesContext';

interface Props {
  item: (GitHubIssue | GitHubPullRequest) & { _kind: 'issue' | 'pr' };
  analysis: AnalysisResult | null;
  triage: TriageResult | null;
  allIssues: GitHubIssue[];
  allPRs: GitHubPullRequest[];
  onClose: () => void;
  onToggleHidden: (kind: 'issue' | 'pr', number: number, hidden: boolean) => void;
  onAskCopilot?: () => void;
}

export function DetailPanel({
  item,
  analysis,
  triage,
  allIssues,
  allPRs,
  onClose,
  onToggleHidden,
  onAskCopilot,
}: Props) {
  const isPR = item._kind === 'pr';
  const pr = isPR ? (item as GitHubPullRequest) : null;
  const staleness = computeStaleness(item);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(item._kind, item.number);
  const isHidden = !!item.hidden;
  const [descCollapsed, setDescCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const issueAnalysis = analysis?.issueAnalyses.find((a) => a.issueNumber === item.number);
  const prAnalysis = analysis?.prAnalyses.find((a) => a.prNumber === item.number);
  const itemAnalysis = isPR ? prAnalysis : issueAnalysis;

  const triageAssignment = triage?.assignments.find(
    (a) => a.itemNumber === item.number && a.itemType === item._kind,
  );

  const linkedPRs = isPR
    ? analysis?.prIssueLinks
        .filter((l) => l.prNumber === item.number)
        .map((l) => ({ ...l, issue: allIssues.find((i) => i.number === l.issueNumber) }))
    : analysis?.prIssueLinks
        .filter((l) => l.issueNumber === item.number)
        .map((l) => ({ ...l, pr: allPRs.find((p) => p.number === l.prNumber) }));

  const panelRef = useRef<HTMLDivElement>(null);
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex" onWheel={handleWheel}>
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={panelRef}
        className="w-[1100px] max-w-[85vw] bg-[#020a0d] border-l border-[#143a48] overflow-y-auto"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="sticky top-0 z-10 bg-[#04141a] border-b border-[#143a48] px-8 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={isPR ? 'text-[#aaf6ff] text-lg' : 'text-[#36e3a8] text-lg'}>
                  {isPR ? '↗' : '●'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`#${item.number}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="text-sm text-[#5395a8] hover:text-[#aaf6ff] transition-colors cursor-pointer"
                  title="Click to copy"
                >
                  {copied ? 'Copied!' : `#${item.number}`}
                </button>
                {pr?.isDraft && (
                  <span className="px-1.5 py-0.5 text-[10px] border border-[#143a48] text-[#5395a8] rounded-full">
                    Draft
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-white mt-1.5 leading-snug">
                {item.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {onAskCopilot && (
                <button
                  onClick={onAskCopilot}
                  className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-md border border-[#ec88f544] bg-[#ec88f515] text-[#ec88f5] hover:bg-[#ec88f522] hover:border-[#ec88f5] transition-all text-xs font-semibold"
                  title="Ask the copilot about this item"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Ask copilot
                </button>
              )}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md border border-[#143a48] text-[#235e6f] hover:text-[#aaf6ff] hover:border-[#aaf6ff] transition-all"
                title="View on GitHub"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
              <button
                onClick={() => toggleFavorite(item)}
                className={`p-2 rounded-md border transition-all ${
                  favorited
                    ? 'bg-[#aaf6ff22] border-[#aaf6ff] text-[#aaf6ff]'
                    : 'border-[#143a48] text-[#235e6f] hover:text-[#aaf6ff] hover:border-[#aaf6ff]'
                }`}
                title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={favorited ? '#aaf6ff' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              </button>
              <button
                onClick={() => onToggleHidden(item._kind, item.number, !isHidden)}
                className={`p-2 rounded-md border transition-all ${
                  isHidden
                    ? 'bg-[#ffb84d22] border-[#ffb84d] text-[#ffb84d]'
                    : 'border-[#143a48] text-[#235e6f] hover:text-[#ffb84d] hover:border-[#ffb84d]'
                }`}
                title={isHidden ? 'Unhide' : 'Hide until next sync'}
              >
                {isHidden ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 1l22 22" />
                    <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
              <button onClick={onClose} className="p-2 text-[#5395a8] hover:text-white text-xl leading-none">
                ×
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 mt-3 text-sm text-[#5395a8]">
            <span>@{item.author.login}</span>
            <span>Created {formatDate(item.createdAt)}</span>
            <span>Updated {timeAgo(item.updatedAt)}</span>
            <span>Comments: {getCommentCount(item)}</span>
            <span>Reactions: {getReactionCount(item)}</span>
            {isPR && pr && (
              <>
                <span className="text-[#36e3a8]">+{pr.additions}</span>
                <span className="text-[#ff5874]">-{pr.deletions}</span>
                <span>{pr.changedFiles} files</span>
              </>
            )}
          </div>
        </div>

        <div className="px-8 py-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-[#5395a8] uppercase tracking-wider">
                Staleness
              </span>
              <div className="w-24 h-1.5 bg-[#0a2b37] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    staleness > 75
                      ? 'bg-red-500'
                      : staleness > 50
                        ? 'bg-orange-400'
                        : staleness > 25
                          ? 'bg-yellow-400'
                          : 'bg-green-500'
                  }`}
                  style={{ width: `${staleness}%` }}
                />
              </div>
              <span className="text-xs font-mono text-[#5395a8]">{staleness}</span>
            </div>

            {(item.labels.length > 0 || item.assignees.length > 0) && (
              <span className="text-[#143a48]">|</span>
            )}

            {item.labels.map((label) => {
              const colors = labelColor(label.color);
              return (
                <span
                  key={label.id}
                  className="px-2 py-0.5 text-[10px] rounded-full font-medium leading-tight"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.text}33`,
                  }}
                >
                  {label.name}
                </span>
              );
            })}

            {item.assignees.map((a) => (
              <span
                key={a.login}
                className="px-2 py-0.5 text-[10px] bg-[#0a2b37] text-[#cdf2fb] rounded"
              >
                @{a.login}
              </span>
            ))}
          </div>

          {(itemAnalysis || (linkedPRs && linkedPRs.length > 0) || (isPR && pr)) && (
            <div className="flex flex-wrap gap-4">
              {itemAnalysis && (
                <div className="flex-1 min-w-[280px] bg-[#04141a] border border-[#143a48] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-[10px] font-semibold text-[#ec88f5] uppercase tracking-wider">
                      AI Analysis
                    </h3>
                    {'category' in itemAnalysis && (
                      <>
                        <span className="px-1.5 py-0.5 text-[10px] bg-[#ec88f522] text-[#ec88f5] rounded-full">
                          {itemAnalysis.category}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] bg-[#ffb84d22] text-[#ffb84d] rounded-full">
                          {itemAnalysis.priority}
                        </span>
                      </>
                    )}
                    {'riskLevel' in itemAnalysis && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                          itemAnalysis.riskLevel === 'high'
                            ? 'bg-[#ff587422] text-[#ff5874]'
                            : itemAnalysis.riskLevel === 'medium'
                              ? 'bg-[#ffb84d22] text-[#ffb84d]'
                              : 'bg-[#36e3a822] text-[#36e3a8]'
                        }`}
                      >
                        Risk: {itemAnalysis.riskLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#cdf2fb] leading-relaxed">{itemAnalysis.summary}</p>
                </div>
              )}

              {isPR && pr && (
                <div className="flex-1 min-w-[280px]">
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-[#04141a] rounded p-2">
                      <span className="text-[#5395a8]">Branch:</span>{' '}
                      <span className="text-[#cdf2fb] font-mono">{pr.headRefName}</span>
                    </div>
                    <div className="bg-[#04141a] rounded p-2">
                      <span className="text-[#5395a8]">Base:</span>{' '}
                      <span className="text-[#cdf2fb] font-mono">{pr.baseRefName}</span>
                    </div>
                    <div className="bg-[#04141a] rounded p-2">
                      <span className="text-[#5395a8]">Review:</span>{' '}
                      <span
                        className={
                          pr.reviewDecision === 'APPROVED'
                            ? 'text-[#36e3a8]'
                            : pr.reviewDecision === 'CHANGES_REQUESTED'
                              ? 'text-[#ff5874]'
                              : 'text-[#ffb84d]'
                        }
                      >
                        {pr.reviewDecision || 'Pending'}
                      </span>
                    </div>
                    <div className="bg-[#04141a] rounded p-2">
                      <span className="text-[#5395a8]">Mergeable:</span>{' '}
                      <span className="text-[#cdf2fb]">{pr.mergeable || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {triageAssignment && triageAssignment.assignedDevelopers.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold text-[#5395a8] uppercase tracking-wider mb-1.5">
                Suggested Experts
              </h3>
              <div className="flex flex-wrap gap-3">
                {triageAssignment.assignedDevelopers.map((dev) => (
                  <div
                    key={dev.name}
                    className="flex-1 min-w-[220px] bg-[#04141a] border border-[#143a48] rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[#cdf2fb]">{dev.name}</span>
                      <span className="text-[10px] text-[#5395a8] font-mono">({dev.score})</span>
                    </div>
                    <p className="text-[11px] text-[#5395a8] mb-1.5">{dev.role}</p>
                    <div className="flex flex-wrap gap-1">
                      {dev.matchedTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-[10px] bg-[#88efff22] text-[#88efff] rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {linkedPRs && linkedPRs.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold text-[#5395a8] uppercase tracking-wider mb-1.5">
                {isPR ? 'Linked Issues' : 'Linked PRs'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {linkedPRs.map((link, i) => {
                  const linked = isPR
                    ? 'issue' in link
                      ? link.issue
                      : null
                    : 'pr' in link
                      ? link.pr
                      : null;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-[#04141a] border border-[#143a48] rounded px-2.5 py-1.5 text-xs"
                    >
                      <span className={isPR ? 'text-[#36e3a8]' : 'text-[#aaf6ff]'}>
                        #{isPR ? link.issueNumber : link.prNumber}
                      </span>
                      <span className="text-[#cdf2fb]">{linked?.title || 'Unknown'}</span>
                      <span className="text-[#5395a8]">{Math.round(link.confidence * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-[#5395a8] uppercase tracking-wider">
                  Description
                </h3>
                {item.body && item.body.length > 300 && (
                  <button
                    onClick={() => setDescCollapsed((c) => !c)}
                    className="text-[10px] text-[#aaf6ff] hover:underline"
                  >
                    {descCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                )}
              </div>
              <div
                className={`bg-[#04141a] border border-[#0a2b37] rounded-lg p-5 text-sm text-[#cdf2fb] whitespace-pre-wrap break-words overflow-y-auto leading-relaxed transition-all ${
                  descCollapsed ? 'max-h-[100px]' : 'max-h-[600px]'
                }`}
              >
                {item.body || 'No description provided.'}
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-[#5395a8] uppercase tracking-wider mb-2">
                Comments ({item.comments?.length || 0})
              </h3>
              {item.comments && item.comments.length > 0 ? (
                <div className="space-y-3 overflow-y-auto max-h-[600px]">
                  {item.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-[#04141a] border border-[#0a2b37] rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-[#cdf2fb]">
                          @{comment.author?.login || 'unknown'}
                        </span>
                        <span className="text-xs text-[#235e6f]">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#5395a8] whitespace-pre-wrap break-words leading-relaxed">
                        {comment.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#04141a] border border-[#0a2b37] rounded-lg p-5 text-sm text-[#235e6f]">
                  No comments yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#0a2b37]">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#aaf6ff] hover:underline"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              View on GitHub →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
