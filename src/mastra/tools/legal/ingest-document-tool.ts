import { createTool } from '@mastra/core/tools';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import { MDocument } from '@mastra/rag';
import { embedMany } from 'ai';
import { z } from 'zod';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve, basename } from 'node:path';
import { parseDocument } from './document-parser';
import {
  getPineconeStore,
  ensureIndex,
  LEGAL_INDEX,
  EMBEDDING_MODEL,
} from './pinecone-store';

const WORKSPACE_ROOT = resolve(process.cwd(), 'workspace');
const LEGAL_ROOT = join(WORKSPACE_ROOT, 'legal', 'cases');

async function saveFullText(caseId: string, documentName: string, text: string): Promise<string> {
  const dir = join(LEGAL_ROOT, caseId, 'full-text');
  await mkdir(dir, { recursive: true });
  const safeName = documentName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = join(dir, `${safeName}.txt`);
  await writeFile(path, text, 'utf8');
  return path;
}

export const ingestDocumentTool = createTool({
  id: 'legal-ingest-document',
  description:
    'Ingest a document into a legal case. Parses the file (PDF, DOCX, XLSX, CSV, Markdown, TXT, or images), chunks it, generates embeddings, and stores vectors in Pinecone under the case namespace. Returns the number of chunks created and the document ID.',
  inputSchema: z.object({
    filePath: z.string().describe('Absolute path to the document file'),
    caseId: z
      .string()
      .describe('Case identifier (used as Pinecone namespace). Use lowercase-with-dashes.'),
    documentName: z
      .string()
      .optional()
      .describe('Human-readable document name. Defaults to the filename.'),
    documentType: z
      .enum([
        'deposition',
        'exhibit',
        'motion',
        'brief',
        'contract',
        'correspondence',
        'transcript',
        'pleading',
        'discovery',
        'report',
        'other',
      ])
      .optional()
      .describe('Type of legal document'),
    partyNames: z
      .array(z.string())
      .optional()
      .describe('Names of related parties (witnesses, plaintiffs, defendants, etc.)'),
  }),
  outputSchema: z.object({
    documentId: z.string(),
    chunksCreated: z.number(),
    caseId: z.string(),
    fullTextPath: z.string(),
    documentName: z.string(),
  }),
  execute: async (input) => {
    const {
      filePath,
      caseId,
      documentType = 'other',
      partyNames = [],
    } = input;
    const documentName = input.documentName ?? basename(filePath);

    const parsed = await parseDocument(filePath);

    const fullTextPath = await saveFullText(caseId, documentName, parsed.text);

    const doc = MDocument.fromText(parsed.text);
    const chunks = await doc.chunk({
      strategy: 'recursive',
      maxSize: 512,
      overlap: 50,
    });

    const { embeddings } = await embedMany({
      model: new ModelRouterEmbeddingModel(EMBEDDING_MODEL),
      values: chunks.map((chunk) => chunk.text),
    });

    const documentId = `${caseId}--${documentName.replace(/[^a-zA-Z0-9._-]/g, '_')}--${Date.now()}`;
    const dateCreated = new Date().toISOString();

    const metadata = chunks.map((chunk, i) => ({
      text: chunk.text,
      caseId,
      documentName,
      documentType,
      dateCreated,
      pageNumber: parsed.pageCount ? Math.ceil(((i + 1) / chunks.length) * parsed.pageCount) : 0,
      chunkIndex: i,
      totalChunks: chunks.length,
      partyNames: partyNames.join(', '),
      sourceFilePath: filePath,
      fullTextPath,
      documentId,
      format: parsed.format,
    }));

    const ids = chunks.map((_, i) => `${documentId}--chunk-${i}`);

    await ensureIndex();

    const store = getPineconeStore();
    await store.upsert({
      indexName: LEGAL_INDEX,
      vectors: embeddings,
      metadata,
      ids,
      namespace: caseId,
    });

    return {
      documentId,
      chunksCreated: chunks.length,
      caseId,
      fullTextPath,
      documentName,
    };
  },
});

export const batchIngestTool = createTool({
  id: 'legal-batch-ingest',
  description:
    'Ingest multiple documents into a legal case at once. Provide an array of file paths with optional metadata for each. All documents are processed and stored in the same case namespace.',
  inputSchema: z.object({
    caseId: z.string().describe('Case identifier (Pinecone namespace)'),
    documents: z.array(
      z.object({
        filePath: z.string(),
        documentName: z.string().optional(),
        documentType: z
          .enum([
            'deposition',
            'exhibit',
            'motion',
            'brief',
            'contract',
            'correspondence',
            'transcript',
            'pleading',
            'discovery',
            'report',
            'other',
          ])
          .optional(),
        partyNames: z.array(z.string()).optional(),
      }),
    ),
  }),
  outputSchema: z.object({
    caseId: z.string(),
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
  execute: async ({ caseId, documents }) => {
    await ensureIndex();
    let totalChunks = 0;

    const results = await Promise.all(
      documents.map(async (doc) => {
        const docName = doc.documentName ?? basename(doc.filePath);
        try {
          const result = await ingestDocumentTool.execute!({
            ...doc,
            caseId,
            documentName: docName,
          } as any, {} as any);
          totalChunks += (result as any).chunksCreated;
          return {
            documentName: docName,
            chunksCreated: (result as any).chunksCreated,
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
      caseId,
      totalDocuments: documents.length,
      totalChunks,
      results,
    };
  },
});
