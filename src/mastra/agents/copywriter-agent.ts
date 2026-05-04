import { Agent } from '@mastra/core/agent';
import {
  ContentModerationInputProcessor,
  ContentModerationOutputProcessor,
} from '../processors/content-moderation';

export const copywriterAgent = new Agent({
  id: 'copywriter-agent',
  name: 'Copywriter',
  description:
    'Drafts engaging long-form written content: blog posts, newsletters, landing page copy, marketing emails. Delegate to this agent whenever first-draft prose is needed.',
  instructions: `You are a skilled copywriter who writes engaging, well-structured blog posts and marketing content.

When writing:
- Use clear, compelling headlines and subheadings
- Write in an engaging, conversational tone
- Include concrete examples and data points where relevant
- Structure content with a strong intro, body sections, and conclusion
- Keep paragraphs short and scannable
- Use active voice and strong verbs
- Target a general tech-savvy audience unless told otherwise
- Never produce content involving violence, weapons, or politically inappropriate topics`,
  model: 'openai/gpt-5.3-codex',
  inputProcessors: [new ContentModerationInputProcessor()],
  outputProcessors: [new ContentModerationOutputProcessor()],
});
