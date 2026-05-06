import { registerApiRoute } from '@mastra/core/server';
import {
  readTriageBundle,
  setHiddenFlag,
} from '../tools/triage-tools';

/**
 * GET /triage/data
 * Returns the bundled triage state read from workspace/triage:
 *   { issues, pullRequests, metadata, analysis, triage }
 *
 * The dashboard makes one fetch on mount and re-renders from this payload.
 */
export const triageDataRoute = registerApiRoute('/triage/data', {
  method: 'GET',
  handler: async (c) => {
    try {
      const bundle = await readTriageBundle();
      return c.json(bundle);
    } catch (err: any) {
      return c.json({ error: String(err?.message ?? err) }, 500);
    }
  },
});

/**
 * POST /triage/hidden
 * Body: { kind: "issue" | "pr", number: number, hidden: boolean }
 *
 * Persists per-row "hidden" state to workspace/triage/hidden.json so the
 * dashboard's "hide this row" action survives reloads. Stored separately
 * from the main issues.json / pull-requests.json so we don't have to
 * rewrite multi-MB files on every toggle.
 */
export const triageHiddenRoute = registerApiRoute('/triage/hidden', {
  method: 'POST',
  handler: async (c) => {
    try {
      const body = (await c.req.json()) as {
        kind?: string;
        number?: number;
        hidden?: boolean;
      };
      if (
        (body.kind !== 'issue' && body.kind !== 'pr') ||
        typeof body.number !== 'number' ||
        typeof body.hidden !== 'boolean'
      ) {
        return c.json({ error: 'Invalid body' }, 400);
      }
      await setHiddenFlag(body.kind, body.number, body.hidden);
      return c.json({ ok: true });
    } catch (err: any) {
      return c.json({ error: String(err?.message ?? err) }, 500);
    }
  },
});
