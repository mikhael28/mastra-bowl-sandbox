/**
 * Model pricing (USD per 1M tokens) used by the token/cost HUD and the
 * Observability trace detail. These are best-effort — real billing comes
 * from the provider — but they let the UI show an order-of-magnitude cost
 * so users can reason about the agent's spend.
 *
 * Add new models to PRICING as they ship. `resolvePricing` normalizes the
 * varied forms Mastra reports (`openai/gpt-5.1-codex`, `gpt-5.1-codex`,
 * `mastra/openai/gpt-5.1-codex`) to a single lookup key.
 */

export type TokenBreakdown = {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  totalTokens: number;
};

export type ModelPrice = {
  /** $ per 1M input tokens */
  input: number;
  /** $ per 1M output tokens */
  output: number;
  /** $ per 1M cached-read tokens (defaults to input price if unset) */
  cachedInput?: number;
};

/**
 * Keys are the canonical model id after stripping the provider prefix.
 * Prices are in US dollars per 1M tokens. Update as Mastra/OpenAI/Anthropic
 * publish new rates.
 */
export const PRICING: Record<string, ModelPrice> = {
  // OpenAI — flagship
  'gpt-5.1-codex': { input: 1.25, output: 10, cachedInput: 0.125 },
  'gpt-5': { input: 1.25, output: 10, cachedInput: 0.125 },
  'gpt-5-mini': { input: 0.25, output: 2, cachedInput: 0.025 },
  'gpt-4.1': { input: 2, output: 8, cachedInput: 0.5 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6, cachedInput: 0.1 },
  'gpt-4o': { input: 2.5, output: 10, cachedInput: 1.25 },
  'gpt-4o-mini': { input: 0.15, output: 0.6, cachedInput: 0.075 },
  // OpenAI embedding
  'text-embedding-3-small': { input: 0.02, output: 0 },
  'text-embedding-3-large': { input: 0.13, output: 0 },
  // Anthropic
  'claude-opus-4-7': { input: 15, output: 75, cachedInput: 1.5 },
  'claude-sonnet-4-6': { input: 3, output: 15, cachedInput: 0.3 },
  'claude-haiku-4-5': { input: 1, output: 5, cachedInput: 0.1 },
  // Google
  'gemini-2.5-pro': { input: 1.25, output: 10, cachedInput: 0.31 },
  'gemini-2.5-flash': { input: 0.3, output: 2.5, cachedInput: 0.075 },
};

/** Strip `mastra/` and `openai/` style prefixes to match PRICING keys. */
export function normalizeModelId(id: string | null | undefined): string {
  if (!id) return '';
  const parts = id.split('/');
  return parts[parts.length - 1].toLowerCase();
}

export function resolvePricing(modelId: string | null | undefined): ModelPrice | null {
  const key = normalizeModelId(modelId);
  if (!key) return null;
  if (PRICING[key]) return PRICING[key];
  // Fuzzy prefix match (e.g. "gpt-5.1-codex-2026-01" → gpt-5.1-codex).
  const match = Object.keys(PRICING).find((k) => key.startsWith(k));
  return match ? PRICING[match] : null;
}

export function breakdownFromUsage(usage: unknown): TokenBreakdown {
  const u = (usage ?? {}) as any;
  const inputTokens = num(u.inputTokens ?? u.promptTokens);
  const outputTokens = num(u.outputTokens ?? u.completionTokens);
  const cachedTokens = num(u.inputDetails?.cacheRead);
  const reasoningTokens = num(u.outputDetails?.reasoning);
  const totalTokens = num(u.totalTokens) || inputTokens + outputTokens;
  return { inputTokens, outputTokens, cachedTokens, reasoningTokens, totalTokens };
}

/** Compute USD cost. Returns `null` if we don't have pricing for the model. */
export function computeCost(
  breakdown: TokenBreakdown,
  modelId: string | null | undefined,
): number | null {
  const price = resolvePricing(modelId);
  if (!price) return null;
  const billableInput = Math.max(0, breakdown.inputTokens - breakdown.cachedTokens);
  const cachedPrice = price.cachedInput ?? price.input;
  const cost =
    (billableInput * price.input +
      breakdown.cachedTokens * cachedPrice +
      breakdown.outputTokens * price.output) /
    1_000_000;
  return cost;
}

export function formatCost(usd: number | null | undefined): string {
  if (usd == null || !isFinite(usd)) return '—';
  if (usd === 0) return '$0';
  if (usd < 0.0001) return '<$0.0001';
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatTokens(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return '—';
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(2)}k`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}

export function addBreakdown(a: TokenBreakdown, b: TokenBreakdown): TokenBreakdown {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cachedTokens: a.cachedTokens + b.cachedTokens,
    reasoningTokens: a.reasoningTokens + b.reasoningTokens,
    totalTokens: a.totalTokens + b.totalTokens,
  };
}

export const EMPTY_BREAKDOWN: TokenBreakdown = {
  inputTokens: 0,
  outputTokens: 0,
  cachedTokens: 0,
  reasoningTokens: 0,
  totalTokens: 0,
};

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : 0;
  return isFinite(n) ? n : 0;
}
