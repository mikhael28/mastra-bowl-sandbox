import { createStep, createWorkflow } from '@mastra/core/workflows';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import { embed } from 'ai';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import {
  getKnowledgeBaseStore,
  KNOWLEDGE_BASE_INDEX,
  EMBEDDING_MODEL,
} from '../tools/rag/pinecone-store';

const searchResultSchema = z.object({
  id: z.string(),
  score: z.number(),
  documentName: z.string(),
  sourceType: z.string(),
  chunkText: z.string(),
  pageNumber: z.number(),
  chunkIndex: z.number(),
  tags: z.array(z.string()),
  fullTextPath: z.string().optional(),
  sourceUri: z.string().optional(),
});

const stateSchema = z.object({
  query: z.string().optional(),
  collectionId: z.string().optional(),
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
  id: 'rag-clarify-query',
  inputSchema: z.object({
    query: z.string(),
    collectionId: z.string(),
  }),
  outputSchema: z.object({}),
  stateSchema,
  resumeSchema: z.object({ clarifiedIntent: z.string() }),
  suspendSchema: z.object({ assistantMessage: z.string() }),
  execute: async ({ inputData, resumeData, suspend, setState, mastra }) => {
    if (!resumeData) {
      await setState({
        query: inputData.query,
        collectionId: inputData.collectionId,
      });

      const intentAgent = mastra.getAgent('intentClarifierAgent');
      const response = await intentAgent.generate(
        `A user is searching a knowledge-base collection. Their query: "${inputData.query}"
Collection: ${inputData.collectionId}

Generate 3 clarifying questions to help narrow the search. Focus on:
- Which specific document, topic, or subtopic they're interested in
- What level of detail they need (overview vs. precise citation)
- Any entities, versions, or time periods that should scope the search`,
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
      collectionId: inputData.collectionId,
      clarifiedIntent: resumeData.clarifiedIntent,
    });
    return {};
  },
});

const generateQueries = createStep({
  id: 'rag-generate-queries',
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
    const gapsText = state.gaps?.length ? `\nKnown gaps:\n- ${state.gaps.join('\n- ')}` : '';

    const plannerAgent = mastra.getAgent('queryPlannerAgent');
    const response = await plannerAgent.generate(
      `Research query: "${state.query}"
Clarified intent: "${state.clarifiedIntent ?? ''}"
Collection: ${state.collectionId}
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
  id: 'rag-vector-search',
  inputSchema: z.object({}),
  outputSchema: z.object({}),
  stateSchema,
  execute: async ({ state, setState, mastra }) => {
    const log = mastra.getLogger();
    const store = getKnowledgeBaseStore();
    const allQueries = state.expandedQueries ?? [];
    const newQueries = allQueries.slice(-5);
    const previousResults = state.searchResults ?? [];

    log.info('rag-vector-search', {
      queryCount: newQueries.length,
      collectionId: state.collectionId,
    });

    const batchResults = await Promise.all(
      newQueries.map(async (searchQuery) => {
        const { embedding } = await embed({
          model: new ModelRouterEmbeddingModel(EMBEDDING_MODEL),
          value: searchQuery,
        });
        return store.query({
          indexName: KNOWLEDGE_BASE_INDEX,
          queryVector: embedding,
          topK: 10,
          namespace: state.collectionId!,
        });
      }),
    );

    const newResults = batchResults.flat().map((r) => ({
      id: r.id,
      score: r.score,
      documentName: r.metadata?.documentName ?? 'unknown',
      sourceType: r.metadata?.sourceType ?? 'unknown',
      chunkText: r.metadata?.text ?? '',
      pageNumber: r.metadata?.pageNumber ?? 0,
      chunkIndex: r.metadata?.chunkIndex ?? 0,
      tags: Array.isArray(r.metadata?.tags) ? r.metadata!.tags : [],
      fullTextPath: r.metadata?.fullTextPath,
      sourceUri: r.metadata?.sourceUri,
    }));

    const combined = deduplicateByIdKeepBest([...previousResults, ...newResults]);

    await setState({ ...state, searchResults: combined });
    return {};
  },
});

const evaluateResults = createStep({
  id: 'rag-evaluate-results',
  inputSchema: z.object({}),
  outputSchema: z.object({
    isSatisfactory: z.boolean(),
    gaps: z.array(z.string()),
  }),
  stateSchema,
  execute: async ({ state, setState, mastra }) => {
    const evaluatorAgent = mastra.getAgent('retrievalEvaluatorAgent');
    const topResults = (state.searchResults ?? [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map((r) => ({
        documentName: r.documentName,
        sourceType: r.sourceType,
        score: r.score,
        pageNumber: r.pageNumber,
        text: r.chunkText.slice(0, 200),
        tags: r.tags,
      }));

    const response = await evaluatorAgent.generate(
      `Original query: "${state.query}"
Clarified intent: "${state.clarifiedIntent ?? ''}"
Collection: ${state.collectionId}

Top search results:
${JSON.stringify(topResults, null, 2)}

Are these results specific enough to answer the user's question?`,
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
  id: 'rag-read-candidate',
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
      log.warn('Failed to read candidate document', {
        path: best.fullTextPath,
        err: String(err),
      });
      await setState({ ...state, candidateDocumentName: best.documentName });
    }

    return {};
  },
});

const synthesizeAnswer = createStep({
  id: 'rag-synthesize-answer',
  inputSchema: z.object({}),
  outputSchema: z.object({
    answer: z.string(),
    collectionId: z.string(),
    candidateDocument: z.string(),
  }),
  stateSchema,
  execute: async ({ state, setState, mastra }) => {
    const evaluatorAgent = mastra.getAgent('retrievalEvaluatorAgent');

    const topChunks = (state.searchResults ?? [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((r) => `[${r.documentName} p${r.pageNumber}]: ${r.chunkText}`)
      .join('\n\n');

    const context = state.fullDocumentText
      ? `FULL DOCUMENT (${state.candidateDocumentName}):\n${state.fullDocumentText}\n\nADDITIONAL RELEVANT CHUNKS:\n${topChunks}`
      : `RELEVANT CHUNKS:\n${topChunks}`;

    const stream = await evaluatorAgent.stream(
      `Answer this query precisely using ONLY the provided context.

QUERY: "${state.query}"
CLARIFIED INTENT: "${state.clarifiedIntent ?? ''}"
COLLECTION: ${state.collectionId}

CONTEXT:
${context}

Provide a precise, well-cited answer. Reference specific documents, page numbers where available, and quote relevant passages.`,
    );

    const answer = await stream.text;
    const collectionId = state.collectionId!;
    const candidateDocument = state.candidateDocumentName ?? 'none';

    await setState({ ...state, answer });
    return { answer, collectionId, candidateDocument };
  },
});

const searchPass = createWorkflow({
  id: 'rag-search-pass',
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

export const ragWorkflow = createWorkflow({
  id: 'rag-workflow',
  inputSchema: z.object({
    query: z.string(),
    collectionId: z.string(),
  }),
  outputSchema: z.object({
    answer: z.string(),
    collectionId: z.string(),
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
