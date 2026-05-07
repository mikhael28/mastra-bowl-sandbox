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
    <div className="border-b border-[#143a48] bg-[#020a0d] px-6 py-3 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search issues & PRs..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#020a0d] border border-[#143a48] rounded-md px-3 py-1.5 text-sm text-[#cdf2fb] placeholder-[#235e6f] focus:border-[#aaf6ff] focus:outline-none"
          />
        </div>

        <div className="flex items-center border border-[#143a48] rounded-md overflow-hidden">
          {viewModes.map((vm) => (
            <button
              key={vm.value}
              onClick={() => setViewMode(vm.value)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                filters.viewMode === vm.value
                  ? 'bg-[#0a2b37] text-white'
                  : 'text-[#5395a8] hover:text-white'
              }`}
            >
              {vm.label}
            </button>
          ))}
        </div>

        <select
          value={filters.sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="bg-[#0a2b37] border border-[#143a48] rounded-md px-3 py-1.5 text-sm text-[#cdf2fb] focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={toggleSort}
          className="px-2 py-1.5 border border-[#143a48] rounded-md text-sm text-[#5395a8] hover:text-white transition-colors"
          title={filters.sortDirection === 'desc' ? 'Descending' : 'Ascending'}
        >
          {filters.sortDirection === 'desc' ? '↓' : '↑'}
        </button>

        <span className="text-sm text-[#5395a8]">{totalResults} results</span>
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
                ? 'border-[#aaf6ff] text-[#aaf6ff] bg-[#aaf6ff11]'
                : 'border-[#143a48] text-[#5395a8] hover:text-white'
            }`}
          >
            Authors
            {filters.authors.length > 0 ? ` (${filters.authors.length})` : ''}
          </button>
          {showAuthors && (
            <div className="absolute z-50 mt-1 w-64 bg-[#04141a] border border-[#143a48] rounded-md shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Filter authors..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  className="w-full bg-[#020a0d] border border-[#143a48] rounded px-2 py-1 text-xs text-[#cdf2fb] placeholder-[#235e6f] focus:outline-none"
                  autoFocus
                />
              </div>
              {filteredAuthors.slice(0, 30).map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAuthor(a)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#0a2b37] ${
                    filters.authors.includes(a) ? 'text-[#aaf6ff]' : 'text-[#cdf2fb]'
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
                ? 'border-[#aaf6ff] text-[#aaf6ff] bg-[#aaf6ff11]'
                : 'border-[#143a48] text-[#5395a8] hover:text-white'
            }`}
          >
            Labels
            {filters.labels.length > 0 ? ` (${filters.labels.length})` : ''}
          </button>
          {showLabels && (
            <div className="absolute z-50 mt-1 w-72 bg-[#04141a] border border-[#143a48] rounded-md shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Filter labels..."
                  value={labelSearch}
                  onChange={(e) => setLabelSearch(e.target.value)}
                  className="w-full bg-[#020a0d] border border-[#143a48] rounded px-2 py-1 text-xs text-[#cdf2fb] placeholder-[#235e6f] focus:outline-none"
                  autoFocus
                />
              </div>
              {filteredLabels.slice(0, 30).map((l) => (
                <button
                  key={l}
                  onClick={() => toggleLabel(l)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#0a2b37] ${
                    filters.labels.includes(l) ? 'text-[#aaf6ff]' : 'text-[#cdf2fb]'
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
          className="bg-[#020a0d] border border-[#143a48] rounded-md px-2 py-1 text-xs text-[#5395a8] focus:outline-none"
          placeholder="From"
        />
        <span className="text-xs text-[#235e6f]">to</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-[#020a0d] border border-[#143a48] rounded-md px-2 py-1 text-xs text-[#5395a8] focus:outline-none"
          placeholder="To"
        />

        <label className="flex items-center gap-1 text-xs text-[#5395a8] cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showDrafts}
            onChange={(e) => setShowDrafts(e.target.checked)}
            className="accent-[#aaf6ff]"
          />
          Drafts
        </label>

        <label
          className="flex items-center gap-1 text-xs text-[#5395a8] cursor-pointer"
          title="Show items you've hidden until the next sync"
        >
          <input
            type="checkbox"
            checked={filters.showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
            className="accent-[#ffb84d]"
          />
          Show hidden{hiddenCount > 0 ? ` (${hiddenCount})` : ''}
        </label>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-xs text-[#ff5874] border border-[#ff587433] rounded-full hover:bg-[#ff587411] transition-colors"
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
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#aaf6ff22] text-[#aaf6ff] rounded-full cursor-pointer hover:bg-[#aaf6ff33]"
            >
              @{a} ×
            </span>
          ))}
          {filters.labels.map((l) => (
            <span
              key={l}
              onClick={() => toggleLabel(l)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#36e3a822] text-[#36e3a8] rounded-full cursor-pointer hover:bg-[#36e3a833]"
            >
              {l} ×
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
