import { useState, useEffect, useRef } from 'react';
import type { GitHubIssue, GitHubPullRequest } from './types';
import { useTriageData } from './useTriageData';
import { useFilters } from './useFilters';
import { getAllAuthors, getAllLabels } from './utils';
import { FavoritesProvider, type FavoriteItem } from './FavoritesContext';
import { StatsBar } from './StatsBar';
import { FilterBar } from './FilterBar';
import { ItemRow } from './ItemRow';
import { DetailPanel } from './DetailPanel';
import { FavoritesBar } from './FavoritesBar';
import { FavoritesPanel } from './FavoritesPanel';
import { AIChatPanel } from './AIChatPanel';

type SelectedItem =
  | ((GitHubIssue | GitHubPullRequest) & { _kind: 'issue' | 'pr' })
  | null;

function TriagePanelInner() {
  const {
    issues,
    pullRequests,
    metadata,
    analysis,
    triage,
    loading,
    error,
    setHidden,
    reload,
  } = useTriageData();
  const {
    filters,
    filtered,
    setSearch,
    setViewMode,
    setSortField,
    toggleSort,
    setShowDrafts,
    setShowHidden,
    setDateFrom,
    setDateTo,
    toggleAuthor,
    toggleLabel,
    clearFilters,
  } = useFilters(issues, pullRequests);

  const hiddenCount =
    issues.filter((i) => i.hidden).length +
    pullRequests.filter((p) => p.hidden).length;

  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const allAuthors = getAllAuthors(issues, pullRequests);
  const allLabels = getAllLabels(issues, pullRequests);

  const handleToggleHidden = (
    kind: 'issue' | 'pr',
    number: number,
    hidden: boolean,
  ) => {
    setHidden(kind, number, hidden);
    setSelectedItem((prev) =>
      prev && prev._kind === kind && prev.number === number
        ? ({ ...prev, hidden: hidden || undefined } as typeof prev)
        : prev,
    );
  };

  // Keyboard navigation: j/k/Arrow + Enter to open, Escape to close.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'Escape':
          if (selectedItem) {
            setSelectedItem(null);
            e.preventDefault();
          } else if (showFavorites) {
            setShowFavorites(false);
            e.preventDefault();
          } else if (showAIChat) {
            setShowAIChat(false);
            e.preventDefault();
          }
          break;
        case 'j':
        case 'ArrowDown':
          if (!selectedItem && filtered.length > 0) {
            e.preventDefault();
            setFocusedIndex((prev) => {
              const next = Math.min(prev + 1, filtered.length - 1);
              const rows = listRef.current?.children;
              if (rows?.[next])
                (rows[next] as HTMLElement).scrollIntoView({ block: 'nearest' });
              return next;
            });
          }
          break;
        case 'k':
        case 'ArrowUp':
          if (!selectedItem && filtered.length > 0) {
            e.preventDefault();
            setFocusedIndex((prev) => {
              const next = Math.max(prev - 1, 0);
              const rows = listRef.current?.children;
              if (rows?.[next])
                (rows[next] as HTMLElement).scrollIntoView({ block: 'nearest' });
              return next;
            });
          }
          break;
        case 'Enter':
          if (!selectedItem && focusedIndex >= 0 && focusedIndex < filtered.length) {
            e.preventDefault();
            setSelectedItem(filtered[focusedIndex]);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, showFavorites, showAIChat, filtered, focusedIndex]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [filtered]);

  const handleSelectFromFavorites = (item: FavoriteItem) => {
    setSelectedItem(item);
    setShowFavorites(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-[#58a6ff] mb-2">Loading…</div>
          <div className="text-sm text-[#8b949e]">Fetching triage data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="text-2xl text-[#f85149] mb-2">Error</div>
          <div className="text-sm text-[#8b949e] mb-4">{error}</div>
          <pre className="text-xs text-[#8b949e] bg-[#161b22] rounded p-4 text-left">
            # Refresh data via the workflow:{'\n'}
            # 1. Open the Workflows tab{'\n'}
            # 2. Run "triage-workflow"{'\n'}
            # 3. Click the button below to reload
          </pre>
          <button
            onClick={() => reload()}
            className="mt-4 px-4 py-2 text-sm bg-[#238636] text-white rounded-md hover:bg-[#2ea043]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 relative bg-[#0d1117]">
      <StatsBar issues={issues} prs={pullRequests} metadata={metadata} />
      <FilterBar
        filters={filters}
        allAuthors={allAuthors}
        allLabels={allLabels}
        totalResults={filtered.length}
        hiddenCount={hiddenCount}
        setSearch={setSearch}
        setViewMode={setViewMode}
        setSortField={setSortField}
        toggleSort={toggleSort}
        setShowDrafts={setShowDrafts}
        setShowHidden={setShowHidden}
        toggleAuthor={toggleAuthor}
        toggleLabel={toggleLabel}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
        clearFilters={clearFilters}
      />

      <div className="flex-1 overflow-y-auto" ref={listRef}>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#8b949e]">
            No items match your filters
          </div>
        ) : (
          filtered.map((item, idx) => (
            <ItemRow
              key={`${item._kind}-${item.number}`}
              item={item}
              onClick={() => setSelectedItem(item)}
              searchQuery={filters.search}
              isFocused={idx === focusedIndex}
              triage={triage}
              onToggleHidden={handleToggleHidden}
            />
          ))
        )}
      </div>

      <FavoritesBar onOpen={() => setShowFavorites(true)} />

      {selectedItem && (
        <DetailPanel
          item={selectedItem}
          analysis={analysis}
          triage={triage}
          allIssues={issues}
          allPRs={pullRequests}
          onClose={() => setSelectedItem(null)}
          onToggleHidden={handleToggleHidden}
        />
      )}

      {showFavorites && (
        <FavoritesPanel
          onClose={() => setShowFavorites(false)}
          onOpenChat={() => {
            setShowFavorites(false);
            setShowAIChat(true);
          }}
          onSelectItem={handleSelectFromFavorites}
        />
      )}

      {showAIChat && <AIChatPanel onClose={() => setShowAIChat(false)} />}
    </div>
  );
}

export function TriagePanel() {
  return (
    <FavoritesProvider>
      <TriagePanelInner />
    </FavoritesProvider>
  );
}
