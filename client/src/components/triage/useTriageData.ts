import { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../../lib/mastraClient';
import type {
  GitHubIssue,
  GitHubPullRequest,
  FetchMetadata,
  AnalysisResult,
  TriageResult,
} from './types';

interface TriageData {
  issues: GitHubIssue[];
  pullRequests: GitHubPullRequest[];
  metadata: FetchMetadata | null;
  analysis: AnalysisResult | null;
  triage: TriageResult | null;
  loading: boolean;
  error: string | null;
}

export interface TriageDataWithActions extends TriageData {
  setHidden: (kind: 'issue' | 'pr', number: number, hidden: boolean) => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Loads the triage bundle from `GET /triage/data` (registered by the
 * triage-data-route in src/mastra/routes/). The route reads workspace/triage
 * JSON, merges per-row hidden state from hidden.json, and returns one bundled
 * payload — same shape the original dashboard used to read from /data/*.json.
 */
export function useTriageData(): TriageDataWithActions {
  const [data, setData] = useState<TriageData>({
    issues: [],
    pullRequests: [],
    metadata: null,
    analysis: null,
    triage: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setData((d) => ({ ...d, loading: true, error: null }));
    try {
      const res = await fetch(apiUrl('/triage/data'));
      if (!res.ok) {
        throw new Error(
          `Triage data not available (${res.status}). Make sure the Mastra server is running and workspace/triage exists.`,
        );
      }
      const json = (await res.json()) as {
        issues: GitHubIssue[];
        pullRequests: GitHubPullRequest[];
        metadata: FetchMetadata | null;
        analysis: AnalysisResult | null;
        triage: TriageResult | null;
      };
      setData({
        issues: json.issues ?? [],
        pullRequests: json.pullRequests ?? [],
        metadata: json.metadata,
        analysis: json.analysis,
        triage: json.triage,
        loading: false,
        error: null,
      });
    } catch (err) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load triage data',
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setHidden = useCallback(
    async (kind: 'issue' | 'pr', number: number, hidden: boolean) => {
      setData((prev) => {
        if (kind === 'issue') {
          return {
            ...prev,
            issues: prev.issues.map((i) =>
              i.number === number ? { ...i, hidden: hidden || undefined } : i,
            ),
          };
        }
        return {
          ...prev,
          pullRequests: prev.pullRequests.map((p) =>
            p.number === number ? { ...p, hidden: hidden || undefined } : p,
          ),
        };
      });

      try {
        const res = await fetch(apiUrl('/triage/hidden'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, number, hidden }),
        });
        if (!res.ok) throw new Error(`Hide API returned ${res.status}`);
      } catch (err) {
        // Revert on failure.
        setData((prev) => {
          if (kind === 'issue') {
            return {
              ...prev,
              issues: prev.issues.map((i) =>
                i.number === number ? { ...i, hidden: !hidden || undefined } : i,
              ),
            };
          }
          return {
            ...prev,
            pullRequests: prev.pullRequests.map((p) =>
              p.number === number ? { ...p, hidden: !hidden || undefined } : p,
            ),
          };
        });
        console.error('Failed to persist hide state:', err);
      }
    },
    [],
  );

  return { ...data, setHidden, reload: load };
}
