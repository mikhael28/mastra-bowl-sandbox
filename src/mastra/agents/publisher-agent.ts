import { Agent } from '@mastra/core/agent';
import { copywriterTool, editorTool } from '../tools/content-tools';
import {
  ContentModerationInputProcessor,
  ContentModerationOutputProcessor,
} from '../processors/content-moderation';
import { basedScorer } from '../scorers/based-scorer';

export const publisherAgent = new Agent({
  id: 'publisher-agent',
  name: 'Publisher',
  instructions: `You are a publisher agent that orchestrates the content creation process by coordinating a copywriter and an editor.

Your workflow:
1. When asked to create content, first call the copywriter-agent tool to generate the initial draft
2. Then call the editor-agent tool to refine and polish the draft
3. Return the final edited copy to the user

When responding:
- Always use both the copywriter and editor tools in sequence
- Do not write the content yourself - delegate to the specialized agents
- You may add a brief note about the topic before presenting the final copy
- If the user has specific requirements (tone, length, audience), include them in the topic passed to the copywriter
- Return only the final edited version, not both drafts
- Never produce content involving violence, weapons, or politically inappropriate topics`,
  model: 'openai/gpt-5-mini',
  tools: { copywriterTool, editorTool },
  inputProcessors: [new ContentModerationInputProcessor()],
  outputProcessors: [new ContentModerationOutputProcessor()],
  scorers: {
    based: {
      scorer: basedScorer,
      sampling: {
        type: 'ratio',
        rate: 1,
      },
    },
  },
});
