import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const tavilyResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  score: z.number(),
});

export const tavilySearch = createTool({
  id: 'tavily-search',
  description:
    'Searches the web using the Tavily Search API and returns relevant results with titles, URLs, and content snippets.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    topic: z
      .enum(['general', 'news'])
      .optional()
      .describe('Search topic category (default: general)'),
    maxResults: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .describe('Maximum number of results to return (default: 5)'),
    timeRange: z
      .enum(['day', 'week', 'month', 'year'])
      .optional()
      .describe('Time range filter for results'),
    searchDepth: z
      .enum(['basic', 'advanced'])
      .optional()
      .describe('Search depth (basic = faster, advanced = more thorough)'),
  }),
  outputSchema: z.object({
    query: z.string(),
    results: z.array(tavilyResultSchema),
    answer: z.string().optional(),
    responseTime: z.number(),
  }),
  execute: async ({ query, topic, maxResults, timeRange, searchDepth }) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY environment variable is not set');
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        topic: topic ?? 'general',
        max_results: maxResults ?? 5,
        time_range: timeRange,
        search_depth: searchDepth ?? 'basic',
        include_answer: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tavily API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      query: string;
      answer?: string;
      results: Array<{
        title: string;
        url: string;
        content: string;
        score: number;
      }>;
      response_time: number;
    };

    return {
      query: data.query,
      results: data.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
      answer: data.answer,
      responseTime: data.response_time,
    };
  },
});
