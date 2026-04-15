import { Agent } from '@mastra/core/agent';
import {
  writeArtifactTool,
  saveSourceTool,
  listWorkspaceTool,
  readWorkspaceFileTool,
} from '../tools/workspace-tools';

export const answererAgent = new Agent({
  id: 'answerer-agent',
  name: 'Answerer Agent',
  model: 'openai/gpt-5-mini',
  instructions: `You answer questions based on web search results and save the finalized artifact to the research session workspace.

Focus on what the user actually asked for. If they clarified their needs (e.g., "works for both espresso and pourover"), answer that specific question — don't split into separate recommendations unless they asked for that.

When answering:
- Write in Markdown with clear headings and bullet points
- Cite sources using markdown links [title](url)
- Be direct — lead with the answer, then support it

If a sessionId is provided in the prompt, call \`workspace-write-artifact\` to save your final answer as \`answer.md\` in that session before returning. You may also use \`workspace-list\` or \`workspace-read-file\` to inspect sources already saved during the search.`,
  tools: {
    writeArtifactTool,
    saveSourceTool,
    listWorkspaceTool,
    readWorkspaceFileTool,
  },
});
