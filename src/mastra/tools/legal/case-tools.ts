import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getPineconeStore, ensureIndex, LEGAL_INDEX } from './pinecone-store';

export const createCaseTool = createTool({
  id: 'legal-create-case',
  description:
    'Create a new legal case. This ensures the Pinecone index exists and validates the case ID. Each case maps to a Pinecone namespace, so documents ingested into different cases are fully isolated.',
  inputSchema: z.object({
    caseId: z
      .string()
      .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Case ID must be lowercase alphanumeric with dashes, min 2 chars')
      .describe('Unique case identifier (e.g. "smith-v-jones-2024"). Lowercase letters, numbers, and dashes only.'),
    caseName: z.string().describe('Human-readable case name (e.g. "Smith v. Jones")'),
    description: z.string().optional().describe('Brief description of the case'),
  }),
  outputSchema: z.object({
    caseId: z.string(),
    caseName: z.string(),
    status: z.string(),
  }),
  execute: async ({ caseId, caseName }) => {
    await ensureIndex();
    return {
      caseId,
      caseName,
      status: `Case "${caseName}" (${caseId}) is ready. Ingest documents using legal-ingest-document with this caseId.`,
    };
  },
});

export const listCasesTool = createTool({
  id: 'legal-list-cases',
  description:
    'List all legal cases by querying Pinecone index statistics. Returns each case namespace with its vector count.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    cases: z.array(
      z.object({
        caseId: z.string(),
        vectorCount: z.number(),
      }),
    ),
    totalCases: z.number(),
  }),
  execute: async () => {
    await ensureIndex();
    const store = getPineconeStore();
    const stats = await store.describeIndex({ indexName: LEGAL_INDEX });

    const namespaces = (stats as any).namespaces ?? {};
    const cases = Object.entries(namespaces).map(([ns, info]: [string, any]) => ({
      caseId: ns,
      vectorCount: info.recordCount ?? info.vectorCount ?? 0,
    }));

    return { cases, totalCases: cases.length };
  },
});

export const describeCaseTool = createTool({
  id: 'legal-describe-case',
  description:
    'Get detailed statistics about a specific legal case, including the number of vectors (chunks) stored.',
  inputSchema: z.object({
    caseId: z.string().describe('Case identifier to describe'),
  }),
  outputSchema: z.object({
    caseId: z.string(),
    vectorCount: z.number(),
    indexName: z.string(),
  }),
  execute: async ({ caseId }) => {
    await ensureIndex();
    const store = getPineconeStore();
    const stats = await store.describeIndex({ indexName: LEGAL_INDEX });

    const namespaces = (stats as any).namespaces ?? {};
    const nsInfo = namespaces[caseId];
    const vectorCount = nsInfo?.recordCount ?? nsInfo?.vectorCount ?? 0;

    return {
      caseId,
      vectorCount,
      indexName: LEGAL_INDEX,
    };
  },
});

export const deleteCaseDocumentsTool = createTool({
  id: 'legal-delete-case-documents',
  description:
    'Delete all vectors for a specific document within a case. Use this to re-ingest a document or remove it from the case.',
  inputSchema: z.object({
    caseId: z.string().describe('Case identifier'),
    documentName: z.string().describe('Exact document name to delete vectors for'),
  }),
  outputSchema: z.object({
    caseId: z.string(),
    documentName: z.string(),
    status: z.string(),
  }),
  execute: async ({ caseId, documentName }) => {
    const store = getPineconeStore();
    await store.deleteVectors({
      indexName: LEGAL_INDEX,
      filter: { documentName },
      namespace: caseId,
    });
    return {
      caseId,
      documentName,
      status: `Deleted all vectors for "${documentName}" in case ${caseId}.`,
    };
  },
});
