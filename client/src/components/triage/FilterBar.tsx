import { useState } from 'react';
import type { FilterState, SortField, ViewMode } from './types';

interface Props {
  filters: FilterState;
  allAuthors: string[];
  allLabels: string[];
  totalResults: number;
  hiddenCount: number;
  setSearch: (s: string) => void;
  setViewMode: (v: ViewMode) => void;
  setSortField: (f: SortField) => void;
  toggleSort: () => void;
  setShowDrafts: (v: boolean) => void;
  setShowHidden: (v: boolean) => void;
  toggleAuthor: (a: string) => void;
  toggleLabel: (l: string) => void;
  setDateFrom: (d: string) => void;
  setDateTo: (d: string) => void;
  clearFilters: () => void;
}

export function FilterBar({
  filters,
  allAuthors,
  allLabels,
  totalResults,
  hiddenCount,
  setSearch,
  setViewMode,
  setSortField,
  toggleSort,
  setShowDrafts,
  setShowHidden,
  toggleAuthor,
  toggleLabel,
  setDateFrom,
  setDateTo,
  clearFilters,
}: Props) {
  const [showAuthors, setShowAuthors] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [authorSearch, setAuthorSearch] = useState('');
  const [labelSearch, setLabelSearch] = useState('');

  const viewModes: { value: ViewMode; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'issues', label: 'Issues' },
    { value: 'prs', label: 'PRs' },
  ];

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'updated', label: 'Updated' },
    { value: 'created', label: 'Created' },
    { value: 'comments', label: 'Comments' },
    { value: 'reactions', label: 'Reactions' },
    { value: 'staleness', label: 'Staleness' },
  ];

  const filteredAuthors = allAuthors.filter((a) =>
    a.toLowerCase().includes(authorSearch.toLowerCase()),
  );
  const filteredLabels = allLabels.filter((l) =>
    l.toLowerCase().includes(labelSearch.toLowerCase()),
  );

  const hasActiveFilters =
    filters.search ||
    filters.authors.length > 0 ||
    filters.labels.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    !filters.showDrafts;

  return (
    <div className="border-b border-[#30363d] bg-[#0d1117] px-6 py-3 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search issues & PRs..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-[#e6edf3] placeholder-[#484f58] focus:border-[#58a6ff] focus:outline-none"
          />
        </div>

        <div className="flex items-center border border-[#30363d] rounded-md overflow-hidden">
          {viewModes.map((vm) => (
            <button
              key={vm.value}
              onClick={() => setViewMode(vm.value)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                filters.viewMode === vm.value
                  ? 'bg-[#21262d] text-white'
                  : 'text-[#8b949e] hover:text-white'
              }`}
            >
              {vm.label}
            </button>
          ))}
        </div>

        <select
          value={filters.sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="bg-[#21262d] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-[#e6edf3] focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={toggleSort}
          className="px-2 py-1.5 border border-[#30363d] rounded-md text-sm text-[#8b949e] hover:text-white transition-colors"
          title={filters.sortDirection === 'desc' ? 'Descending' : 'Ascending'}
        >
          {filters.sortDirection === 'desc' ? '↓' : '↑'}
        </button>

        <span className="text-sm text-[#8b949e]">{totalResults} results</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <button
            onClick={() => {
              setShowAuthors(!showAuthors);
              setShowLabels(false);
            }}
            className={`px-3 py-1 text-xs border rounded-full transition-colors ${
              filters.authors.length > 0
                ? 'border-[#58a6ff] text-[#58a6ff] bg-[#58a6ff11]'
                : 'border-[#30363d] text-[#8b949e] hover:text-white'
            }`}
          >
            Authors
            {filters.authors.length > 0 ? ` (${filters.authors.length})` : ''}
          </button>
          {showAuthors && (
            <div className="absolute z-50 mt-1 w-64 bg-[#161b22] border border-[#30363d] rounded-md shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Filter authors..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none"
                  autoFocus
                />
              </div>
              {filteredAuthors.slice(0, 30).map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAuthor(a)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] ${
                    filters.authors.includes(a) ? 'text-[#58a6ff]' : 'text-[#e6edf3]'
                  }`}
                >
                  {filters.authors.includes(a) ? '✓ ' : '  '}
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowLabels(!showLabels);
              setShowAuthors(false);
            }}
            className={`px-3 py-1 text-xs border rounded-full transition-colors ${
              filters.labels.length > 0
                ? 'border-[#58a6ff] text-[#58a6ff] bg-[#58a6ff11]'
                : 'border-[#30363d] text-[#8b949e] hover:text-white'
            }`}
          >
            Labels
            {filters.labels.length > 0 ? ` (${filters.labels.length})` : ''}
          </button>
          {showLabels && (
            <div className="absolute z-50 mt-1 w-72 bg-[#161b22] border border-[#30363d] rounded-md shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Filter labels..."
                  value={labelSearch}
                  onChange={(e) => setLabelSearch(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-xs text-[#e6edf3] placeholder-[#484f58] focus:outline-none"
                  autoFocus
                />
              </div>
              {filteredLabels.slice(0, 30).map((l) => (
                <button
                  key={l}
                  onClick={() => toggleLabel(l)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#21262d] ${
                    filters.labels.includes(l) ? 'text-[#58a6ff]' : 'text-[#e6edf3]'
                  }`}
                >
                  {filters.labels.includes(l) ? '✓ ' : '  '}
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-2 py-1 text-xs text-[#8b949e] focus:outline-none"
          placeholder="From"
        />
        <span className="text-xs text-[#484f58]">to</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md px-2 py-1 text-xs text-[#8b949e] focus:outline-none"
          placeholder="To"
        />

        <label className="flex items-center gap-1 text-xs text-[#8b949e] cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showDrafts}
            onChange={(e) => setShowDrafts(e.target.checked)}
            className="accent-[#58a6ff]"
          />
          Drafts
        </label>

        <label
          className="flex items-center gap-1 text-xs text-[#8b949e] cursor-pointer"
          title="Show items you've hidden until the next sync"
        >
          <input
            type="checkbox"
            checked={filters.showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
            className="accent-[#d29922]"
          />
          Show hidden{hiddenCount > 0 ? ` (${hiddenCount})` : ''}
        </label>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-xs text-[#f85149] border border-[#f8514933] rounded-full hover:bg-[#f8514911] transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {(filters.authors.length > 0 || filters.labels.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {filters.authors.map((a) => (
            <span
              key={a}
              onClick={() => toggleAuthor(a)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#58a6ff22] text-[#58a6ff] rounded-full cursor-pointer hover:bg-[#58a6ff33]"
            >
              @{a} ×
            </span>
          ))}
          {filters.labels.map((l) => (
            <span
              key={l}
              onClick={() => toggleLabel(l)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#3fb95022] text-[#3fb950] rounded-full cursor-pointer hover:bg-[#3fb95033]"
            >
              {l} ×
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
