import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const headlineSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  source: z.string(),
});

const searchResultsSchema = z.object({
  topic: z.string(),
  headlines: z.array(headlineSchema),
});

const fetchSportsHeadlines = createStep({
  id: 'fetch-sports-headlines',
  description: 'Searches for the latest sports headlines using Tavily and Exa',
  inputSchema: z.object({
    sportsTopic: z.string().optional(),
    aiTopic: z.string().optional(),
  }),
  outputSchema: searchResultsSchema,
  execute: async ({ inputData, mastra }) => {
    const topic = inputData?.sportsTopic || 'latest headlines in sports';

    const agent = mastra?.getAgent('newsAgent');
    if (!agent) {
      throw new Error('News agent not found');
    }

    const result = await agent.generate(
      `Search for the latest sports headlines about: "${topic}". Use the tavily-search tool with topic "news" and timeRange "week", and also use the exa-search tool with category "news". Then compile the top 8 most interesting headlines into a numbered list. For each headline, format it exactly as:

1. TITLE: [headline title]
   URL: [article url]
   SOURCE: [publication name]
   SNIPPET: [1-2 sentence summary]

Make sure to use the search tools first, then compile results from what they return.`,
    );

    const headlines = parseHeadlines(result.text);

    return {
      topic,
      headlines,
    };
  },
});

const fetchAIHeadlines = createStep({
  id: 'fetch-ai-headlines',
  description: 'Searches for the latest AI startup headlines using Tavily and Exa',
  inputSchema: z.object({
    sportsTopic: z.string().optional(),
    aiTopic: z.string().optional(),
  }),
  outputSchema: searchResultsSchema,
  execute: async ({ inputData, mastra }) => {
    const topic = inputData?.aiTopic || 'AI startup news and funding rounds';

    const agent = mastra?.getAgent('newsAgent');
    if (!agent) {
      throw new Error('News agent not found');
    }

    const result = await agent.generate(
      `Search for the latest AI startup and tech news about: "${topic}". Use the tavily-search tool with topic "news" and timeRange "week", and also use the exa-search tool with category "news". Then compile the top 8 most interesting headlines into a numbered list. For each headline, format it exactly as:

1. TITLE: [headline title]
   URL: [article url]
   SOURCE: [publication name]
   SNIPPET: [1-2 sentence summary]

Make sure to use the search tools first, then compile results from what they return.`,
    );

    const headlines = parseHeadlines(result.text);

    return {
      topic,
      headlines,
    };
  },
});

/**
 * Parses the agent's numbered headline list into structured data.
 * Handles the TITLE/URL/SOURCE/SNIPPET format.
 */
function parseHeadlines(
  text: string,
): Array<{ title: string; url: string; snippet: string; source: string }> {
  const headlines: Array<{
    title: string;
    url: string;
    snippet: string;
    source: string;
  }> = [];

  const blocks = text.split(/\n\d+\.\s+/);

  for (const block of blocks) {
    if (!block.trim()) continue;

    const titleMatch = block.match(/TITLE:\s*(.+)/i);
    const urlMatch = block.match(/URL:\s*(.+)/i);
    const sourceMatch = block.match(/SOURCE:\s*(.+)/i);
    const snippetMatch = block.match(/SNIPPET:\s*(.+)/i);

    if (titleMatch && urlMatch) {
      headlines.push({
        title: titleMatch[1].trim(),
        url: urlMatch[1].trim(),
        source: sourceMatch?.[1]?.trim() ?? 'Unknown',
        snippet: snippetMatch?.[1]?.trim() ?? '',
      });
    }
  }

  // If structured parsing failed, fall back to extracting any URLs and text
  if (headlines.length === 0) {
    const lines = text.split('\n').filter((l) => l.trim());
    for (const line of lines) {
      const urlMatch = line.match(/(https?:\/\/[^\s\)]+)/);
      if (urlMatch) {
        const title = line.replace(urlMatch[0], '').replace(/[\[\]\(\)]/g, '').trim();
        headlines.push({
          title: title || 'Untitled',
          url: urlMatch[1],
          source: new URL(urlMatch[1]).hostname.replace('www.', ''),
          snippet: '',
        });
      }
    }
  }

  return headlines;
}

const assembleReport = createStep({
  id: 'assemble-report',
  description: 'Combines sports and AI headlines into a formatted markdown report',
  inputSchema: z.object({
    'fetch-sports-headlines': searchResultsSchema.optional(),
    'fetch-ai-headlines': searchResultsSchema.optional(),
  }),
  outputSchema: z.object({
    markdown: z.string(),
    sportsTopic: z.string(),
    aiTopic: z.string(),
    totalHeadlines: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    const sportsData = inputData?.['fetch-sports-headlines'];
    const aiData = inputData?.['fetch-ai-headlines'];

    const agent = mastra?.getAgent('newsAgent');
    if (!agent) {
      throw new Error('News agent not found');
    }

    const sportsSection =
      sportsData && sportsData.headlines.length > 0
        ? sportsData.headlines
            .map(
              (h, i) =>
                `${i + 1}. **[${h.title}](${h.url})** — _${h.source}_\n   ${h.snippet}`,
            )
            .join('\n\n')
        : '_No sports headlines found._';

    const aiSection =
      aiData && aiData.headlines.length > 0
        ? aiData.headlines
            .map(
              (h, i) =>
                `${i + 1}. **[${h.title}](${h.url})** — _${h.source}_\n   ${h.snippet}`,
            )
            .join('\n\n')
        : '_No AI headlines found._';

    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const introResult = await agent.generate(
      `Write a 2-3 sentence punchy intro blurb for a newsletter called "Tech Touchdown" that covers the intersection of sports and AI/tech. Today's date is ${date}. The sports topic is "${sportsData?.topic ?? 'sports'}" and the AI topic is "${aiData?.topic ?? 'AI startups'}". Make it energetic and fun. Just the blurb, no headers or formatting.`,
    );

    const markdown = `# Tech Touchdown

> ${introResult.text}

_${date}_

---

## Sports Headlines: ${sportsData?.topic ?? 'Sports'}

${sportsSection}

---

## AI & Startup Headlines: ${aiData?.topic ?? 'AI Startups'}

${aiSection}

---

_Powered by Tavily, Exa, and Google News via Mastra_
`;

    const totalHeadlines =
      (sportsData?.headlines.length ?? 0) + (aiData?.headlines.length ?? 0);

    return {
      markdown,
      sportsTopic: sportsData?.topic ?? 'Sports',
      aiTopic: aiData?.topic ?? 'AI Startups',
      totalHeadlines,
    };
  },
});

const techTouchdownWorkflow = createWorkflow({
  id: 'tech-touchdown-workflow',
  inputSchema: z.object({
    sportsTopic: z
      .string()
      .optional()
      .describe('Sports topic to cover (default: latest headlines in sports)'),
    aiTopic: z
      .string()
      .optional()
      .describe('AI/tech topic to cover (default: AI startup news and funding rounds)'),
  }),
  outputSchema: z.object({
    markdown: z.string(),
    sportsTopic: z.string(),
    aiTopic: z.string(),
    totalHeadlines: z.number(),
  }),
})
  .parallel([fetchSportsHeadlines, fetchAIHeadlines])
  .then(assembleReport);

techTouchdownWorkflow.commit();

export { techTouchdownWorkflow };
