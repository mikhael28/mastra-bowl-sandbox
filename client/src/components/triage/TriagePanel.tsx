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
import { CopilotSidebar, type CopilotSidebarHandle } from './CopilotSidebar';
import { ContextMenu } from './ContextMenu';

type SelectedItem =
  | ((GitHubIssue | GitHubPullRequest) & { _kind: 'issue' | 'pr' })
  | null;

const COPILOT_COLLAPSED_KEY = 'mastra-triage-copilot-collapsed';

function loadCopilotCollapsed(): boolean {
  try {
    return localStorage.getItem(COPILOT_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

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
  const [copilotCollapsed, setCopilotCollapsed] = useState(loadCopilotCollapsed);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: (GitHubIssue | GitHubPullRequest) & { _kind: 'issue' | 'pr' };
  } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const copilotRef = useRef<CopilotSidebarHandle | null>(null);

  const allAuthors = getAllAuthors(issues, pullRequests);
  const allLabels = getAllLabels(issues, pullRequests);

  useEffect(() => {
    try {
      localStorage.setItem(COPILOT_COLLAPSED_KEY, copilotCollapsed ? '1' : '0');
    } catch {
      /* private mode etc. */
    }
  }, [copilotCollapsed]);

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

  // Pull a specific issue/PR into the copilot's context — same prompt the
  // DetailPanel "Ask copilot" button and the right-click context menu fire.
  const askCopilotAboutItem = (
    item: GitHubIssue | GitHubPullRequest,
    kind: 'issue' | 'pr',
  ) => {
    const verb = kind === 'pr' ? 'PR' : 'issue';
    copilotRef.current?.runPrompt(
      `Look up ${verb} #${item.number} via triage-lookup-item and tell me: what is it really about, who should own it, what's the next action, and is there a related item I should know about?`,
      {
        workflowId: `lookup-${kind}-${item.number}`,
        workflowTitle: `Brief: #${item.number}`,
        accent: kind === 'pr' ? 'blue' : 'green',
      },
    );
  };

  // Ask the copilot to add an issue/PR to the workspace todo list. The agent
  // owns the todoAdd tool, so we hand it the title + URL and let it format
  // the entry — keeping todo prose consistent with how the agent writes them
  // unprompted.
  const askCopilotToAddTodo = (
    item: GitHubIssue | GitHubPullRequest,
    kind: 'issue' | 'pr',
  ) => {
    const verb = kind === 'pr' ? 'PR' : 'Issue';
    copilotRef.current?.runPrompt(
      `Add ${verb} #${item.number} to my workspace todo list using the todoAdd tool. Title: "${item.title}". URL: ${item.url}. Use a concise todo entry that includes the number, a short description, and the URL so I can follow up on it later. Confirm once it's added.`,
      {
        workflowId: `todo-add-${kind}-${item.number}`,
        workflowTitle: `Add #${item.number} to todo`,
        accent: 'purple',
      },
    );
  };

  // Keyboard navigation: j/k/Arrow + Enter to open, Escape to close,
  // c to toggle the copilot sidebar.
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
          }
          break;
        case 'c':
          if (!selectedItem && !showFavorites) {
            e.preventDefault();
            setCopilotCollapsed((c) => !c);
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
  }, [selectedItem, showFavorites, filtered, focusedIndex]);

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
          <div className="text-2xl text-[#aaf6ff] mb-2">Loading…</div>
          <div className="text-sm text-[#5395a8]">Fetching triage data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="text-2xl text-[#ff5874] mb-2">Error</div>
          <div className="text-sm text-[#5395a8] mb-4">{error}</div>
          <pre className="text-xs text-[#5395a8] bg-[#04141a] rounded p-4 text-left">
            # Refresh data via the workflow:{'\n'}
            # 1. Open the Workflows tab{'\n'}
            # 2. Run "triage-workflow"{'\n'}
            # 3. Click the button below to reload
          </pre>
          <button
            onClick={() => reload()}
            className="mt-4 px-4 py-2 text-sm bg-[#08a872] text-white rounded-md hover:bg-[#14c98a]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-w-0 bg-[#020a0d]">
      <div className="flex-1 flex flex-col min-w-0 relative">
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
            <div className="text-center py-12 text-[#5395a8]">
              No items match your filters
            </div>
          ) : (
            filtered.map((item, idx) => (
              <ItemRow
                key={`${item._kind}-${item.number}`}
                item={item}
                onClick={() => setSelectedItem(item)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, item });
                }}
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
            onAskCopilot={() => {
              askCopilotAboutItem(selectedItem, selectedItem._kind);
              setSelectedItem(null);
            }}
          />
        )}

        {showFavorites && (
          <FavoritesPanel
            onClose={() => setShowFavorites(false)}
            onSelectItem={handleSelectFromFavorites}
          />
        )}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            header={`#${contextMenu.item.number} · ${contextMenu.item._kind === 'pr' ? 'Pull request' : 'Issue'}`}
            onClose={() => setContextMenu(null)}
            items={[
              {
                id: 'ask-copilot',
                label: 'Ask Copilot',
                description: 'Pull this item into the triage chat',
                accent: 'purple',
                icon: (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                ),
                onClick: () =>
                  askCopilotAboutItem(contextMenu.item, contextMenu.item._kind),
              },
              {
                id: 'add-todo',
                label: 'Add to todo list',
                description: 'Save to workspace/todo.json via the copilot',
                accent: 'blue',
                icon: (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                ),
                onClick: () =>
                  askCopilotToAddTodo(contextMenu.item, contextMenu.item._kind),
              },
            ]}
          />
        )}
      </div>

      <CopilotSidebar
        ref={copilotRef}
        collapsed={copilotCollapsed}
        onToggleCollapsed={() => setCopilotCollapsed((c) => !c)}
      />
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
