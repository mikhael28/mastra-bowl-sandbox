import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { copywriterAgent } from '../agents/copywriter-agent';
import { editorAgent } from '../agents/editor-agent';

export const copywriterTool = createTool({
  id: 'copywriter-agent',
  description:
    'Calls the copywriter agent to write blog post copy about a given topic.',
  inputSchema: z.object({
    topic: z.string().describe('The topic to write a blog post about'),
  }),
  outputSchema: z.object({
    copy: z.string().describe('The written blog post copy'),
  }),
  execute: async ({ topic }) => {
    const result = await copywriterAgent.generate(
      `Create a blog post about ${topic}`,
    );
    return { copy: result.text };
  },
});

export const editorTool = createTool({
  id: 'editor-agent',
  description:
    'Calls the editor agent to edit and refine blog post copy.',
  inputSchema: z.object({
    copy: z.string().describe('The blog post copy to edit'),
  }),
  outputSchema: z.object({
    copy: z.string().describe('The edited blog post copy'),
  }),
  execute: async ({ copy }) => {
    const result = await editorAgent.generate(
      `Edit the following blog post, returning only the edited copy:\n\n${copy}`,
    );
    return { copy: result.text };
  },
});
