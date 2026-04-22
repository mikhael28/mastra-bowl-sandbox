import { createTool } from '@mastra/core/tools';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import { MDocument } from '@mastra/rag';
import { embedMany } from 'ai';
import { z } from 'zod';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve, basename } from 'node:path';
import { parseDocument, parseRawText, type ParsedDocument } from './document-parser';
import {
  getKnowledgeBaseStore,
  ensureIndex,
  KNOWLEDGE_BASE_INDEX,
  EMBEDDING_MODEL,
} from './pinecone-store';

const WORKSPACE_ROOT = resolve(process.cwd(), 'workspace');
const KB_ROOT = join(WORKSPACE_ROOT, 'knowledge-base');

async function saveFullText(collectionId: string, documentName: string, text: string): Promise<string> {
  const dir = join(KB_ROOT, collectionId, 'full-text');
  await mkdir(dir, { recursive: true });
  const safeName = documentName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = join(dir, `${safeName}.txt`);
  await writeFile(path, text, 'utf8');
  return path;
}

const ingestInputShape = {
  collectionId: z
    .string()
    .describe('Collection identifier (used as Pinecone namespace). Use lowercase-with-dashes.'),
  documentName: z
    .string()
    .optional()
    .describe('Human-readable document name. Defaults to the filename or a generated ID.'),
  sourceType: z
    .string()
    .optional()
    .describe('Free-form label for the source (e.g. "pdf", "webpage", "transcript", "api-response")'),
  sourceUri: z
    .string()
    .optional()
    .describe('Origin of the document — a URL, file path, or identifier'),
  tags: z
    .array(z.string())
    .optional()
    .describe('Free-form tags for metadata filtering (e.g. ["pricing", "q3-2025"])'),
  extraMetadata: z
    .record(z.string(), z.any())
    .optional()
    .describe('Any additional key/value metadata to attach to every chunk'),
};

async function ingestParsed(opts: {
  parsed: ParsedDocument;
  collectionId: string;
  documentName: string;
  sourceType: string;
  sourceUri?: string;
  tags: string[];
  extraMetadata: Record<string, any>;
}) {
  const { parsed, collectionId, documentName, sourceType, sourceUri, tags, extraMetadata } = opts;

  const fullTextPath = await saveFullText(collectionId, documentName, parsed.text);

  const doc = MDocument.fromText(parsed.text);
  const chunks = await doc.chunk({
    strategy: 'recursive',
    maxSize: 512,
    overlap: 50,
  });

  if (chunks.length === 0) {
    return {
      documentId: `${collectionId}--${documentName}--empty`,
      chunksCreated: 0,
      collectionId,
      fullTextPath,
      documentName,
    };
  }

  const { embeddings } = await embedMany({
    model: new ModelRouterEmbeddingModel(EMBEDDING_MODEL),
    values: chunks.map((chunk) => chunk.text),
  });

  const documentId = `${collectionId}--${documentName.replace(/[^a-zA-Z0-9._-]/g, '_')}--${Date.now()}`;
  const dateCreated = new Date().toISOString();

  const metadata = chunks.map((chunk, i) => ({
    text: chunk.text,
    collectionId,
    documentName,
    sourceType,
    sourceUri: sourceUri ?? '',
    tags,
    dateCreated,
    pageNumber: parsed.pageCount ? Math.ceil(((i + 1) / chunks.length) * parsed.pageCount) : 0,
    chunkIndex: i,
    totalChunks: chunks.length,
    fullTextPath,
    documentId,
    format: parsed.format,
    ...extraMetadata,
  }));

  const ids = chunks.map((_, i) => `${documentId}--chunk-${i}`);

  await ensureIndex();

  const store = getKnowledgeBaseStore();
  await store.upsert({
    indexName: KNOWLEDGE_BASE_INDEX,
    vectors: embeddings,
    metadata,
    ids,
    namespace: collectionId,
  });

  return {
    documentId,
    chunksCreated: chunks.length,
    collectionId,
    fullTextPath,
    documentName,
  };
}

export const ingestDocumentTool = createTool({
  id: 'kb-ingest-document',
  description:
    'Ingest a document file into a knowledge-base collection. Parses the file (PDF, DOCX, XLSX, CSV, Markdown, TXT, JPG, PNG), chunks it, generates embeddings, and stores vectors in Pinecone under the collection namespace.',
  inputSchema: z.object({
    ...ingestInputShape,
    filePath: z.string().describe('Absolute path to the document file'),
  }),
  outputSchema: z.object({
    documentId: z.string(),
    chunksCreated: z.number(),
    collectionId: z.string(),
    fullTextPath: z.string(),
    documentName: z.string(),
  }),
  execute: async (input) => {
    const parsed = await parseDocument(input.filePath);
    const documentName = input.documentName ?? basename(input.filePath);
    return ingestParsed({
      parsed,
      collectionId: input.collectionId,
      documentName,
      sourceType: input.sourceType ?? parsed.format,
      sourceUri: input.sourceUri ?? input.filePath,
      tags: input.tags ?? [],
      extraMetadata: input.extraMetadata ?? {},
    });
  },
});

export const ingestTextTool = createTool({
  id: 'kb-ingest-text',
  description:
    'Ingest raw text content into a knowledge-base collection without needing a file on disk. Useful for ingesting API responses, scraped pages, or programmatically generated content.',
  inputSchema: z.object({
    ...ingestInputShape,
    text: z.string().describe('The raw text to ingest'),
    documentName: z
      .string()
      .describe('Document name (required for raw-text ingestion — no filename to fall back on)'),
  }),
  outputSchema: z.object({
    documentId: z.string(),
    chunksCreated: z.number(),
    collectionId: z.string(),
    fullTextPath: z.string(),
    documentName: z.string(),
  }),
  execute: async (input) => {
    const parsed = await parseRawText(input.text, input.sourceType ?? 'text');
    return ingestParsed({
      parsed,
      collectionId: input.collectionId,
      documentName: input.documentName,
      sourceType: input.sourceType ?? 'text',
      sourceUri: input.sourceUri,
      tags: input.tags ?? [],
      extraMetadata: input.extraMetadata ?? {},
    });
  },
});

export const batchIngestTool = createTool({
  id: 'kb-batch-ingest',
  description:
    'Ingest multiple documents into a knowledge-base collection at once. All documents land in the same collection namespace.',
  inputSchema: z.object({
    collectionId: z.string().describe('Collection identifier (Pinecone namespace)'),
    documents: z.array(
      z.object({
        filePath: z.string(),
        documentName: z.string().optional(),
        sourceType: z.string().optional(),
        sourceUri: z.string().optional(),
        tags: z.array(z.string()).optional(),
        extraMetadata: z.record(z.string(), z.any()).optional(),
      }),
    ),
  }),
  outputSchema: z.object({
    collectionId: z.string(),
    totalDocuments: z.number(),
    totalChunks: z.number(),
    results: z.array(
      z.object({
        documentName: z.string(),
        chunksCreated: z.number(),
        success: z.boolean(),
        error: z.string().optional(),
      }),
    ),
  }),
  execute: async ({ collectionId, documents }) => {
    await ensureIndex();
    let totalChunks = 0;

    const results = await Promise.all(
      documents.map(async (doc) => {
        const docName = doc.documentName ?? basename(doc.filePath);
        try {
          const parsed = await parseDocument(doc.filePath);
          const result = await ingestParsed({
            parsed,
            collectionId,
            documentName: docName,
            sourceType: doc.sourceType ?? parsed.format,
            sourceUri: doc.sourceUri ?? doc.filePath,
            tags: doc.tags ?? [],
            extraMetadata: doc.extraMetadata ?? {},
          });
          totalChunks += result.chunksCreated;
          return {
            documentName: docName,
            chunksCreated: result.chunksCreated,
            success: true,
          };
        } catch (err) {
          return {
            documentName: docName,
            chunksCreated: 0,
            success: false,
            error: String(err),
          };
        }
      }),
    );

    return {
      collectionId,
      totalDocuments: documents.length,
      totalChunks,
      results,
    };
  },
});

export { ingestParsed };
