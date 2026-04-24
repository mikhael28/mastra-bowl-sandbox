/**
 * Convert a workflow's serialized `stepGraph` (from GET /api/workflows/:id)
 * into a band-based layout the UI can render. Each workflow is a vertical
 * sequence of "bands". A band holds one or more parallel lanes, and each
 * lane holds one step (or, for loops, an inner step + loop metadata).
 *
 * We intentionally model this as a flat list of bands rather than a general
 * DAG. Mastra workflows are structured: `then → parallel → branch → dountil`
 * compose like boxes stacked vertically, not like arbitrary graphs — so a
 * linear band list renders exactly what the user wrote.
 */

export type StepMeta = {
  id: string;
  description?: string;
  canSuspend?: boolean;
};

export type Lane =
  | { kind: 'step'; step: StepMeta }
  | { kind: 'loop'; step: StepMeta; loopType?: 'until' | 'while'; condition?: string };

export type Band =
  | { kind: 'single'; lane: Lane }
  | {
      kind: 'parallel';
      lanes: Lane[];
    }
  | {
      kind: 'branch';
      lanes: Lane[];
      /** Human-readable condition per lane (from serializedConditions). */
      conditions: string[];
    };

export function parseStepGraph(raw: unknown): Band[] {
  if (!Array.isArray(raw)) return [];
  const bands: Band[] = [];
  for (const node of raw) {
    const b = parseNode(node);
    if (b) bands.push(b);
  }
  return bands;
}

function parseNode(node: any): Band | null {
  if (!node || typeof node !== 'object') return null;
  const t = node.type;
  switch (t) {
    case 'step': {
      const step = normStep(node.step);
      return step ? { kind: 'single', lane: { kind: 'step', step } } : null;
    }
    case 'parallel': {
      const lanes: Lane[] = (node.steps ?? [])
        .map(parseLane)
        .filter((l: Lane | null): l is Lane => !!l);
      return { kind: 'parallel', lanes };
    }
    case 'conditional': {
      const lanes: Lane[] = (node.steps ?? [])
        .map(parseLane)
        .filter((l: Lane | null): l is Lane => !!l);
      const conds: string[] = (node.serializedConditions ?? []).map(
        (c: any) => prettifyCondition(c?.fn ?? ''),
      );
      // Pad conditions to lane count.
      while (conds.length < lanes.length) conds.push('otherwise');
      return { kind: 'branch', lanes, conditions: conds };
    }
    case 'loop': {
      // Loop nodes wrap a single inner step; shape:
      //   { type: 'loop', step: {...}, serializedCondition, loopType }
      const step = normStep(node.step);
      if (!step) return null;
      return {
        kind: 'single',
        lane: {
          kind: 'loop',
          step,
          loopType: node.loopType === 'while' ? 'while' : 'until',
          condition: prettifyCondition(node.serializedCondition?.fn ?? ''),
        },
      };
    }
    default:
      return null;
  }
}

function parseLane(entry: any): Lane | null {
  if (!entry || typeof entry !== 'object') return null;
  if (entry.type === 'step') {
    const step = normStep(entry.step);
    return step ? { kind: 'step', step } : null;
  }
  if (entry.type === 'loop') {
    const step = normStep(entry.step);
    if (!step) return null;
    return {
      kind: 'loop',
      step,
      loopType: entry.loopType === 'while' ? 'while' : 'until',
      condition: prettifyCondition(entry.serializedCondition?.fn ?? ''),
    };
  }
  return null;
}

function normStep(s: any): StepMeta | null {
  if (!s || typeof s !== 'object') return null;
  if (typeof s.id !== 'string') return null;
  return {
    id: s.id,
    description: typeof s.description === 'string' ? s.description : undefined,
    canSuspend: !!s.canSuspend,
  };
}

/**
 * Turn a serialized function body (always an arrow-function string) into a
 * short human-readable label. Example input:
 *
 *   "async ({ inputData }) => (inputData?.basedScore ?? 0) >= 6"
 *
 * Output: `(inputData?.basedScore ?? 0) >= 6`. Not perfect — good enough to
 * tell two branches apart at a glance.
 */
function prettifyCondition(fnStr: string): string {
  if (!fnStr) return '';
  const m = fnStr.match(/=>\s*(.+)$/s);
  const body = m ? m[1].trim() : fnStr.trim();
  // Strip trailing `;` and wrapping braces if someone used block bodies.
  const cleaned = body.replace(/^\{/, '').replace(/\}$/, '').trim();
  return cleaned.length > 120 ? cleaned.slice(0, 117) + '…' : cleaned;
}

/** Return every step id in graph order — used to map run state onto nodes. */
export function collectStepIds(bands: Band[]): string[] {
  const out: string[] = [];
  for (const b of bands) {
    if (b.kind === 'single') out.push(b.lane.step.id);
    else for (const l of b.lanes) out.push(l.step.id);
  }
  return out;
}
