import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getKnowledgeBaseStore, ensureIndex, KNOWLEDGE_BASE_INDEX } from './pinecone-store';

export const createCollectionTool = createTool({
  id: 'kb-create-collection',
  description:
    'Create a new knowledge-base collection. Ensures the Pinecone index exists and validates the collection ID. Each collection maps to a Pinecone namespace, so documents in different collections are fully isolated.',
  inputSchema: z.object({
    collectionId: z
      .string()
      .regex(
        /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
        'Collection ID must be lowercase alphanumeric with dashes, min 2 chars',
      )
      .describe('Unique collection identifier (e.g. "mastra-docs", "product-kb"). Lowercase letters, numbers, and dashes only.'),
    name: z.string().describe('Human-readable collection name (e.g. "Mastra Documentation")'),
    description: z.string().optional().describe('Brief description of the collection'),
  }),
  outputSchema: z.object({
    collectionId: z.string(),
    name: z.string(),
    status: z.string(),
  }),
  execute: async ({ collectionId, name }) => {
    await ensureIndex();
    return {
      collectionId,
      name,
      status: `Collection "${name}" (${collectionId}) is ready. Ingest documents with kb-ingest-document using this collectionId.`,
    };
  },
});

export const listCollectionsTool = createTool({
  id: 'kb-list-collections',
  description:
    'List all knowledge-base collections by querying Pinecone index statistics. Returns each collection namespace with its vector count.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    collections: z.array(
      z.object({
        collectionId: z.string(),
        vectorCount: z.number(),
      }),
    ),
    totalCollections: z.number(),
  }),
  execute: async () => {
    await ensureIndex();
    const store = getKnowledgeBaseStore();
    const stats = await store.describeIndex({ indexName: KNOWLEDGE_BASE_INDEX });

    const namespaces = (stats as any).namespaces ?? {};
    const collections = Object.entries(namespaces).map(([ns, info]: [string, any]) => ({
      collectionId: ns,
      vectorCount: info.recordCount ?? info.vectorCount ?? 0,
    }));

    return { collections, totalCollections: collections.length };
  },
});

export const describeCollectionTool = createTool({
  id: 'kb-describe-collection',
  description:
    'Get detailed statistics about a specific knowledge-base collection, including vector count.',
  inputSchema: z.object({
    collectionId: z.string().describe('Collection identifier to describe'),
  }),
  outputSchema: z.object({
    collectionId: z.string(),
    vectorCount: z.number(),
    indexName: z.string(),
  }),
  execute: async ({ collectionId }) => {
    await ensureIndex();
    const store = getKnowledgeBaseStore();
    const stats = await store.describeIndex({ indexName: KNOWLEDGE_BASE_INDEX });

    const namespaces = (stats as any).namespaces ?? {};
    const nsInfo = namespaces[collectionId];
    const vectorCount = nsInfo?.recordCount ?? nsInfo?.vectorCount ?? 0;

    return {
      collectionId,
      vectorCount,
      indexName: KNOWLEDGE_BASE_INDEX,
    };
  },
});

export const deleteCollectionDocumentTool = createTool({
  id: 'kb-delete-document',
  description:
    'Delete all vectors for a specific document within a collection. Use this to re-ingest a document or remove it from the collection.',
  requireApproval: true,
  inputSchema: z.object({
    collectionId: z.string().describe('Collection identifier'),
    documentName: z.string().describe('Exact document name to delete vectors for'),
  }),
  outputSchema: z.object({
    collectionId: z.string(),
    documentName: z.string(),
    status: z.string(),
  }),
  execute: async ({ collectionId, documentName }) => {
    const store = getKnowledgeBaseStore();
    await store.deleteVectors({
      indexName: KNOWLEDGE_BASE_INDEX,
      filter: { documentName },
      namespace: collectionId,
    });
    return {
      collectionId,
      documentName,
      status: `Deleted all vectors for "${documentName}" in collection ${collectionId}.`,
    };
  },
});
