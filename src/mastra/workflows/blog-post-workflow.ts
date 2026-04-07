import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { basedScorer } from '../scorers/based-scorer';

const scoredOutputSchema = z.object({
  finalCopy: z.string(),
  topic: z.string(),
  tone: z.string().optional(),
  basedScore: z.number(),
  basedReason: z.string(),
});

const writeDraft = createStep({
  id: 'write-draft',
  description: 'Uses the copywriter agent to write a blog post draft',
  inputSchema: z.object({
    topic: z.string().describe('The topic to write about'),
    tone: z
      .string()
      .optional()
      .describe('Desired tone (e.g. professional, casual, technical)'),
  }),
  outputSchema: z.object({
    draft: z.string(),
    topic: z.string(),
    tone: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData?.topic) {
      throw new Error('Topic is required');
    }

    const agent = mastra?.getAgent('copywriterAgent');
    if (!agent) {
      throw new Error('Copywriter agent not found');
    }

    const toneInstruction = inputData.tone
      ? ` Write in a ${inputData.tone} tone.`
      : '';

    const result = await agent.generate(
      `Create a blog post about ${inputData.topic}.${toneInstruction}`,
    );

    return {
      draft: result.text,
      topic: inputData.topic,
      tone: inputData.tone,
    };
  },
});

const editDraft = createStep({
  id: 'edit-draft',
  description: 'Uses the editor agent to refine the blog post draft',
  inputSchema: z.object({
    draft: z.string(),
    topic: z.string(),
    tone: z.string().optional(),
  }),
  outputSchema: z.object({
    finalCopy: z.string(),
    topic: z.string(),
    tone: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData?.draft) {
      throw new Error('Draft is required');
    }

    const agent = mastra?.getAgent('editorAgent');
    if (!agent) {
      throw new Error('Editor agent not found');
    }

    const result = await agent.generate(
      `Edit the following blog post, returning only the edited copy:\n\n${inputData.draft}`,
    );

    return {
      finalCopy: result.text,
      topic: inputData.topic,
      tone: inputData.tone,
    };
  },
});

const scoreBasedness = createStep({
  id: 'score-basedness',
  description: 'Evaluates the blog post with the Based scorer (0-10)',
  inputSchema: z.object({
    finalCopy: z.string(),
    topic: z.string(),
    tone: z.string().optional(),
  }),
  outputSchema: scoredOutputSchema,
  execute: async ({ inputData }) => {
    if (!inputData?.finalCopy) {
      throw new Error('Final copy is required');
    }

    const result = await basedScorer.run({
      output: { text: inputData.finalCopy },
    });

    return {
      finalCopy: inputData.finalCopy,
      topic: inputData.topic,
      tone: inputData.tone,
      basedScore: result.score,
      basedReason: result.reason ?? 'No reason provided',
    };
  },
});

const finalize = createStep({
  id: 'finalize',
  description: 'Passes through the final copy that scored high enough on the Based scale',
  inputSchema: scoredOutputSchema,
  outputSchema: scoredOutputSchema,
  execute: async ({ inputData }) => {
    return inputData!;
  },
});

const rewriteMoreBased = createStep({
  id: 'rewrite-more-based',
  description:
    'Takes the scored output, rewrites the topic to be more based, then re-drafts and re-edits',
  inputSchema: scoredOutputSchema,
  outputSchema: scoredOutputSchema,
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data is required');
    }

    const copywriter = mastra?.getAgent('copywriterAgent');
    const editor = mastra?.getAgent('editorAgent');
    if (!copywriter || !editor) {
      throw new Error('Agents not found');
    }

    // Step 1: Have the LLM rewrite the topic/brief to be more based
    const rewriteResult = await copywriter.generate(
      `The following blog post topic produced content that scored ${inputData.basedScore}/10 on the "based" scale. The feedback was: "${inputData.basedReason}"

Original topic: "${inputData.topic}"

Rewrite this topic as a short creative brief (2-3 sentences max) that will produce a MORE BASED blog post. Make it bolder, more opinionated, more authentic. Tell the writer to take a real stance, cut the corporate fluff, use vivid language, and write something people will actually remember. Do not write the blog post itself - just rewrite the brief/topic.`,
    );

    const basedTopic = rewriteResult.text;

    // Step 2: Write a new draft with the more based topic
    const toneInstruction = inputData.tone
      ? ` Write in a ${inputData.tone} tone.`
      : '';

    const draftResult = await copywriter.generate(
      `Create a blog post about: ${basedTopic}.${toneInstruction} Make it bold, authentic, and memorable. No hedging, no filler, no corporate slop.`,
    );

    // Step 3: Edit the new draft
    const editResult = await editor.generate(
      `Edit the following blog post. Keep the bold voice and strong opinions intact - do NOT soften the tone. Only fix grammar, flow, and clarity. Return only the edited copy:\n\n${draftResult.text}`,
    );

    // Step 4: Score the new version
    const scoreResult = await basedScorer.run({
      output: { text: editResult.text },
    });

    return {
      finalCopy: editResult.text,
      topic: basedTopic,
      tone: inputData.tone,
      basedScore: scoreResult.score,
      basedReason: scoreResult.reason ?? 'No reason provided',
    };
  },
});

const blogPostWorkflow = createWorkflow({
  id: 'blog-post-workflow',
  inputSchema: z.object({
    topic: z.string().describe('The topic to write a blog post about'),
    tone: z
      .string()
      .optional()
      .describe('Desired tone (e.g. professional, casual, technical)'),
  }),
  outputSchema: scoredOutputSchema,
})
  .then(writeDraft)
  .then(editDraft)
  .then(scoreBasedness)
  .branch([
    [
      async ({ inputData }) => (inputData?.basedScore ?? 0) >= 6,
      finalize,
    ],
    [
      async ({ inputData }) => (inputData?.basedScore ?? 0) < 6,
      rewriteMoreBased,
    ],
  ]);

blogPostWorkflow.commit();

export { blogPostWorkflow };
