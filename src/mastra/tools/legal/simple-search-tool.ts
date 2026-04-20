import { createVectorQueryTool } from '@mastra/rag';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import { LEGAL_INDEX, EMBEDDING_MODEL } from './pinecone-store';

export const legalCaseSearchTool = createVectorQueryTool({
  id: 'legal-case-search',
  description:
    'Quick semantic search across a legal case\'s documents. Use this for straightforward lookups where a single search is likely sufficient — e.g., "find the indemnification clause" or "what is exhibit A?". For complex multi-step queries, use legal-agentic-search instead. Set the Pinecone namespace to the caseId via metadata filter.',
  vectorStoreName: 'legal-pinecone',
  indexName: LEGAL_INDEX,
  model: new ModelRouterEmbeddingModel(EMBEDDING_MODEL),
  enableFilter: true,
  includeSources: true,
  databaseConfig: {
    pinecone: {
      namespace: 'default',
    },
  },
});
