import { useState } from 'react';
import { useFavorites, type FavoriteItem } from './FavoritesContext';
import type { GitHubPullRequest } from './types';
import { timeAgo, computeStaleness, labelColor } from './utils';

interface Props {
  onClose: () => void;
  onSelectItem: (item: FavoriteItem) => void;
}

function FavoriteRow({
  item,
  onRemove,
  onSelect,
}: {
  item: FavoriteItem;
  onRemove: () => void;
  onSelect: () => void;
}) {
  const isPR = item._kind === 'pr';
  const pr = isPR ? (item as GitHubPullRequest) : null;
  const staleness = computeStaleness(item);

  return (
    <div className="flex items-start gap-3 p-4 bg-[#020a0d] border border-[#0a2b37] rounded-lg hover:border-[#143a48] transition-colors group">
      <div className="flex-shrink-0 mt-0.5">
        {isPR ? (
          <span
            className={`text-base ${
              pr?.isDraft
                ? 'text-[#5395a8]'
                : pr?.reviewDecision === 'APPROVED'
                  ? 'text-[#36e3a8]'
                  : 'text-[#aaf6ff]'
            }`}
          >
            ↗
          </span>
        ) : (
          <span className="text-base text-[#36e3a8]">●</span>
        )}
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={onSelect}>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-[#cdf2fb] group-hover:text-[#aaf6ff] transition-colors">
            {item.title}
          </span>
          <span className="text-xs text-[#235e6f]">#{item.number}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-[#5395a8]">
          <span>@{item.author.login}</span>
          <span>updated {timeAgo(item.updatedAt)}</span>
          <span>staleness: {staleness}/100</span>
        </div>
        {item.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.labels.slice(0, 5).map((label) => {
              const colors = labelColor(label.color);
              return (
                <span
                  key={label.id}
                  className="px-1.5 py-0.5 text-[10px] rounded-full font-medium"
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
            {item.labels.length > 5 && (
              <span className="text-[10px] text-[#235e6f]">+{item.labels.length - 5} more</span>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onRemove}
        className="flex-shrink-0 text-[#235e6f] hover:text-[#ff5874] transition-colors p-1"
        title="Remove from favorites"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export function FavoritesPanel({ onClose, onSelectItem }: Props) {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const issueCount = favorites.filter((f) => f._kind === 'issue').length;
  const prCount = favorites.filter((f) => f._kind === 'pr').length;
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const showCopyFeedback = (msg: string) => {
    setCopyFeedback(msg);
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  const exportMarkdown = () => {
    const lines = favorites.map((f) => {
      const kind = f._kind === 'pr' ? 'PR' : 'Issue';
      return `- [${kind} #${f.number}](${f.url}) ${f.title} (by @${f.author.login})`;
    });
    const text = `## Favorites from Mastra OSS Triage\n\n${lines.join('\n')}`;
    navigator.clipboard.writeText(text);
    showCopyFeedback('Markdown copied!');
  };

  const exportUrls = () => {
    const text = favorites.map((f) => f.url).join('\n');
    navigator.clipboard.writeText(text);
    showCopyFeedback('URLs copied!');
  };

  const exportStandup = () => {
    const issues = favorites.filter((f) => f._kind === 'issue');
    const prs = favorites.filter((f) => f._kind === 'pr');
    const lines: string[] = [];
    if (issues.length > 0) {
      lines.push('**Issues:**');
      issues.forEach((f) => lines.push(`- [ ] #${f.number} ${f.title}`));
    }
    if (prs.length > 0) {
      if (lines.length > 0) lines.push('');
      lines.push('**PRs:**');
      prs.forEach((f) => lines.push(`- [ ] #${f.number} ${f.title}`));
    }
    navigator.clipboard.writeText(lines.join('\n'));
    showCopyFeedback('Standup checklist copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="w-[720px] max-w-full bg-[#020a0d] border-l border-[#143a48] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#143a48] bg-[#04141a]">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#aaf6ff" stroke="none">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            <div>
              <h2 className="text-lg font-semibold text-white">Favorites</h2>
              <p className="text-xs text-[#5395a8]">
                {favorites.length} item{favorites.length !== 1 ? 's' : ''}
                {issueCount > 0 && ` · ${issueCount} issue${issueCount !== 1 ? 's' : ''}`}
                {prCount > 0 && ` · ${prCount} PR${prCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#5395a8] hover:text-white text-xl leading-none">
            ×
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 border-b border-[#0a2b37] flex-wrap">
          <button
            onClick={exportMarkdown}
            disabled={favorites.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-xs text-[#cdf2fb] border border-[#143a48] rounded-md hover:bg-[#0a2b37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Markdown
          </button>
          <button
            onClick={exportUrls}
            disabled={favorites.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-xs text-[#cdf2fb] border border-[#143a48] rounded-md hover:bg-[#0a2b37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            URLs
          </button>
          <button
            onClick={exportStandup}
            disabled={favorites.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-xs text-[#cdf2fb] border border-[#143a48] rounded-md hover:bg-[#0a2b37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Standup
          </button>
          {copyFeedback && (
            <span className="text-xs text-[#36e3a8] animate-pulse">{copyFeedback}</span>
          )}
          <div className="flex-1" />
          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="text-xs text-[#ff5874] hover:text-[#ff859a] transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#143a48" strokeWidth="1" className="mx-auto mb-4">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              <p className="text-[#5395a8] text-sm">No favorites yet</p>
              <p className="text-[#235e6f] text-xs mt-1">
                Click the checkbox on any issue or PR to add it here
              </p>
            </div>
          ) : (
            favorites.map((item) => (
              <FavoriteRow
                key={`${item._kind}-${item.number}`}
                item={item}
                onRemove={() => removeFavorite(item._kind, item.number)}
                onSelect={() => onSelectItem(item)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
