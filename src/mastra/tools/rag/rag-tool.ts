import { createTool } from '@mastra/core/tools';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import { embed } from 'ai';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import {
  getKnowledgeBaseStore,
  KNOWLEDGE_BASE_INDEX,
  EMBEDDING_MODEL,
} from './pinecone-store';

type VectorResult = {
  id: string;
  score: number;
  metadata?: Record<string, any>;
};

type SearchIteration = {
  iteration: number;
  queries: string[];
  resultCount: number;
  topScores: number[];
};

const sourceDocumentSchema = z.object({
  documentName: z.string(),
  sourceType: z.string(),
  sourceUri: z.string(),
  chunkText: z.string(),
  score: z.number(),
  pageNumber: z.number(),
  chunkIndex: z.number(),
  tags: z.array(z.string()),
});

const modeSchema = z
  .enum(['auto', 'quick', 'deep'])
  .describe(
    'Search mode. "quick" = single embedding + top-K query (fast, best for simple lookups). "deep" = iterative multi-query agentic loop with evaluator + full-text read of best candidate (thorough, best for complex questions). "auto" = let an LLM classifier choose based on query complexity.',
  );

export const ragSearchTool = createTool({
  id: 'kb-search',
  description: `Unified RAG search against a knowledge-base collection in Pinecone.

This is the primary retrieval tool. It supports three modes:
- **quick**: single embedding search, returns top-K chunks. Best for lookups like "what's our refund policy?"
- **deep**: iterative agentic RAG — plans multiple queries, evaluates coverage, refines up to N times, then reads the FULL TEXT of the best candidate for a well-cited answer. Best for complex questions like "find the section where the customer describes the outage timeline".
- **auto** (default): an LLM classifies query complexity and picks the appropriate mode.

Results are scoped to a single collection (Pinecone namespace). Optional metadata filters (sourceType, tags) narrow results further.`,
  inputSchema: z.object({
    query: z.string().describe('The user question or research query'),
    collectionId: z.string().describe('Collection ID (Pinecone namespace) to search within'),
    mode: modeSchema.optional(),
    maxIterations: z
      .number()
      .min(1)
      .max(5)
      .optional()
      .describe('Max refinement iterations in deep mode (default 3). Ignored in quick mode.'),
    topK: z.number().optional().describe('Results per query (default 10)'),
    sourceTypeFilter: z
      .string()
      .optional()
      .describe('Restrict results to a specific sourceType (e.g. "pdf", "webpage")'),
    tagFilter: z
      .string()
      .optional()
      .describe('Restrict results to chunks tagged with this value'),
  }),
  outputSchema: z.object({
    answer: z.string(),
    modeUsed: z.enum(['quick', 'deep']),
    sourceDocuments: z.array(sourceDocumentSchema),
    fullDocumentContext: z.string().optional(),
    candidateDocumentName: z.string().optional(),
    iterations: z.number(),
    totalResultsScanned: z.number(),
    searchHistory: z.array(
      z.object({
        iteration: z.number(),
        queries: z.array(z.string()),
        resultCount: z.number(),
        topScores: z.array(z.number()),
      }),
    ),
    isSatisfactory: z.boolean(),
    gaps: z.array(z.string()),
  }),
  execute: async (input, toolContext: any) => {
    const {
      query,
      collectionId,
      mode = 'auto',
      maxIterations = 3,
      topK = 10,
      sourceTypeFilter,
      tagFilter,
    } = input;

    const mastra = toolContext?.mastra;
    const log = mastra?.getLogger?.() ?? console;

    const filter = buildFilter({ sourceTypeFilter, tagFilter });

    const resolvedMode = mode === 'auto' ? await classifyMode(query, mastra) : mode;

    log.info('kb-search', { mode: resolvedMode, collectionId, query });

    if (resolvedMode === 'quick') {
      return runQuick({ query, collectionId, topK, filter, log });
    }

    return runDeep({
      query,
      collectionId,
      topK,
      maxIterations,
      filter,
      mastra,
      log,
    });
  },
});

async function classifyMode(query: string, mastra: any): Promise<'quick' | 'deep'> {
  // Heuristic first: short, simple factual queries → quick. Multi-part or investigative → deep.
  if (!mastra) return 'quick';
  const planner = mastra.getAgent?.('queryPlannerAgent');
  if (!planner) return 'quick';

  const resp = await planner.generate(
    `Classify this retrieval query as either "quick" or "deep".

- "quick" = a single embedding search over the knowledge base will likely find the answer. Typical for direct factual lookups, definitions, or simple "what is X" / "where is Y" questions.
- "deep" = the question is investigative, multi-part, ambiguous, or needs precise citations from a specific document section. Worth spending multiple iterations and reading the full source document.

Query: "${query}"`,
    {
      structuredOutput: {
        schema: z.object({
          mode: z.enum(['quick', 'deep']),
          reason: z.string(),
        }),
      },
    },
  );

  return resp.object.mode;
}

function buildFilter(opts: { sourceTypeFilter?: string; tagFilter?: string }): Record<string, any> | undefined {
  const conditions: Record<string, any>[] = [];
  if (opts.sourceTypeFilter) conditions.push({ sourceType: { $eq: opts.sourceTypeFilter } });
  if (opts.tagFilter) conditions.push({ tags: { $in: [opts.tagFilter] } });
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return { $and: conditions };
}

async function runQuick(opts: {
  query: string;
  collectionId: string;
  topK: number;
  filter: Record<string, any> | undefined;
  log: any;
}) {
  const { query, collectionId, topK, filter, log } = opts;
  const store = getKnowledgeBaseStore();

  const { embedding } = await embed({
    model: new ModelRouterEmbeddingModel(EMBEDDING_MODEL),
    value: query,
  });

  const results = await store.query({
    indexName: KNOWLEDGE_BASE_INDEX,
    queryVector: embedding,
    topK,
    namespace: collectionId,
    filter,
  });

  const ranked = results.sort((a, b) => b.score - a.score);
  log.info('kb-search quick', { results: ranked.length, topScore: ranked[0]?.score });

  const sourceDocuments = ranked.map(toSourceDocument);
  const answer = ranked.length
    ? formatQuickAnswer(query, ranked)
    : `No results found in collection "${collectionId}" for: "${query}"`;

  return {
    answer,
    modeUsed: 'quick' as const,
    sourceDocuments,
    fullDocumentContext: undefined,
    candidateDocumentName: undefined,
    iterations: 1,
    totalResultsScanned: ranked.length,
    searchHistory: [
      {
        iteration: 1,
        queries: [query],
        resultCount: ranked.length,
        topScores: ranked.slice(0, 5).map((r) => r.score),
      },
    ],
    isSatisfactory: ranked.length > 0 && (ranked[0]?.score ?? 0) >= 0.7,
    gaps: [],
  };
}

function formatQuickAnswer(query: string, results: VectorResult[]): string {
  const top = results.slice(0, 5);
  const body = top
    .map((r) => {
      const name = r.metadata?.documentName ?? 'unknown';
      const page = r.metadata?.pageNumber ? ` p${r.metadata.pageNumber}` : '';
      const score = r.score.toFixed(3);
      const text = (r.metadata?.text ?? '').slice(0, 600);
      return `[${name}${page} · score ${score}]\n${text}`;
    })
    .join('\n\n---\n\n');
  return `Top ${top.length} results for "${query}":\n\n${body}`;
}

async function runDeep(opts: {
  query: string;
  collectionId: string;
  topK: number;
  maxIterations: number;
  filter: Record<string, any> | undefined;
  mastra: any;
  log: any;
}) {
  const { query, collectionId, topK, maxIterations, filter, mastra, log } = opts;

  if (!mastra) {
    throw new Error('kb-search deep mode requires mastra context (agents must be registered)');
  }

  const planner = mastra.getAgent('queryPlannerAgent');
  const evaluator = mastra.getAgent('retrievalEvaluatorAgent');
  const store = getKnowledgeBaseStore();

  let iterations = 0;
  let gaps: string[] = [];
  let isSatisfactory = false;
  let allResults: VectorResult[] = [];
  const priorQueries: string[] = [];
  const searchHistory: SearchIteration[] = [];

  while (iterations < maxIterations && !isSatisfactory) {
    iterations++;

    const priorText = priorQueries.length
      ? `\nPrevious queries (do NOT repeat these):\n- ${priorQueries.join('\n- ')}`
      : '';
    const gapsText = gaps.length ? `\nKnown gaps from last iteration:\n- ${gaps.join('\n- ')}` : '';

    const planResp = await planner.generate(
      `Research query: "${query}"
Collection: ${collectionId}
${priorText}
${gapsText}

Generate 3-5 targeted vector-search queries to find the most relevant chunks.`,
      {
        structuredOutput: {
          schema: z.object({ queries: z.array(z.string()).min(3).max(5) }),
        },
      },
    );

    const expandedQueries: string[] = planResp.object.queries;
    priorQueries.push(...expandedQueries);

    const iterationResults: VectorResult[] = [];
    await Promise.all(
      expandedQueries.map(async (searchQuery) => {
        const { embedding } = await embed({
          model: new ModelRouterEmbeddingModel(EMBEDDING_MODEL),
          value: searchQuery,
        });
        const results = await store.query({
          indexName: KNOWLEDGE_BASE_INDEX,
          queryVector: embedding,
          topK,
          namespace: collectionId,
          filter,
        });
        iterationResults.push(...results);
      }),
    );

    const deduped = deduplicateResults([...allResults, ...iterationResults]);
    allResults = deduped;

    const topScores = iterationResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => r.score);

    searchHistory.push({
      iteration: iterations,
      queries: expandedQueries,
      resultCount: iterationResults.length,
      topScores,
    });

    const topResultsSummary = deduped
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map((r) => ({
        score: r.score,
        documentName: r.metadata?.documentName,
        sourceType: r.metadata?.sourceType,
        pageNumber: r.metadata?.pageNumber,
        chunkIndex: r.metadata?.chunkIndex,
        text: r.metadata?.text?.slice(0, 200),
        tags: r.metadata?.tags,
      }));

    const evalResp = await evaluator.generate(
      `Original query: "${query}"
Collection: ${collectionId}
Iteration: ${iterations} of ${maxIterations}

Top search results (sorted by relevance):
${JSON.stringify(topResultsSummary, null, 2)}

Are these results specific enough to answer the user's question?`,
      {
        structuredOutput: {
          schema: z.object({
            isSatisfactory: z.boolean(),
            gaps: z.array(z.string()),
            bestCandidateDocument: z.string().optional(),
          }),
        },
      },
    );

    isSatisfactory = evalResp.object.isSatisfactory;
    gaps = evalResp.object.gaps;

    log.info('kb-search deep evaluated', {
      iteration: iterations,
      isSatisfactory,
      totalResults: allResults.length,
    });
  }

  const ranked = allResults.sort((a, b) => b.score - a.score);
  const topResults = ranked.slice(0, 20);
  const sourceDocuments = topResults.map(toSourceDocument);

  let fullDocumentContext: string | undefined;
  let candidateDocumentName: string | undefined;

  const bestMatch = ranked[0];
  if (bestMatch?.metadata?.fullTextPath) {
    try {
      candidateDocumentName = bestMatch.metadata.documentName;
      fullDocumentContext = await readFile(bestMatch.metadata.fullTextPath, 'utf8');
      if (fullDocumentContext.length > 50_000) {
        fullDocumentContext =
          fullDocumentContext.slice(0, 50_000) + '\n\n[...truncated, document exceeds 50k chars...]';
      }
    } catch {
      log.warn('Could not read full document text', { path: bestMatch.metadata.fullTextPath });
    }
  }

  const contextForAnswer = fullDocumentContext
    ? `FULL DOCUMENT (${candidateDocumentName}):\n${fullDocumentContext}\n\nADDITIONAL RELEVANT CHUNKS:\n${sourceDocuments
        .slice(1, 10)
        .map((d) => `[${d.documentName} p${d.pageNumber}]: ${d.chunkText}`)
        .join('\n\n')}`
    : sourceDocuments
        .map(
          (d) =>
            `[${d.documentName} p${d.pageNumber} (score: ${d.score.toFixed(3)})]: ${d.chunkText}`,
        )
        .join('\n\n');

  const answerResp = await evaluator.generate(
    `Answer this query precisely using ONLY the provided context.

QUERY: "${query}"
COLLECTION: ${collectionId}

CONTEXT:
${contextForAnswer}

Provide a precise, well-cited answer. Reference specific documents, page numbers where available, and quote relevant passages. If the context is insufficient, say so clearly.`,
  );

  return {
    answer: answerResp.text,
    modeUsed: 'deep' as const,
    sourceDocuments,
    fullDocumentContext: fullDocumentContext
      ? `[Full text of ${candidateDocumentName} loaded - ${fullDocumentContext.length} chars]`
      : undefined,
    candidateDocumentName,
    iterations,
    totalResultsScanned: allResults.length,
    searchHistory,
    isSatisfactory,
    gaps,
  };
}

function toSourceDocument(r: VectorResult) {
  return {
    documentName: r.metadata?.documentName ?? 'unknown',
    sourceType: r.metadata?.sourceType ?? 'unknown',
    sourceUri: r.metadata?.sourceUri ?? '',
    chunkText: r.metadata?.text ?? '',
    score: r.score,
    pageNumber: r.metadata?.pageNumber ?? 0,
    chunkIndex: r.metadata?.chunkIndex ?? 0,
    tags: Array.isArray(r.metadata?.tags) ? r.metadata!.tags : [],
  };
}

function deduplicateResults(results: VectorResult[]): VectorResult[] {
  const seen = new Map<string, VectorResult>();
  for (const r of results) {
    const existing = seen.get(r.id);
    if (!existing || existing.score < r.score) {
      seen.set(r.id, r);
    }
  }
  return Array.from(seen.values());
}
