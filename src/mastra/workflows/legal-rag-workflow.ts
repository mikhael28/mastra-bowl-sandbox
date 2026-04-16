import { createStep, createWorkflow } from '@mastra/core/workflows';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import { embed } from 'ai';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import {
  getPineconeStore,
  LEGAL_INDEX,
  EMBEDDING_MODEL,
} from '../tools/legal/pinecone-store';

const searchResultSchema = z.object({
  id: z.string(),
  score: z.number(),
  documentName: z.string(),
  documentType: z.string(),
  chunkText: z.string(),
  pageNumber: z.number(),
  chunkIndex: z.number(),
  partyNames: z.string(),
  fullTextPath: z.string().optional(),
  sourceFilePath: z.string().optional(),
});

const stateSchema = z.object({
  query: z.string().optional(),
  caseId: z.string().optional(),
  clarifiedIntent: z.string().optional(),
  expandedQueries: z.array(z.string()).optional(),
  searchResults: z.array(searchResultSchema).optional(),
  gaps: z.array(z.string()).optional(),
  isSatisfactory: z.boolean().optional(),
  candidateDocumentName: z.string().optional(),
  fullDocumentText: z.string().optional(),
  answer: z.string().optional(),
});

const clarifyQuery = createStep({
  id: 'legal-clarify-query',
  inputSchema: z.object({
    query: z.string(),
    caseId: z.string(),
  }),
  outputSchema: z.object({}),
  stateSchema,
  resumeSchema: z.object({ clarifiedIntent: z.string() }),
  suspendSchema: z.object({ assistantMessage: z.string() }),
  execute: async ({ inputData, resumeData, suspend, setState, mastra }) => {
    if (!resumeData) {
      await setState({
        query: inputData.query,
        caseId: inputData.caseId,
      });

      const intentAgent = mastra.getAgent('intentClarifierAgent');
      const response = await intentAgent.generate(
        `A lawyer is searching their case documents. Their query: "${inputData.query}"
Case ID: ${inputData.caseId}

Generate 3 clarifying questions to help narrow the search. Focus on:
- Which specific document or document type they're looking for
- Which party or witness is relevant
- What specific detail or passage they need`,
        {
          structuredOutput: {
            schema: z.object({ questions: z.array(z.string()).length(3) }),
          },
        },
      );

      const questions = response.object.questions;
      const formatted = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');

      return suspend({
        assistantMessage: `To find exactly what you need, I have a few questions:\n\n${formatted}`,
      });
    }

    await setState({
      query: inputData.query,
      caseId: inputData.caseId,
      clarifiedIntent: resumeData.clarifiedIntent,
    });
    return {};
  },
});

const generateQueries = createStep({
  id: 'legal-generate-queries',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ state, setState, mastra }) => {
    const priorQueries = state.expandedQueries ?? [];
    const uniquePrior = [...new Set(priorQueries)];
    const priorText =
      uniquePrior.length > 0
        ? `\nPrevious queries (do NOT repeat):\n- ${uniquePrior.join('\n- ')}`
        : '';
    const gapsText = state.gaps?.length
      ? `\nKnown gaps:\n- ${state.gaps.join('\n- ')}`
      : '';

    const plannerAgent = mastra.getAgent('legalQueryPlannerAgent');
    const response = await plannerAgent.generate(
      `Legal research query: "${state.query}"
Clarified intent: "${state.clarifiedIntent ?? ''}"
Case: ${state.caseId}
${priorText}
${gapsText}

Generate 3-5 targeted vector search queries.`,
      {
        structuredOutput: {
          schema: z.object({ queries: z.array(z.string()).min(3).max(5) }),
        },
      },
    );

    const newQueries = response.object.queries;
    await setState({
      ...state,
      expandedQueries: [...(state.expandedQueries ?? []), ...newQueries],
    });
    return {};
  },
});

const vectorSearch = createStep({
  id: 'legal-vector-search',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ state, setState, mastra }) => {
    const log = mastra.getLogger();
    const store = getPineconeStore();
    const allQueries = state.expandedQueries ?? [];
    const newQueries = allQueries.slice(-5);
    const previousResults = state.searchResults ?? [];

    log.info('legal-vector-search', { queryCount: newQueries.length, caseId: state.caseId });

    const batchResults = await Promise.all(
      newQueries.map(async (searchQuery) => {
        const { embedding } = await embed({
          model: new ModelRouterEmbeddingModel(EMBEDDING_MODEL),
          value: searchQuery,
        });

        return store.query({
          indexName: LEGAL_INDEX,
          queryVector: embedding,
          topK: 10,
          namespace: state.caseId!,
        });
      }),
    );

    const newResults = batchResults
      .flat()
      .map((r) => ({
        id: r.id,
        score: r.score,
        documentName: r.metadata?.documentName ?? 'unknown',
        documentType: r.metadata?.documentType ?? 'unknown',
        chunkText: r.metadata?.text ?? '',
        pageNumber: r.metadata?.pageNumber ?? 0,
        chunkIndex: r.metadata?.chunkIndex ?? 0,
        partyNames: r.metadata?.partyNames ?? '',
        fullTextPath: r.metadata?.fullTextPath,
        sourceFilePath: r.metadata?.sourceFilePath,
      }));

    const combined = deduplicateByIdKeepBest([...previousResults, ...newResults]);

    await setState({
      ...state,
      searchResults: combined,
    });
    return {};
  },
});

const evaluateResults = createStep({
  id: 'legal-evaluate-results',
  inputSchema: z.object({}),
  outputSchema: z.object({
    isSatisfactory: z.boolean(),
    gaps: z.array(z.string()),
  }),
  stateSchema,
  execute: async ({ state, setState, mastra }) => {
    const evaluatorAgent = mastra.getAgent('legalResultEvaluatorAgent');
    const topResults = (state.searchResults ?? [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map((r) => ({
        documentName: r.documentName,
        documentType: r.documentType,
        score: r.score,
        pageNumber: r.pageNumber,
        text: r.chunkText.slice(0, 200),
        partyNames: r.partyNames,
      }));

    const response = await evaluatorAgent.generate(
      `Original query: "${state.query}"
Clarified intent: "${state.clarifiedIntent ?? ''}"
Case: ${state.caseId}

Top search results:
${JSON.stringify(topResults, null, 2)}

Are these results specific enough to answer the lawyer's question?`,
      {
        structuredOutput: {
          schema: z.object({
            isSatisfactory: z.boolean(),
            gaps: z.array(z.string()),
          }),
        },
      },
    );

    const { isSatisfactory, gaps } = response.object;
    await setState({ ...state, isSatisfactory, gaps });
    return { isSatisfactory, gaps };
  },
});

const readCandidateDocument = createStep({
  id: 'legal-read-candidate',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ state, setState, mastra }) => {
    const log = mastra.getLogger();
    const ranked = (state.searchResults ?? []).sort((a, b) => b.score - a.score);
    const best = ranked[0];

    if (!best?.fullTextPath) {
      log.warn('No full text path for top candidate');
      await setState({ ...state, candidateDocumentName: best?.documentName });
      return {};
    }

    try {
      let fullText = await readFile(best.fullTextPath, 'utf8');
      if (fullText.length > 50_000) {
        fullText = fullText.slice(0, 50_000) + '\n\n[...truncated]';
      }
      await setState({
        ...state,
        candidateDocumentName: best.documentName,
        fullDocumentText: fullText,
      });
    } catch (err) {
      log.warn('Failed to read candidate document', { path: best.fullTextPath, err: String(err) });
      await setState({ ...state, candidateDocumentName: best.documentName });
    }

    return {};
  },
});

const synthesizeAnswer = createStep({
  id: 'legal-synthesize-answer',
  inputSchema: z.object({}),
  outputSchema: z.object({
    answer: z.string(),
    caseId: z.string(),
    candidateDocument: z.string(),
  }),
  stateSchema,
  execute: async ({ state, setState, mastra }) => {
    const evaluatorAgent = mastra.getAgent('legalResultEvaluatorAgent');

    const topChunks = (state.searchResults ?? [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((r) => `[${r.documentName} p${r.pageNumber}]: ${r.chunkText}`)
      .join('\n\n');

    const context = state.fullDocumentText
      ? `FULL DOCUMENT (${state.candidateDocumentName}):\n${state.fullDocumentText}\n\nADDITIONAL RELEVANT CHUNKS:\n${topChunks}`
      : `RELEVANT CHUNKS:\n${topChunks}`;

    const stream = await evaluatorAgent.stream(
      `You are a legal research assistant. Answer this query precisely using ONLY the provided document context.

QUERY: "${state.query}"
CLARIFIED INTENT: "${state.clarifiedIntent ?? ''}"
CASE: ${state.caseId}

DOCUMENT CONTEXT:
${context}

Provide a precise, well-cited answer. Reference specific documents, page numbers, and quote relevant passages.`,
    );

    const answer = await stream.text;
    const caseId = state.caseId!;
    const candidateDocument = state.candidateDocumentName ?? 'none';

    await setState({ ...state, answer });
    return { answer, caseId, candidateDocument };
  },
});

const searchPass = createWorkflow({
  id: 'legal-search-pass',
  inputSchema: z.object({}),
  outputSchema: z.object({
    isSatisfactory: z.boolean(),
    gaps: z.array(z.string()),
  }),
  stateSchema,
})
  .then(generateQueries)
  .then(vectorSearch)
  .then(evaluateResults)
  .commit();

export const legalRag = createWorkflow({
  id: 'legal-rag',
  inputSchema: z.object({
    query: z.string(),
    caseId: z.string(),
  }),
  outputSchema: z.object({
    answer: z.string(),
    caseId: z.string(),
    candidateDocument: z.string(),
  }),
  stateSchema,
})
  .then(clarifyQuery)
  .dountil(searchPass, async ({ iterationCount, state }) => {
    return iterationCount >= 3 || !!state.isSatisfactory;
  })
  .then(readCandidateDocument)
  .then(synthesizeAnswer)
  .commit();

function deduplicateByIdKeepBest<T extends { id: string; score: number }>(results: T[]): T[] {
  const seen = new Map<string, T>();
  for (const r of results) {
    const existing = seen.get(r.id);
    if (!existing || existing.score < r.score) {
      seen.set(r.id, r);
    }
  }
  return Array.from(seen.values());
}
