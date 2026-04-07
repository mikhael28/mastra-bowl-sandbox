import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const exaResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  publishedDate: z.string().optional(),
  author: z.string().optional(),
  text: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const exaSearch = createTool({
  id: 'exa-search',
  description:
    'Searches the web using the Exa Search API, which excels at finding high-quality, semantically relevant content. Returns results with titles, URLs, and optionally full text or highlights.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    numResults: z
      .number()
      .min(1)
      .max(30)
      .optional()
      .describe('Number of results to return (default: 5)'),
    category: z
      .enum(['company', 'research paper', 'news', 'personal site', 'financial report', 'people'])
      .optional()
      .describe('Category filter to narrow results'),
    includeText: z
      .boolean()
      .optional()
      .describe('Whether to include full page text in results (default: false)'),
    startPublishedDate: z
      .string()
      .optional()
      .describe('Filter results published after this date (ISO 8601, e.g. 2024-01-01T00:00:00.000Z)'),
  }),
  outputSchema: z.object({
    query: z.string(),
    results: z.array(exaResultSchema),
  }),
  execute: async ({ query, numResults, category, includeText, startPublishedDate }) => {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      throw new Error('EXA_API_KEY environment variable is not set');
    }

    const body: Record<string, unknown> = {
      query,
      numResults: numResults ?? 5,
      type: 'auto',
    };

    if (category) body.category = category;
    if (startPublishedDate) body.startPublishedDate = startPublishedDate;

    if (includeText) {
      body.contents = { text: true, highlights: true };
    } else {
      body.contents = { highlights: true };
    }

    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Exa API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      results: Array<{
        title: string;
        url: string;
        publishedDate?: string;
        author?: string;
        text?: string;
        highlights?: string[];
      }>;
    };

    return {
      query,
      results: data.results.map((r) => ({
        title: r.title,
        url: r.url,
        publishedDate: r.publishedDate,
        author: r.author,
        text: r.text,
        highlights: r.highlights,
      })),
    };
  },
});
