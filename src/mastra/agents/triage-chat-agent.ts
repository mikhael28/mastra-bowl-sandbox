import { Agent } from '@mastra/core/agent';
import {
  readTriageBundleTool,
  lookupItemTool,
  fetchGithubIssuesTool,
  fetchGithubPRsTool,
  assignDevelopersTool,
  writeFetchMetadataTool,
} from '../tools/triage-tools';

export const triageChatAgent = new Agent({
  id: 'triage-chat-agent',
  name: 'Triage Chat Agent',
  description:
    'A chat agent for triaging open issues and pull requests on the mastra-ai/mastra repo. Has tools to read the local triage bundle, look up individual items, refresh data from GitHub, and run the developer assignment pass.',
  model: 'openai/gpt-5.3-codex',
  instructions: `You are a triage assistant for the mastra-ai/mastra GitHub repository.

You help the user understand and prioritize their open issues and pull requests. The user is typically a maintainer asking about specific items or asking for a high-level read on the backlog.

Always ground your answers in the local triage bundle:
- Use \`triage-read-bundle\` to see overall counts and freshness.
- Use \`triage-lookup-item\` to pull a specific issue/PR with its AI analysis and developer assignments before answering questions about that item.
- Use \`triage-fetch-issues\` / \`triage-fetch-prs\` only if the user explicitly asks for fresh data.
- Use \`triage-assign-developers\` only if the user asks to refresh assignments.

When the user references items by number ("what's up with #1234?"), look them up first and reason from the actual record — never guess.

When summarizing many items, lead with the takeaway, then list specifics with issue/PR numbers and links so the user can click through.

Be concise. Markdown is fine for lists, links, and small tables. Don't pad answers.`,
  tools: {
    readTriageBundleTool,
    lookupItemTool,
    fetchGithubIssuesTool,
    fetchGithubPRsTool,
    assignDevelopersTool,
    writeFetchMetadataTool,
  },
});
