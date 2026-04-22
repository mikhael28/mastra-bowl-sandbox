import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const WORKSPACE_ROOT = resolve(process.cwd(), 'workspace');
const RESEARCH_ROOT = join(WORKSPACE_ROOT, 'research');

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

type ExaResult = {
  title: string | null;
  url: string;
  publishedDate?: string;
  author?: string | null;
  summary?: string;
};

async function exaSearchWithSummary(query: string, numResults: number): Promise<ExaResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) throw new Error('EXA_API_KEY environment variable is not set');

  const response = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({
      query,
      numResults,
      type: 'auto',
      contents: { summary: true },
    }),
  });

  if (!response.ok) {
    throw new Error(`Exa API error (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as { results: ExaResult[] };
  return data.results;
}

async function saveSourceMarkdown(
  dir: string,
  query: string,
  r: ExaResult,
): Promise<string> {
  const filename = `${slugify(r.title || r.url)}.md`;
  const path = join(dir, filename);
  const body = [
    `# ${r.title ?? r.url}`,
    '',
    `- URL: ${r.url}`,
    `- Query: ${query}`,
    r.publishedDate ? `- Published: ${r.publishedDate}` : null,
    r.author ? `- Author: ${r.author}` : null,
    '',
    r.summary ? `## Summary\n\n${r.summary}\n` : null,
  ]
    .filter(Boolean)
    .join('\n');
  await writeFile(path, body, 'utf8');
  return path;
}

export const deepResearchTool = createTool({
  id: 'deep-research',
  description:
    'Run an iterative deep-research loop: plan queries, search Exa, evaluate coverage, and repeat until the topic is well-covered. Saves every source and the final Markdown answer into `workspace/research/<session>/`. Use this for nontrivial research questions where a single search is not enough.',
  inputSchema: z.object({
    query: z.string().describe('The research question or topic'),
    clarifiedIntent: z
      .string()
      .optional()
      .describe(
        'Any additional context or constraints already gathered from the user (e.g. budget, use case). Pass this in if you have it so the planner does not duplicate clarification work.',
      ),
    maxIterations: z
      .number()
      .min(1)
      .max(5)
      .optional()
      .describe('Max search/evaluate loops before returning (default 3)'),
    resultsPerQuery: z
      .number()
      .min(3)
      .max(20)
      .optional()
      .describe('Exa results per query (default 8)'),
  }),
  outputSchema: z.object({
    sessionId: z.string(),
    artifactPath: z.string(),
    sourceCount: z.number(),
    iterations: z.number(),
    answerIsSatisfactory: z.boolean(),
    gaps: z.array(z.string()),
    answer: z.string(),
  }),
  execute: async (
    inputData: {
      query: string;
      clarifiedIntent?: string;
      maxIterations?: number;
      resultsPerQuery?: number;
    },
    toolContext: any,
  ) => {
    const {
      query,
      clarifiedIntent = '',
      maxIterations = 3,
      resultsPerQuery = 8,
    } = inputData;
    const mastra = toolContext?.mastra;
    const log = mastra?.getLogger?.() ?? console;
    const writer = toolContext?.writer;
    const emit = async (phase: string, data: Record<string, unknown> = {}) => {
      await writer?.custom?.({
        type: 'data-deep-research-progress',
        data: { phase, ...data },
        transient: true,
      });
    };

    const sessionId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${slugify(query)}`;
    const sessionDir = join(RESEARCH_ROOT, sessionId);
    const sourcesDir = join(sessionDir, 'sources');
    await mkdir(sourcesDir, { recursive: true });
    await emit('session-created', { sessionId, maxIterations });
    await writeFile(
      join(sessionDir, 'query.md'),
      `# Research Session\n\n- Query: ${query}\n- Clarified intent: ${clarifiedIntent || '(none)'}\n- Started: ${new Date().toISOString()}\n`,
      'utf8',
    );

    const plannerAgent = mastra.getAgent('researchPlannerAgent');
    const evaluatorAgent = mastra.getAgent('searchResultEvaluatorAgent');
    const answererAgent = mastra.getAgent('answererAgent');

    const searchResults: Array<{
      query: string;
      results: ExaResult[];
    }> = [];
    let gaps: string[] = [];
    let answerIsSatisfactory = false;
    let iterations = 0;

    while (iterations < maxIterations && !answerIsSatisfactory) {
      iterations++;
      const priorQueries = [...new Set(searchResults.map((r) => r.query))];
      const priorText = priorQueries.length
        ? `\nPrevious queries (avoid repeating):\n- ${priorQueries.join('\n- ')}`
        : '';
      const gapsText = gaps.length ? `\nKnown gaps:\n- ${gaps.join('\n- ')}` : '';

      log.info('deepResearch plan', { iteration: iterations, sessionId });
      await emit('planning', { iteration: iterations });
      const planResp = await plannerAgent.generate(
        `User initial query: "${query}"
Additional context: "${clarifiedIntent}"
${priorText}
${gapsText}

Generate 3-5 focused search queries.`,
        {
          structuredOutput: {
            schema: z.object({ queries: z.array(z.string()).min(3).max(5) }),
          },
        },
      );
      const expandedQueries: string[] = planResp.object.queries;

      log.info('deepResearch search', {
        iteration: iterations,
        sessionId,
        queries: expandedQueries,
      });
      await emit('searching', { iteration: iterations, queries: expandedQueries });
      const batch = await Promise.all(
        expandedQueries.map(async (q) => {
          const results = await exaSearchWithSummary(q, resultsPerQuery);
          await Promise.all(
            results.map((r) =>
              saveSourceMarkdown(sourcesDir, q, r).catch((err) =>
                log.warn('saveSource failed', { url: r.url, err: String(err) }),
              ),
            ),
          );
          return { query: q, results };
        }),
      );
      searchResults.push(...batch);

      log.info('deepResearch evaluate', { iteration: iterations, sessionId });
      await emit('evaluating', {
        iteration: iterations,
        sourcesCollected: searchResults.reduce((n, r) => n + r.results.length, 0),
      });
      const evalResp = await evaluatorAgent.generate(
        `User query: "${query}"
Clarified intent: "${clarifiedIntent}"
Search results:
${JSON.stringify(searchResults, null, 2)}

Determine if the results are sufficient.`,
        {
          structuredOutput: {
            schema: z.object({
              answerIsSatisfactory: z.boolean(),
              gaps: z.array(z.string()),
            }),
          },
        },
      );
      answerIsSatisfactory = evalResp.object.answerIsSatisfactory;
      gaps = evalResp.object.gaps;
      log.info('deepResearch evaluated', {
        iteration: iterations,
        answerIsSatisfactory,
        gaps,
      });
    }

    const exhausted = !answerIsSatisfactory;
    const exhaustionNote = exhausted
      ? 'Note: We may not have all the information needed. Please provide your best attempt based on available information.\n'
      : '';

    await emit('answering', { iterations, satisfactory: answerIsSatisfactory });
    const answerStream = await answererAgent.stream(
      `Query: "${query}"
Clarified needs: "${clarifiedIntent}"
${exhaustionNote}
Based on the following search results, answer the user's question:
${JSON.stringify(searchResults, null, 2)}`,
    );
    const answer = await answerStream.text;

    const artifactPath = join(sessionDir, 'answer.md');
    await writeFile(artifactPath, answer, 'utf8');

    const htmlPath = join(sessionDir, 'answer.html');
    const escapedTitle = query.replace(/[<>&"']/g, (c) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c] as string,
    );
    const htmlBody = answer
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    await writeFile(
      htmlPath,
      `<!doctype html><html><head><meta charset="utf-8"><title>${escapedTitle}</title><style>body{font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;line-height:1.55;color:#222}pre{white-space:pre-wrap}</style></head><body><pre>${htmlBody}</pre></body></html>`,
      'utf8',
    );

    const sourceCount = searchResults.reduce((n, r) => n + r.results.length, 0);

    await writeFile(
      join(sessionDir, 'README.md'),
      `# ${query}\n\n- Session: ${sessionId}\n- Iterations: ${iterations}\n- Sources collected: ${sourceCount}\n- Satisfactory: ${answerIsSatisfactory}\n- Gaps: ${gaps.length ? gaps.join('; ') : '(none)'}\n\n## Files\n- \`answer.md\` — final Markdown answer\n- \`answer.html\` — printable HTML (open in browser → "Save as PDF")\n- \`sources/\` — one file per Exa result, with query and summary\n- \`query.md\` — original query and clarified intent\n`,
      'utf8',
    );
    log.info('deepResearch done', {
      sessionId,
      sourceCount,
      iterations,
      answerIsSatisfactory,
      artifactPath,
    });
    await emit('done', { sessionId, sourceCount, iterations, answerIsSatisfactory, artifactPath });

    return {
      sessionId,
      artifactPath,
      sourceCount,
      iterations,
      answerIsSatisfactory,
      gaps,
      answer,
    };
  },
});
