import { PineconeVector } from '@mastra/pinecone';

export const LEGAL_INDEX = 'legal-cases';
export const EMBEDDING_DIMENSION = 1536;
export const EMBEDDING_MODEL = 'openai/text-embedding-3-small';

let _store: PineconeVector | null = null;

export function getPineconeStore(): PineconeVector {
  if (!_store) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) throw new Error('PINECONE_API_KEY environment variable is not set');
    _store = new PineconeVector({
      id: 'legal-pinecone',
      apiKey,
    });
  }
  return _store;
}

export async function ensureIndex(): Promise<void> {
  const store = getPineconeStore();
  const indexes = await store.listIndexes();
  if (!indexes.includes(LEGAL_INDEX)) {
    await store.createIndex({
      indexName: LEGAL_INDEX,
      dimension: EMBEDDING_DIMENSION,
    });
  }
}
