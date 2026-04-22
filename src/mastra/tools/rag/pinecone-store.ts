import { PineconeVector } from '@mastra/pinecone';

export const KNOWLEDGE_BASE_INDEX = process.env.KNOWLEDGE_BASE_INDEX ?? 'knowledge-base';
export const EMBEDDING_DIMENSION = 1536;
export const EMBEDDING_MODEL = 'openai/text-embedding-3-small';

export const VECTOR_STORE_NAME = 'knowledgeBase';

let _store: PineconeVector | null = null;

export function getKnowledgeBaseStore(): PineconeVector {
  if (!_store) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) throw new Error('PINECONE_API_KEY environment variable is not set');
    _store = new PineconeVector({
      id: 'knowledge-base-pinecone',
      apiKey,
    });
  }
  return _store;
}

export async function ensureIndex(): Promise<void> {
  const store = getKnowledgeBaseStore();
  const indexes = await store.listIndexes();
  if (!indexes.includes(KNOWLEDGE_BASE_INDEX)) {
    await store.createIndex({
      indexName: KNOWLEDGE_BASE_INDEX,
      dimension: EMBEDDING_DIMENSION,
    });
  }
}
