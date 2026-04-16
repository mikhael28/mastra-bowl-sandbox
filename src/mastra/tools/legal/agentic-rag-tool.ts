import { createTool } from '@mastra/core/tools';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import { embed } from 'ai';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import {
  getPineconeStore,
  LEGAL_INDEX,
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
  documentType: z.string(),
  chunkText: z.string(),
  score: z.number(),
  pageNumber: z.number(),
  chunkIndex: z.number(),
  partyNames: z.string(),
  sourceFilePath: z.string(),
});

export const agenticRagTool = createTool({
  id: 'legal-agentic-search',
  description: `Iterative agentic RAG search across a legal case's documents in Pinecone. This tool:
1. Uses an AI planner to generate targeted search queries for legal documents
2. Searches the case's vector store with each query
3. Evaluates whether results are specific enough for the lawyer's needs
4. Refines and re-searches up to 3 iterations if needed
5. Reads the FULL TEXT of the top candidate document(s) for precise answers

Use this for complex legal queries where a single vector search isn't enough — e.g., "Find the section where witness Smith discusses the contract amendment" or "What did the defendant say about the timeline of events?"`,
  inputSchema: z.object({
    query: z.string().describe('The legal research query'),
    caseId: z.string().describe('Case ID (Pinecone namespace) to search within'),
    maxIterations: z
      .number()
      .min(1)
      .max(5)
      .optional()
      .describe('Max search refinement iterations (default 3)'),
    partyFilter: z
      .string()
      .optional()
      .describe('Filter results to documents mentioning this party name'),
    documentTypeFilter: z
      .string()
      .optional()
      .describe('Filter to a specific document type (e.g. "deposition", "exhibit")'),
    topK: z
      .number()
      .optional()
      .describe('Results per query (default 10)'),
  }),
  outputSchema: z.object({
    answer: z.string(),
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
      caseId,
      maxIterations = 3,
      partyFilter,
      documentTypeFilter,
      topK = 10,
    } = input;

    const mastra = toolContext?.mastra;
    const log = mastra?.getLogger?.() ?? console;
    const store = getPineconeStore();

    const queryPlannerAgent = mastra.getAgent('legalQueryPlannerAgent');
    const resultEvaluatorAgent = mastra.getAgent('legalResultEvaluatorAgent');

    let iterations = 0;
    let gaps: string[] = [];
    let isSatisfactory = false;
    let allResults: VectorResult[] = [];
    const priorQueries: string[] = [];
    const searchHistory: SearchIteration[] = [];

    const buildFilter = () => {
      const conditions: Record<string, any>[] = [];
      if (partyFilter) {
        conditions.push({ partyNames: { $eq: partyFilter } });
      }
      if (documentTypeFilter) {
        conditions.push({ documentType: { $eq: documentTypeFilter } });
      }
      if (conditions.length === 0) return undefined;
      if (conditions.length === 1) return conditions[0];
      return { $and: conditions };
    };

    while (iterations < maxIterations && !isSatisfactory) {
      iterations++;
      log.info('legal-agentic-search iteration', { iteration: iterations, caseId, query });

      const priorText = priorQueries.length
        ? `\nPrevious queries (do NOT repeat these):\n- ${priorQueries.join('\n- ')}`
        : '';
      const gapsText = gaps.length
        ? `\nKnown gaps from previous iteration:\n- ${gaps.join('\n- ')}`
        : '';

      const planResp = await queryPlannerAgent.generate(
        `Legal research query: "${query}"
Case: ${caseId}
${priorText}
${gapsText}

Generate 3-5 targeted vector search queries to find the most relevant document chunks.`,
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
            indexName: LEGAL_INDEX,
            queryVector: embedding,
            topK,
            namespace: caseId,
            filter: buildFilter(),
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
          documentType: r.metadata?.documentType,
          pageNumber: r.metadata?.pageNumber,
          chunkIndex: r.metadata?.chunkIndex,
          text: r.metadata?.text?.slice(0, 200),
          partyNames: r.metadata?.partyNames,
        }));

      const evalResp = await resultEvaluatorAgent.generate(
        `Original query: "${query}"
Case: ${caseId}
Iteration: ${iterations} of ${maxIterations}

Top search results (sorted by relevance):
${JSON.stringify(topResultsSummary, null, 2)}

Evaluate: Are these results specific enough to answer the lawyer's question?
Consider: Do we have the right document? The right section? Enough context?`,
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

      log.info('legal-agentic-search evaluated', {
        iteration: iterations,
        isSatisfactory,
        gaps,
        totalResults: allResults.length,
      });
    }

    const ranked = allResults.sort((a, b) => b.score - a.score);
    const topResults = ranked.slice(0, 20);

    const sourceDocuments = topResults.map((r) => ({
      documentName: r.metadata?.documentName ?? 'unknown',
      documentType: r.metadata?.documentType ?? 'unknown',
      chunkText: r.metadata?.text ?? '',
      score: r.score,
      pageNumber: r.metadata?.pageNumber ?? 0,
      chunkIndex: r.metadata?.chunkIndex ?? 0,
      partyNames: r.metadata?.partyNames ?? '',
      sourceFilePath: r.metadata?.sourceFilePath ?? '',
    }));

    let fullDocumentContext: string | undefined;
    let candidateDocumentName: string | undefined;

    const bestMatch = ranked[0];
    if (bestMatch?.metadata?.fullTextPath) {
      try {
        candidateDocumentName = bestMatch.metadata.documentName;
        fullDocumentContext = await readFile(bestMatch.metadata.fullTextPath, 'utf8');

        if (fullDocumentContext.length > 50_000) {
          fullDocumentContext = fullDocumentContext.slice(0, 50_000) + '\n\n[...truncated, document exceeds 50k chars...]';
        }
      } catch {
        log.warn('Could not read full document text', {
          path: bestMatch.metadata.fullTextPath,
        });
      }
    }

    const contextForAnswer = fullDocumentContext
      ? `FULL DOCUMENT (${candidateDocumentName}):\n${fullDocumentContext}\n\nADDITIONAL RELEVANT CHUNKS:\n${sourceDocuments.slice(1, 10).map((d) => `[${d.documentName} p${d.pageNumber}]: ${d.chunkText}`).join('\n\n')}`
      : sourceDocuments.map((d) => `[${d.documentName} p${d.pageNumber} (score: ${d.score.toFixed(3)})]: ${d.chunkText}`).join('\n\n');

    const answerResp = await resultEvaluatorAgent.generate(
      `You are a legal research assistant. Answer this query precisely using ONLY the provided document context.

QUERY: "${query}"
CASE: ${caseId}

DOCUMENT CONTEXT:
${contextForAnswer}

Provide a precise, well-cited answer. Reference specific documents, page numbers, and quote relevant passages. If the context is insufficient, say so clearly.`,
    );

    return {
      answer: answerResp.text,
      sourceDocuments,
      fullDocumentContext: fullDocumentContext ? `[Full text of ${candidateDocumentName} loaded - ${fullDocumentContext.length} chars]` : undefined,
      candidateDocumentName,
      iterations,
      totalResultsScanned: allResults.length,
      searchHistory,
      isSatisfactory,
      gaps,
    };
  },
});

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
